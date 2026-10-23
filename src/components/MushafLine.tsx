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
  return (
    <div
      className={`mushaf-line ${isCentered ? "center" : "justified"}`}
      data-line={lineNumber}
    >
      {words.map((word) => (
        <AyahWord
          key={`${word.location}-${word.id}`}
          word={word}
          onPlay={onPlay}
        />
      ))}
    </div>
  );
}
