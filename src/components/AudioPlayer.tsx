import { useQuranStore } from "@/lib/store";
import { useQuranAudio } from "@/hooks/useQuranAudio";
import { toArabicNumber, uiLabels } from "@/lib/localization";

export default function AudioPlayer() {
  const { 
    activeAyahKey, 
    isPlaying, 
    isBuffering, 
    verses, 
    chapters, 
    currentChapter,
    currentPage,
    setCurrentPage
  } = useQuranStore();
  
  const { togglePlayPause, stop, playNext, playPrev } = useQuranAudio();

  const activeChapterId = activeAyahKey ? parseInt(activeAyahKey.split(":")[0]) : null;
  const chapter = chapters.find((c) => c.id === activeChapterId || c.id === currentChapter);
  const activeVerse = verses.find((v) => v.verse_key === activeAyahKey);

  return (
    <div className="player-glass fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 pb-safe shadow-2xl transition-all duration-500">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Section 1: Page Navigation */}
          <div className="flex items-center justify-between sm:justify-start sm:gap-6 order-2 sm:order-1" dir="rtl">
            <div className="flex items-center gap-1 group">
              <button
                onClick={() => setCurrentPage(Math.min(604, currentPage + 1))}
                disabled={currentPage === 604}
                className="btn-ghost flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-90 disabled:opacity-10 cursor-pointer"
                aria-label="Next Page"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              
              <div className="flex flex-col items-center min-w-17.5 select-none">
                <span className="text-[10px] font-bold text-amber-500/40 mb-0.5 font-arabic">{uiLabels.page}</span>
                <span className="font-arabic text-3xl text-amber-200 leading-none drop-shadow-md transition-all group-hover:text-amber-400">{toArabicNumber(currentPage)}</span>
              </div>

              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-ghost flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-90 disabled:opacity-10 cursor-pointer"
                aria-label="Previous Page"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-9-6"/></svg>
              </button>
            </div>
            
            {/* Visual Divider on Desktop */}
            <div className="hidden h-10 w-px bg-white/5 sm:block opacity-50"></div>
          </div>

          {/* Section 2: Audio Controls */}
          <div className="flex items-center justify-center gap-2 order-1 sm:order-2 grow">
             {/* Prev Ayah */}
             <button
              onClick={playPrev}
              disabled={!activeAyahKey}
              className="btn-ghost flex h-11 w-11 items-center justify-center rounded-full transition-all hover:bg-white/5 active:scale-90 disabled:opacity-10 cursor-pointer"
              aria-label="Previous Ayah"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="rotate-180"><path d="m6 18 8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
            </button>

            {/* Main Play Button */}
            <button
              onClick={togglePlayPause}
              disabled={!activeAyahKey}
              className="btn-primary relative mx-2 flex h-14 w-14 items-center justify-center rounded-full overflow-hidden sm:h-16 sm:w-16 cursor-pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity hover:opacity-100"></div>
              {isBuffering ? (
                <div className="h-7 w-7 animate-spin rounded-full border-3 border-black/10 border-t-black"></div>
              ) : isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>

            {/* Next Ayah */}
            <button
              onClick={playNext}
              disabled={!activeAyahKey}
              className="btn-ghost flex h-11 w-11 items-center justify-center rounded-full transition-all hover:bg-white/5 active:scale-90 disabled:opacity-10 cursor-pointer"
              aria-label="Next Ayah"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="rotate-180"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
            </button>

            {/* Stop Button */}
            <button
              onClick={stop}
              disabled={!activeAyahKey}
              className="btn-ghost ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white/30 hover:bg-red-500/10 hover:text-red-400 active:scale-90 transition-all disabled:opacity-5 cursor-pointer"
              aria-label="Stop"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z" /></svg>
            </button>
          </div>

          {/* Section 3: Ayah Info - Localized */}
          <div className="hidden min-w-50 max-w-75 items-center justify-start gap-1.5 order-3 lg:flex" dir="rtl">
             {activeAyahKey ? (
               <div className="text-right flex flex-col items-start px-4">
                 <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-500/90 leading-none font-arabic">
                      {uiLabels.surah} {chapter?.name_arabic}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-white/20"></span>
                    <span className="text-[11px] font-bold text-white/40 leading-none font-arabic">
                      {uiLabels.ayah} {toArabicNumber(activeAyahKey.split(":")[1])}
                    </span>
                 </div>
                 <p className="mt-1.5 line-clamp-1 font-arabic text-sm text-white/60 drop-shadow-sm">
                   {activeVerse?.text_uthmani || activeVerse?.words?.map(w => w.text_uthmani).join(" ")}
                 </p>
               </div>
             ) : (
               <div className="flex items-center gap-2 text-white/20 font-arabic">
                 <span className="text-[10px] font-bold tracking-wide">{uiLabels.readyToRecite}</span>
                 <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="animate-pulse"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-4h2v4zm0-6H9V7h2v3z"/></svg>
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}

