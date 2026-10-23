"use client";

import { Chapter } from "@/lib/types";
import { toArabicNumber } from "@/lib/localization";

interface SurahHeaderProps {
  chapter?: Chapter;
  surahNumber: number;
}

export default function SurahHeader({
  chapter,
  surahNumber,
}: SurahHeaderProps) {
  const name = chapter?.name_arabic ?? toArabicNumber(surahNumber);

  return (
    <div className="surah-header flex h-full w-full items-center justify-center">
      <div className="surah-banner relative flex w-full items-center justify-center px-4">
        <span className="font-arabic relative z-10 text-lg text-[#8b6b3e] md:text-xl">
          سُورَةُ {name}
        </span>
      </div>
    </div>
  );
}
