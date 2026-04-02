"use client";

import { Word } from "@/lib/types";
import AyahWord from "./AyahWord";

interface MushafLineProps {
  words: Word[];
  lineNumber: number;
  isCentered?: boolean;
  onPlay: (verseKey: string) => void;
}

export default function MushafLine({
  words,
  lineNumber,
  isCentered = false,
  onPlay,
}: MushafLineProps) {
  const sortedWords = [...words].sort((a, b) => a.position - b.position);
  const shouldCenter = isCentered || sortedWords.length <= 3;

  return (
    <div
      className={`
        mushaf-line flex w-full items-center gap-0
        ${shouldCenter ? "justify-center gap-4" : "justify-between"}
      `}
      data-line={lineNumber}
    >
      {sortedWords.map((word) => (
        <AyahWord key={`${word.location}-${word.id}`} word={word} onPlay={onPlay} />
      ))}
    </div>
  );
}
