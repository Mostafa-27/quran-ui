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
        const [pageVerses, audioData] = await Promise.all([
          fetchPage(currentPage),
          fetchAudioFiles(reciterId, currentChapter)
        ]);

        if (!cancelled) {
          setVerses(pageVerses);
          setAudioFiles(audioData);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load page data:", err);
        setIsLoading(false);
      }
    }

    loadPageData();
    return () => {
      cancelled = true;
    };
  }, [currentPage, reciterId, currentChapter, setVerses, setAudioFiles]);

  return (
    <div className="mushaf-viewer-container flex flex-col items-center py-12 px-4 min-h-screen">
      {/* Enhanced Navigation Controls */}
      <div className="flex items-center gap-12 mb-16 select-none sticky top-24 z-30 py-2 px-6 rounded-full bg-mushaf-bg/40 backdrop-blur-md border border-white/5">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          className="p-2 rounded-full text-amber-400 hover:bg-amber-400/20 transition-all cursor-pointer disabled:opacity-20"
          disabled={currentPage === 1}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        <div className="text-center min-w-32">
          <span className="text-xs uppercase tracking-[0.2em] text-amber-500/60 block mb-1">Page</span>
          <h3 className="font-arabic text-2xl text-amber-200">{currentPage}</h3>
        </div>

        <button
          onClick={() => setCurrentPage(Math.min(604, currentPage + 1))}
          className="p-2 rounded-full text-amber-400 hover:bg-amber-400/20 transition-all cursor-pointer disabled:opacity-20"
          disabled={currentPage === 604}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-9-6"/></svg>
        </button>
      </div>

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
