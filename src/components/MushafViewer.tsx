"use client";

import { useEffect, useState } from "react";
import { useQuranStore } from "@/lib/store";
import { useQuranAudio } from "@/hooks/useQuranAudio";
import { fetchPage, fetchAudioFiles } from "@/lib/api";
import MushafPage from "./MushafPage";

export default function MushafViewer() {
  const {
    verses,
    currentPage,
    reciterId,
    setVerses,
    setAudioFiles,
    setCurrentPage,
    currentChapter
  } = useQuranStore();

  const { playAyah } = useQuranAudio();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch page data whenever currentPage or reciter changes
  useEffect(() => {
    let cancelled = false;

    async function loadPageData() {
      setIsLoading(true);
      try {
        // 1. First fetch the verses for the page
        const pageVerses = await fetchPage(currentPage);
        
        if (cancelled) return;
        setVerses(pageVerses);
        
        // 2. Clear existing audio files and identify unique chapters on this page
        setAudioFiles([]);
        const chapterIds = Array.from(new Set(
          pageVerses.map(v => parseInt(v.verse_key.split(":")[0]))
        ));

        // 3. Fetch audio files for ALL chapters on this page
        await Promise.all(chapterIds.map(async (cid) => {
          const audioData = await fetchAudioFiles(reciterId, cid);
          if (!cancelled) {
            // Use addAudioFiles to merge
            useQuranStore.getState().addAudioFiles(audioData);
          }
        }));

        if (!cancelled) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load page data:", err);
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPageData();
    return () => {
      cancelled = true;
    };
  }, [currentPage, reciterId, setVerses, setAudioFiles]);

  // Sync currentChapter when verses change
  useEffect(() => {
    if (verses.length > 0) {
      const firstVerse = verses[0];
      const chapterId = parseInt(firstVerse.verse_key.split(":")[0]);
      if (chapterId !== currentChapter) {
        useQuranStore.getState().syncCurrentChapter(chapterId);
      }
    }
  }, [verses, currentChapter]);

  return (
    <div className="mushaf-viewer-container flex flex-col items-center py-6 px-4 min-h-screen">
      {isLoading ? (

        <div className="flex h-150 items-center justify-center opacity-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400/20 border-t-amber-400"></div>
        </div>
      ) : (
        <div className="mushaf-scaling-container transition-all duration-300 transform origin-top">
           <MushafPage 
              pageNumber={currentPage} 
              verses={verses} 
              onPlay={playAyah} 
           />
        </div>
      )}
    </div>
  );
}
