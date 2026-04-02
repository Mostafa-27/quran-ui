"use client";

import { useQuranStore } from "@/lib/store";
import { useQuranAudio } from "@/hooks/useQuranAudio";

export default function AudioPlayer() {
  const { activeAyahKey, isPlaying, isBuffering, verses, chapters, currentChapter } =
    useQuranStore();
  const { togglePlayPause, stop, playNext, playPrev } = useQuranAudio();

  const chapter = chapters.find((c) => c.id === currentChapter);
  const activeVerse = verses.find((v) => v.verse_key === activeAyahKey);

  return (
    <div className="player-glass fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        {/* Left: Now Playing Info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {activeAyahKey ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-amber-300/80">
                {chapter?.name_simple} · Ayah{" "}
                {activeAyahKey.split(":")[1]}
              </p>
              <p
                className="mt-0.5 truncate font-arabic text-sm text-white/60"
                dir="rtl"
              >
                {activeVerse?.text_uthmani.slice(0, 60)}
                {(activeVerse?.text_uthmani.length ?? 0) > 60 ? "..." : ""}
              </p>
            </div>
          ) : (
            <p className="text-xs text-white/30">
              Click any Ayah to begin recitation
            </p>
          )}

          {/* Buffering indicator */}
          {isBuffering && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400"></div>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1">
          {/* Previous */}
          <button
            onClick={playPrev}
            disabled={!activeAyahKey}
            className="player-btn flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Previous Ayah"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlayPause}
            disabled={!activeAyahKey}
            className="player-btn-main mx-1 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/25 transition-all hover:scale-105 hover:shadow-amber-500/40 active:scale-95 disabled:opacity-30 disabled:shadow-none disabled:hover:scale-100"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button
            onClick={playNext}
            disabled={!activeAyahKey}
            className="player-btn flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Next Ayah"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="m6 18 8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          {/* Stop */}
          <button
            onClick={stop}
            disabled={!activeAyahKey}
            className="player-btn ml-1 flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/10 hover:text-red-400 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Stop"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 6h12v12H6z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
