"use client";

import { useQuranStore } from "@/lib/store";
import { Word } from "@/lib/types";
import { toArabicNumber } from "@/lib/localization";

interface AyahWordProps {
  word: Word;
  onPlay: (verseKey: string) => void;
}

export default function AyahWord({ word, onPlay }: AyahWordProps) {
  const activeAyahKey = useQuranStore((s) => s.activeAyahKey);
  const isActive = activeAyahKey === word.verse_key;

  const handleClick = () => {
    if (word.verse_key) onPlay(word.verse_key);
  };

  if (word.char_type_name === "end") {
    const ayahNumber = Number(word.verse_key?.split(":")[1]);

    return (
      <span
        className={`ayah-badge font-arabic ${
          isActive
            ? "is-active text-amber-700"
            : "text-[#8b7355]"
        }`}
        onClick={handleClick}
        title={word.verse_key}
      >
        {Number.isFinite(ayahNumber) && ayahNumber > 0
          ? toArabicNumber(ayahNumber)
          : word.text_uthmani}
      </span>
    );
  }

  return (
    <span
      className={`mushaf-word cursor-pointer ${
        isActive
          ? "is-active rounded-sm bg-amber-400/20 text-amber-900"
          : "hover:text-black"
      }`}
      onClick={handleClick}
      title={word.verse_key}
    >
      {word.code_v2 ? (
        <span dangerouslySetInnerHTML={{ __html: word.code_v2 }} />
      ) : (
        <span className="font-arabic">{word.text_uthmani}</span>
      )}
    </span>
  );
}
