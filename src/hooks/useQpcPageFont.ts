"use client";

import { useEffect, useState } from "react";

const loadedFonts = new Map<number, string>();

export function qpcFontFamily(pageNumber: number): string {
  return `QCF2${pageNumber.toString().padStart(3, "0")}`;
}

export function qpcFontUrl(
  pageNumber: number,
  version: "v1" | "v2" = "v2"
): string {
  return `https://verses.quran.foundation/fonts/quran/hafs/${version}/woff2/p${pageNumber}.woff2`;
}

export async function loadQpcPageFont(
  pageNumber: number,
  version: "v1" | "v2" = "v2"
): Promise<string> {
  const family = qpcFontFamily(pageNumber);

  if (loadedFonts.has(pageNumber)) {
    return loadedFonts.get(pageNumber)!;
  }

  if (typeof document === "undefined" || !("FontFace" in window)) {
    loadedFonts.set(pageNumber, family);
    return family;
  }

  const font = new FontFace(family, `url('${qpcFontUrl(pageNumber, version)}')`, {
    display: "block",
  });

  await font.load();
  document.fonts.add(font);
  loadedFonts.set(pageNumber, family);

  return family;
}

interface FontState {
  page: number;
  fontName: string;
  ready: boolean;
  error: Error | null;
}

export function useQpcPageFont(
  pageNumber: number,
  version: "v1" | "v2" = "v2"
) {
  const [state, setState] = useState<FontState>(() => ({
    page: pageNumber,
    fontName: qpcFontFamily(pageNumber),
    ready: false,
    error: null,
  }));

  useEffect(() => {
    let cancelled = false;

    loadQpcPageFont(pageNumber, version)
      .then((family) => {
        if (cancelled) return;
        setState({
          page: pageNumber,
          fontName: family,
          ready: true,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          page: pageNumber,
          fontName: qpcFontFamily(pageNumber),
          ready: true,
          error:
            err instanceof Error
              ? err
              : new Error("Failed to load QPC font"),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [pageNumber, version]);

  const isCurrentPage = state.page === pageNumber;

  return {
    fontName: isCurrentPage
      ? state.fontName
      : qpcFontFamily(pageNumber),
    ready: isCurrentPage && state.ready,
    error: isCurrentPage ? state.error : null,
  };
}
