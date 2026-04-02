"use client";

import { useQuranStore } from "@/lib/store";
import { Chapter, Reciter } from "@/lib/types";

interface HeaderProps {
  chapters: Chapter[];
  reciters: Reciter[];
}

export default function Header({ chapters, reciters }: HeaderProps) {
  const { currentChapter, reciterId, setCurrentChapter, setReciterId } =
    useQuranStore();

  const currentChapterData = chapters.find((c) => c.id === currentChapter);

  return (
    <header className="header-glass sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo / App Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-black shadow-lg shadow-amber-500/20">
            ﷽
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-white/90">
              Interactive Quran
            </h1>
            <p className="text-[10px] text-white/40">Click to Recite</p>
          </div>
        </div>

        {/* Center: Current Surah Info */}
        <div className="flex items-center gap-2 text-center">
          {currentChapterData && (
            <span className="font-arabic text-lg text-amber-300">
              {currentChapterData.name_arabic}
            </span>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Surah Selector */}
          <select
            value={currentChapter}
            onChange={(e) => setCurrentChapter(parseInt(e.target.value))}
            className="select-glass rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm outline-none transition-colors hover:border-amber-400/30 focus:border-amber-400/50"
          >
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id} className="bg-gray-900 text-white">
                {ch.id}. {ch.name_simple}
              </option>
            ))}
          </select>

          {/* Reciter Selector */}
          <select
            value={reciterId}
            onChange={(e) => setReciterId(parseInt(e.target.value))}
            className="select-glass hidden rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm outline-none transition-colors hover:border-amber-400/30 focus:border-amber-400/50 sm:block"
          >
            {reciters.map((r) => (
              <option key={r.id} value={r.id} className="bg-gray-900 text-white">
                {r.reciter_name}
                {r.style ? ` (${r.style})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
