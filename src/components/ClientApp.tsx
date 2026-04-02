"use client";

import { useEffect } from "react";
import Header from "./Header";
import MushafViewer from "./MushafViewer";
import AudioPlayer from "./AudioPlayer";
import { useQuranStore } from "@/lib/store";
import { Chapter, Reciter } from "@/lib/types";

interface ClientAppProps {
  chapters: Chapter[];
  reciters: Reciter[];
}

export default function ClientApp({ chapters, reciters }: ClientAppProps) {
  const setChapters = useQuranStore((s) => s.setChapters);

  useEffect(() => {
    setChapters(chapters);
  }, [chapters, setChapters]);

  return (
    <>
      <Header chapters={chapters} reciters={reciters} />
      <main className="min-h-screen">
        <MushafViewer />
      </main>
      <AudioPlayer />
    </>
  );
}
