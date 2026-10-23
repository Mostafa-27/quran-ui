"use client";

import { useEffect, useState, useRef } from "react";
import { useQuranStore } from "@/lib/store";
import { useQuranAudio } from "@/hooks/useQuranAudio";
import { useMushafFitScale } from "@/hooks/useMushafFitScale";
import { useQpcPageFont } from "@/hooks/useQpcPageFont";
import { fetchPage } from "@/lib/api";
import type { Verse } from "@/lib/types";
import MushafPage from "./MushafPage";

interface MushafViewerProps {
  initialPage?: number;
  initialVerses?: Verse[];
}

export default function MushafViewer({
  initialPage = 1,
  initialVerses,
}: MushafViewerProps) {
  const verses = useQuranStore((s) => s.verses);
  const currentPage = useQuranStore((s) => s.currentPage);
  const reciterId = useQuranStore((s) => s.reciterId);
  const setVerses = useQuranStore((s) => s.setVerses);
  const setAudioFiles = useQuranStore((s) => s.setAudioFiles);
  const syncCurrentChapter = useQuranStore((s) => s.syncCurrentChapter);
  const getCachedPage = useQuranStore((s) => s.getCachedPage);
  const cachePage = useQuranStore((s) => s.cachePage);
  const clearAutoPlay = useQuranStore((s) => s.clearAutoPlay);

  const { playAyah } = useQuranAudio();
  const { fontName, ready: fontReady } = useQpcPageFont(currentPage);
  const [isLoading, setIsLoading] = useState(false);
  const initializedRef = useRef(false);
  const inFlightPrefetches = useRef<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useMushafFitScale(
    containerRef,
    pageRef,
    !isLoading && verses.length > 0 && fontReady,
  );

  useEffect(() => {
    if (initialPage && initialPage !== useQuranStore.getState().currentPage) {
      useQuranStore.getState().setCurrentPage(initialPage);
    }
    initializedRef.current = true;
  }, [initialPage]);

  useEffect(() => {
    if (!initializedRef.current) return;

    let cancelled = false;

    const prefetchPage = (page: number) => {
      if (page < 1 || page > 604) return;

      const key = `${reciterId}:${page}`;
      if (getCachedPage(page, reciterId)) return;
      if (inFlightPrefetches.current.has(key)) return;

      inFlightPrefetches.current.add(key);

      fetchPage(page)
        .then((pageVerses) => {
          if (cancelled) return;
          cachePage(page, reciterId, pageVerses, []);
        })
        .catch(() => {})
        .finally(() => {
          inFlightPrefetches.current.delete(key);
        });
    };

    const prefetchAdjacent = () => {
      const run = () => {
        prefetchPage(currentPage - 1);
        prefetchPage(currentPage + 1);
      };

      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(run, { timeout: 1000 });
      } else {
        setTimeout(run, 0);
      }
    };

    const syncPageChapter = (pageVerses: Verse[]) => {
      if (pageVerses.length === 0) return;

      const pageChapterIds = new Set(
        pageVerses.map((verse) => Number(verse.verse_key.split(":")[0])),
      );
      const currentChapter = useQuranStore.getState().currentChapter;
      const firstChapterId = Number(pageVerses[0].verse_key.split(":")[0]);
      const chapterToSync = pageChapterIds.has(currentChapter)
        ? currentChapter
        : firstChapterId;

      if (Number.isFinite(chapterToSync)) {
        syncCurrentChapter(chapterToSync);
      }
    };

    async function loadPageData() {
      const cached = getCachedPage(currentPage, reciterId);

      if (cached) {
        setVerses(cached.verses);
        setAudioFiles(cached.audioFiles);
        setIsLoading(false);

        syncPageChapter(cached.verses);

        if (useQuranStore.getState().pendingAutoPlay) {
          clearAutoPlay();
          const firstVerseKey = cached.verses[0]?.verse_key;
          if (firstVerseKey) playAyah(firstVerseKey);
        }

        prefetchAdjacent();
        return;
      }

      setIsLoading(true);

      try {
        let pageVerses: Verse[];

        if (initialVerses && currentPage === initialPage) {
          pageVerses = initialVerses;
        } else {
          pageVerses = await fetchPage(currentPage);
        }

        if (cancelled) return;

        setVerses(pageVerses);
        setAudioFiles([]);
        cachePage(currentPage, reciterId, pageVerses, []);

        syncPageChapter(pageVerses);

        if (useQuranStore.getState().pendingAutoPlay) {
          clearAutoPlay();
          const firstVerseKey = pageVerses[0]?.verse_key;
          if (firstVerseKey) playAyah(firstVerseKey);
        }

        if (!cancelled) setIsLoading(false);
        prefetchAdjacent();
      } catch (err) {
        console.error("Failed to load page data:", err);
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPageData();

    return () => {
      cancelled = true;
    };
  }, [
    currentPage,
    reciterId,
    getCachedPage,
    cachePage,
    clearAutoPlay,
    playAyah,
    setVerses,
    setAudioFiles,
    syncCurrentChapter,
    initialPage,
    initialVerses,
  ]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center overflow-hidden px-4 py-2"
    >
      {isLoading || !fontReady ? (
        <div className="flex h-full w-full items-center justify-center opacity-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400/20 border-t-amber-400"></div>
        </div>
      ) : (
        <div
          className="mushaf-scaling-container transition-transform duration-150"
          style={{
            transform: "scale(var(--mushaf-scale, 1))",
            transformOrigin: "center center",
          }}
        >
          <MushafPage
            ref={pageRef}
            pageNumber={currentPage}
            verses={verses}
            onPlay={playAyah}
            fontName={fontName}
          />
        </div>
      )}
    </div>
  );
}
