"use client";

import { Chapter } from "@/lib/types";

interface SurahHeaderProps {
  chapter: Chapter;
}

export default function SurahHeader({ chapter }: SurahHeaderProps) {
  return (
    <div className="surah-header w-full my-4 relative">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t-2 border-[#e6debb]"></div>
      </div>
      <div className="relative flex justify-center">
        <div className="bg-[#fdfcf0] px-6 py-2 border-2 border-[#dcd7be] rounded-full shadow-sm">
          <h2 className="font-arabic text-2xl text-[#8b7355] leading-none">
            سُورَةُ {chapter.name_arabic}
          </h2>
        </div>
      </div>
    </div>
  );
}
