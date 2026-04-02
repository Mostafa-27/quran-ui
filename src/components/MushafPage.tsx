"use client";

import { useMemo } from "react";
import { Chapter, Verse, Word } from "@/lib/types";
import MushafLine from "./MushafLine";
import SurahHeader from "./SurahHeader";
import { useQuranStore } from "@/lib/store";
import { toArabicNumber } from "@/lib/localization";

interface MushafPageProps {
  pageNumber: number;
  verses: Verse[];
  onPlay: (verseKey: string) => void;
}

export default function MushafPage({
  pageNumber,
  verses,
  onPlay,
}: MushafPageProps) {
  const chapters = useQuranStore((s) => s.chapters);

  // Group words and identify surah starts
  const { lines, surahStarts } = useMemo(() => {
    const linesMap: Record<number, Word[]> = {};
    const starts: Record<number, Chapter> = {};

    verses.forEach((verse) => {
      verse.words.forEach((word) => {
        // Safety: Ensure word has verse_key
        if (!word.verse_key) word.verse_key = verse.verse_key;
        
        if (!linesMap[word.line_number]) {
          linesMap[word.line_number] = [];
        }
        linesMap[word.line_number].push(word);
      });
      
      const [chapterId, verseNumber] = verse.verse_key.split(":").map(Number);
      if (verseNumber === 1 && verse.words.length > 0) {
        const chapter = chapters.find(c => c.id === chapterId);
        if (chapter) {
          starts[verse.words[0].line_number] = chapter;
        }
      }
    });

    return { lines: linesMap, surahStarts: starts };
  }, [verses, chapters]);

  return (
    <div
      className="mushaf-page mx-auto shadow-2xl bg-[#fdfcf0] relative w-full max-w-[650px] h-fit min-h-[850px] p-6 md:p-10 mb-20 flex flex-col"
      dir="rtl"
    >
      {/* Decorative Border Inner */}
      <div className="absolute inset-2 border-2 border-[#e6debb] pointer-events-none"></div>

      <div className="mushaf-lines-container flex flex-col">
        {Array.from({ length: 15 }).map((_, idx) => {
          const lineNumber = idx + 1;
          const wordsInLine = lines[lineNumber] || [];
          const surahHeaderChapter = surahStarts[lineNumber];

          // Bismillah centering logic: typically centered if no other non-Bismillah text is on the line
          // In Al-Fatiha, Line 2 has 5 words including the end marker
          const isBismillahOnly = 
            wordsInLine.length > 0 && 
            wordsInLine.length <= 5 &&
            wordsInLine.every(w => w.text_uthmani.includes("بِسْمِ") || 
                                  w.text_uthmani.includes("ٱللَّهِ") || 
                                  w.text_uthmani.includes("ٱلرَّحْمَـٰنِ") || 
                                  w.text_uthmani.includes("ٱلرَّحِيمِ") ||
                                  w.char_type_name === "end");

          return (
            <div key={lineNumber} className="flex flex-col w-full">
              {surahHeaderChapter && <SurahHeader chapter={surahHeaderChapter} />}
              <MushafLine
                lineNumber={lineNumber}
                words={wordsInLine}
                onPlay={onPlay}
                isCentered={isBismillahOnly}
              />
            </div>
          );
        })}
      </div>

      {/* Page Number footer */}
      <div className="text-center mt-8">
        <span className="text-[#8b7355] font-arabic opacity-60">
          {toArabicNumber(pageNumber)}
        </span>
      </div>
    </div>
  );
}
