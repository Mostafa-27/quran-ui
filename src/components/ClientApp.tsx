"use client";

import { useLayoutEffect, useEffect } from "react";
import Header from "./Header";
import BismillahDivider from "./BismillahDivider";
import MushafViewer from "./MushafViewer";
import AudioPlayer from "./AudioPlayer";
import { useQuranStore } from "@/lib/store";
import { Chapter, Reciter, Verse } from "@/lib/types";

interface ClientAppProps {
  chapters: Chapter[];
  reciters: Reciter[];
  initialPage?: number;
  initialVerses?: Verse[];
}

export default function ClientApp({
  chapters,
  reciters,
  initialPage = 1,
  initialVerses,
}: ClientAppProps) {
  const setChapters = useQuranStore((s) => s.setChapters);
  const setCurrentPage = useQuranStore((s) => s.setCurrentPage);

  useLayoutEffect(() => {
    if (
      initialPage &&
      initialPage !== useQuranStore.getState().currentPage
    ) {
      setCurrentPage(initialPage);
    }
  }, [initialPage, setCurrentPage]);

  useEffect(() => {
    setChapters(chapters);
  }, [chapters, setChapters]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header chapters={chapters} reciters={reciters} />
      <BismillahDivider />
      <main className="flex-1 overflow-hidden">
        <MushafViewer initialPage={initialPage} initialVerses={initialVerses} />
      </main>
      <AudioPlayer />
    </div>
  );
}
