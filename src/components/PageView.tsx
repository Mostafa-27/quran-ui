"use client";

import { useEffect, useMemo } from "react";
import { useQuranStore } from "@/lib/store";
import { useQuranAudio } from "@/hooks/useQuranAudio";
import { fetchPage } from "@/lib/api";
import { Word } from "@/lib/types";
import QuranLine from "./QuranLine";

export default function PageView() {
  const {
    verses,
    currentPage,
    setVerses,
    setCurrentChapter,
  } = useQuranStore();

  const { playAyah } = useQuranAudio();

  // Fetch page data whenever currentPage changes
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const pageVerses = await fetchPage(currentPage);
        if (!cancelled) {
          setVerses(pageVerses);
          // Auto-update chapter based on the first verse of the page
          if (pageVerses.length > 0) {
              const firstVerseChapter = parseInt(pageVerses[0].verse_key.split(":")[0]);
              setCurrentChapter(firstVerseChapter);
          }
        }
      } catch (err) {
        console.error("Failed to load page data:", err);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [currentPage, setVerses, setCurrentChapter]);

  // Group all words by line_number (1 to 15)
  const lines = useMemo(() => {
    const lineMap = new Map<number, Word[]>();
    
    // Flatten words
    verses.forEach((verse) => {
      if (!verse.words) return;
      verse.words.forEach((word) => {
        if (!lineMap.has(word.line_number)) {
          lineMap.set(word.line_number, []);
        }
        lineMap.get(word.line_number)!.push(word);
      });
    });

    // Sort words within each line by position
    const sortedLines: { lineNumber: number; words: Word[] }[] = [];
    const minLine = Math.min(...Array.from(lineMap.keys()), 1);
    const maxLine = Math.max(...Array.from(lineMap.keys()), 15);

    for (let i = minLine; i <= maxLine; i++) {
      if (lineMap.has(i)) {
        const lineWords = lineMap.get(i)!;
        lineWords.sort((a, b) => a.position - b.position);
        sortedLines.push({ lineNumber: i, words: lineWords });
      }
    }

    return sortedLines;
  }, [verses]);

  if (verses.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400"></div>
          <p className="font-arabic text-xl text-white/40">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[800px] flex-col items-center justify-center px-4 pb-32 pt-10">
      
      {/* The Mushaf Page Container */}
      <div className="mushaf-page relative flex w-full flex-col justify-between overflow-hidden rounded-sm bg-[#fcf8e3] p-6 shadow-2xl xl:p-10">
        
        {/* Subtle decorative border (optional depending on exact design) */}
        <div className="pointer-events-none absolute inset-2 border-2 border-double border-[#d2b48c]/40 rounded-sm"></div>

        {/* Lines */}
        <div className="z-10 flex w-full flex-col justify-between gap-y-4 lg:gap-y-6">
          {lines.map((line) => {
            // Determine if this line should be centered (e.g. Bismillah or Surah Header)
            // A simple heuristic: if a line has very few words and is strictly the Bismillah, center it.
            // A more complex heuristic could check previous/next gap.
            const isCentered = line.words.length < 6 && line.words.some(w => w.text_uthmani.includes("بِسْمِ") || w.text_uthmani.includes("ٱلسُّورَةِ"));
            
            return (
              <QuranLine
                key={`line-${line.lineNumber}`}
                lineNumber={line.lineNumber}
                words={line.words}
                onPlay={playAyah}
                isCentered={isCentered}
              />
            );
          })}
        </div>
      </div>

      {/* Page Number Indicator */}
      <div className="mt-4 font-arabic text-xl text-amber-500/80">
        {currentPage}
      </div>
    </div>
  );
}
