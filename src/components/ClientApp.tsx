"use client";

import { useEffect } from "react";
import Header from "./Header";
import BismillahDivider from "./BismillahDivider";
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
      <BismillahDivider />
      <main className="min-h-screen pb-32 sm:pb-36 lg:pb-40">
        <MushafViewer />
      </main>
      <AudioPlayer />
    </>
  );
}
