"use client";

import { useQuranStore } from "@/lib/store";
import { Word } from "@/lib/types";

interface AyahWordProps {
  word: Word;
  onPlay: (verseKey: string) => void;
}

export default function AyahWord({ word, onPlay }: AyahWordProps) {
  const activeAyahKey = useQuranStore((s) => s.activeAyahKey);
  const isActive = activeAyahKey === word.verse_key;

  const handleClick = () => {
    console.log(`Word clicked: ${word.text_uthmani}, Verse Key: ${word.verse_key}`);
    if (word.verse_key) {
      onPlay(word.verse_key);
    } else {
      console.warn("Verse key is missing for word!", word);
    }
  };

  // Render end-of-ayah marker differently
  if (word.char_type_name === "end") {
    // End marker in Uthmani font is usually a specific character or symbol
    return (
      <span
        className={`
          mushaf-word-end mx-1 inline-flex cursor-pointer items-center justify-center 
          font-arabic text-[0.9em] transition-all duration-300
          ${isActive ? "text-amber-600 scale-110" : "text-[#8b7355] opacity-70"}
        `}
        onClick={handleClick}
      >
        {word.text_uthmani}
      </span>
    );
  }

  // Regular word
  return (
    <span
      className={`
        mushaf-word inline-block cursor-pointer px-1 transition-all duration-200
        font-arabic text-2xl md:text-3xl text-[#2c2c2c]
        ${
          isActive
            ? "bg-amber-400/20 text-amber-900 rounded-sm shadow-[0_0_10px_rgba(251,191,36,0.2)]"
            : "hover:bg-amber-100/50 hover:text-black"
        }
      `}
      onClick={handleClick}
      title={word.verse_key}
    >
      {word.text_uthmani}
    </span>
  );
}
