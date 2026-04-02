import { useQuranStore } from "@/lib/store";
import { Chapter, Reciter } from "@/lib/types";
import { toArabicNumber, uiLabels } from "@/lib/localization";

interface HeaderProps {
  chapters: Chapter[];
  reciters: Reciter[];
}

export default function Header({ chapters, reciters }: HeaderProps) {
  const { currentChapter, reciterId, setCurrentChapter, setReciterId } =
    useQuranStore();

  const currentChapterData = chapters.find((c) => c.id === currentChapter);

  return (
    <header className="header-glass sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl" dir="rtl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
        {/* Right: Branding */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <h1 className="text-sm font-bold tracking-tight text-white/95 font-arabic">
              {uiLabels.interactiveQuran}
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-amber-500/60 font-medium font-arabic">{uiLabels.clickToRecite}</p>
          </div>
        </div>

        {/* Center: Surah Name (Arabic) */}
        <div className="flex flex-col items-center">
          {currentChapterData && (
            <>
              <span className="font-arabic text-xl leading-none text-amber-400 drop-shadow-sm sm:text-2xl">
                {currentChapterData.name_arabic}
              </span>
              <span className="text-[10px] text-white/30 font-bold mt-0.5 sm:text-[11px] font-arabic">
                {uiLabels.surah} {currentChapterData.name_arabic}
              </span>
            </>
          )}
        </div>

        {/* Left: Selectors */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Surah Selector */}
          <select
            value={currentChapter}
            onChange={(e) => setCurrentChapter(parseInt(e.target.value))}
            className="select-custom h-9 w-32 rounded-lg border border-white/10 bg-white/5 pl-2.5 pr-7 text-[12px] font-semibold text-white/80 outline-none transition-all hover:bg-white/10 focus:border-amber-500/50 sm:w-44 font-arabic"
          >
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {toArabicNumber(ch.id)}. {ch.name_arabic}
              </option>
            ))}
          </select>

          {/* Reciter Selector */}
          <select
            value={reciterId}
            onChange={(e) => setReciterId(parseInt(e.target.value))}
            className="select-custom h-9 w-36 rounded-lg border border-white/10 bg-white/5 pl-2.5 pr-7 text-[12px] font-semibold text-white/80 outline-none transition-all hover:bg-white/10 focus:border-amber-500/50 sm:w-52 font-arabic"
          >
            {reciters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.translated_name?.name || r.reciter_name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}

