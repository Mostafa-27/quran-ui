"use client";

import { forwardRef, useMemo } from "react";
import { Chapter, Verse, Word } from "@/lib/types";
import MushafLine from "./MushafLine";
import SurahHeader from "./SurahHeader";
import { useQuranStore } from "@/lib/store";
import { toArabicNumber } from "@/lib/localization";
import rawLayout from "@/data/qpcV2Layout.json";

const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";

const LINE_SURAH_NAME = 0;
const LINE_AYAH = 1;
const LINE_BASMALLAH = 2;

type LayoutLine = [number, number, number];
const LAYOUT = rawLayout as unknown as Record<string, LayoutLine[]>;

const EMPTY_LAYOUT: LayoutLine[] = Array.from({ length: 15 }, () => [
  3,
  0,
  0,
]);

interface MushafPageProps {
  pageNumber: number;
  verses: Verse[];
  onPlay: (verseKey: string) => void;
  fontName?: string;
}

const MushafPage = forwardRef<HTMLDivElement, MushafPageProps>(
  ({ pageNumber, verses, onPlay, fontName }, ref) => {
    const chapters = useQuranStore((s) => s.chapters);

    const { wordsByLine, pageChapters, juzNumber } = useMemo(() => {
      const map = new Map<number, Word[]>();

      verses.forEach((verse) => {
        verse.words.forEach((word) => {
          if (!word.verse_key) word.verse_key = verse.verse_key;

          const lineNumber = word.line_number || 1;
          if (!map.has(lineNumber)) map.set(lineNumber, []);
          map.get(lineNumber)!.push(word);
        });
      });

      const firstVerse = verses[0];
      const chapterIds = Array.from(
        new Set(
          verses.map((verse) => Number(verse.verse_key.split(":")[0]))
        )
      );
      const chaptersOnPage = chapterIds
        .map((id) => chapters.find((c) => c.id === id))
        .filter((c): c is Chapter => Boolean(c));

      return {
        wordsByLine: map,
        pageChapters: chaptersOnPage,
        juzNumber: firstVerse?.juz_number,
      };
    }, [verses, chapters]);

    const layout = LAYOUT[String(pageNumber)] ?? EMPTY_LAYOUT;
    const fontStyle = fontName
      ? { fontFamily: `"${fontName}", var(--font-arabic)` }
      : undefined;

    return (
      <div ref={ref} className="mushaf-page relative mx-auto" dir="rtl">
        <div className="pointer-events-none absolute inset-2 border-2 border-[#e6debb]" />

        <div className="mushaf-top-strip relative">
          <span className="mushaf-top-surahs font-arabic">
            {pageChapters.length > 0
              ? pageChapters.map((c) => c.name_arabic).join(" • ")
              : "المصحف"}
          </span>
          {typeof juzNumber === "number" && (
            <span className="font-arabic">
              الجزء {toArabicNumber(juzNumber)}
            </span>
          )}
        </div>

        <div className="mushaf-frame relative" style={fontStyle}>
          {layout.map((line, idx) => {
            const [type, isCentered, surahNumber] = line;
            const lineNumber = idx + 1;

            if (type === LINE_SURAH_NAME) {
              const chapter = chapters.find((c) => c.id === surahNumber);

              return (
                <div
                  key={lineNumber}
                  className="mushaf-row"
                  data-line={lineNumber}
                >
                  <SurahHeader
                    chapter={chapter}
                    surahNumber={surahNumber}
                  />
                </div>
              );
            }

            if (type === LINE_BASMALLAH) {
              return (
                <div
                  key={lineNumber}
                  className="mushaf-row"
                  data-line={lineNumber}
                >
                  <div className="mushaf-line center bismillah-line">
                    <span className="font-arabic">{BISMILLAH}</span>
                  </div>
                </div>
              );
            }

            const words =
              type === LINE_AYAH ? wordsByLine.get(lineNumber) ?? [] : [];

            return (
              <div
                key={lineNumber}
                className="mushaf-row"
                data-line={lineNumber}
              >
                <MushafLine
                  lineNumber={lineNumber}
                  words={words}
                  onPlay={onPlay}
                  isCentered={isCentered === 1}
                />
              </div>
            );
          })}
        </div>

        <div className="mushaf-page-number relative font-arabic">
          {toArabicNumber(pageNumber)}
        </div>
      </div>
    );
  }
);

MushafPage.displayName = "MushafPage";

export default MushafPage;
