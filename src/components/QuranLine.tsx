"use client";

import { Word } from "@/lib/types";
import AyahWord from "./AyahWord";

interface QuranLineProps {
  words: Word[];
  lineNumber: number;
  onPlay: (verseKey: string) => void;
  isCentered?: boolean;
}

export default function QuranLine({ words, lineNumber, onPlay, isCentered = false }: QuranLineProps) {
  return (
    <div
      className={`quran-line flex w-full flex-row-reverse items-baseline font-arabic text-2xl leading-loose md:text-3xl lg:text-4xl ${
        isCentered ? "justify-center gap-2" : "justify-between"
      }`}
      dir="rtl"
    >
      {words.map((word) => (
        <AyahWord key={`${word.verse_key}-${word.position}`} word={word} onPlay={onPlay} />
      ))}
    </div>
  );
}
