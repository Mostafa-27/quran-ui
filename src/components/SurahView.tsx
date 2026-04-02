"use client";

import { useEffect } from "react";
import AyahText from "./AyahText";
import { useQuranStore } from "@/lib/store";
import { useQuranAudio } from "@/hooks/useQuranAudio";
import { fetchVerses, fetchAudioFiles } from "@/lib/api";
import { Chapter } from "@/lib/types";

interface SurahViewProps {
  initialChapter: Chapter;
}

export default function SurahView({ initialChapter }: SurahViewProps) {
  const {
    verses,
    currentChapter,
    reciterId,
    setVerses,
    setAudioFiles,
  } = useQuranStore();

  const { playAyah } = useQuranAudio();

  // Fetch verses and audio whenever chapter or reciter changes
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [versesData, audioData] = await Promise.all([
          fetchVerses(currentChapter),
          fetchAudioFiles(reciterId, currentChapter),
        ]);
        if (!cancelled) {
          setVerses(versesData);
          setAudioFiles(audioData);
        }
      } catch (err) {
        console.error("Failed to load surah data:", err);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [currentChapter, reciterId, setVerses, setAudioFiles]);

  // Get the current chapter info
  const chapters = useQuranStore((s) => s.chapters);
  const chapter = chapters.find((c) => c.id === currentChapter) || initialChapter;

  if (verses.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400"></div>
          <p className="text-sm text-white/40">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="surah-view mx-auto max-w-4xl px-4 pb-32 pt-6">
      {/* Surah Title Ornament */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="surah-title-ornament flex items-center gap-4">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400/40"></span>
          <h2 className="font-arabic text-3xl text-amber-300 md:text-4xl">
            سُورَةُ {chapter.name_arabic}
          </h2>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400/40"></span>
        </div>
        <p className="text-xs tracking-widest text-white/30 uppercase">
          {chapter.name_simple} · {chapter.verses_count} Ayahs ·{" "}
          {chapter.revelation_place === "makkah" ? "Makkiyah" : "Madaniyah"}
        </p>
      </div>

      {/* Bismillah */}
      {chapter.bismillah_pre && (
        <div className="mb-8 text-center">
          <p className="font-arabic text-2xl leading-loose text-amber-200/80 md:text-3xl">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        </div>
      )}

      {/* Ayah Text Container */}
      <div
        className="font-arabic text-right text-2xl leading-[2.8] text-mushaf-text md:text-3xl lg:text-4xl lg:leading-[3]"
        dir="rtl"
      >
        {verses.map((verse) => {
          const verseNumber = parseInt(verse.verse_key.split(":")[1]);
          return (
            <AyahText
              key={verse.verse_key}
              verseKey={verse.verse_key}
              text={verse.text_uthmani}
              verseNumber={verseNumber}
              onPlay={playAyah}
            />
          );
        })}
      </div>
    </div>
  );
}
