"use client";

import { useEffect, useRef } from "react";
import { useQuranStore } from "@/lib/store";
import { toArabicNumerals } from "@/lib/api";

interface AyahTextProps {
  verseKey: string;
  text: string;
  verseNumber: number;
  onPlay: (verseKey: string) => void;
}

export default function AyahText({
  verseKey,
  text,
  verseNumber,
  onPlay,
}: AyahTextProps) {
  const activeAyahKey = useQuranStore((s) => s.activeAyahKey);
  const isActive = activeAyahKey === verseKey;
  const ref = useRef<HTMLSpanElement>(null);

  // Auto-scroll into view when this ayah becomes active
  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isActive]);

  return (
    <span
      ref={ref}
      id={`ayah-${verseKey}`}
      onClick={() => onPlay(verseKey)}
      className={`
        ayah-text inline cursor-pointer rounded-lg px-1.5 py-1 
        transition-all duration-300 ease-in-out
        ${
          isActive
            ? "ayah-active bg-amber-500/15 shadow-[0_0_20px_rgba(251,191,36,0.1)]"
            : "hover:bg-white/5"
        }
      `}
    >
      {text}
      <span className="ayah-number mx-1 inline-flex items-center justify-center text-[0.6em] text-amber-400/70">
        ﴿{toArabicNumerals(verseNumber)}﴾
      </span>
    </span>
  );
}
