"use client";

import { create } from "zustand";
import { AudioFile, Chapter, Verse } from "./types";

interface QuranState {
  // Data
  chapters: Chapter[];
  verses: Verse[]; // These are now the verses for the current PAGE
  audioFiles: AudioFile[];

  // Navigation
  currentPage: number;
  currentChapter: number; // Keep track of the highlighted chapter in the header

  // Audio state
  activeAyahKey: string | null;
  isPlaying: boolean;
  isBuffering: boolean;
  reciterId: number;

  // Actions
  setChapters: (chapters: Chapter[]) => void;
  setVerses: (verses: Verse[]) => void;
  setAudioFiles: (audioFiles: AudioFile[]) => void;
  setCurrentPage: (page: number) => void;
  setCurrentChapter: (chapter: number) => void;
  setActiveAyahKey: (key: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsBuffering: (buffering: boolean) => void;
  setReciterId: (id: number) => void;

  // Computed helpers
  getVerseIndex: (verseKey: string) => number;
  getNextAyahKey: () => string | null;
  getPrevAyahKey: () => string | null;
}

export const useQuranStore = create<QuranState>((set, get) => ({
  // Data
  chapters: [],
  verses: [],
  audioFiles: [],

  // Navigation
  currentPage: 1,
  currentChapter: 1,

  // Audio state
  activeAyahKey: null,
  isPlaying: false,
  isBuffering: false,
  reciterId: 7, // Mishari Alafasy

  // Actions
  setChapters: (chapters) => set({ chapters }),
  setVerses: (verses) => set({ verses }),
  setAudioFiles: (audioFiles) => set({ audioFiles }),
  setCurrentPage: (page) =>
    set({ currentPage: page, activeAyahKey: null, isPlaying: false }),
  setCurrentChapter: (chapterId) => {
    const { chapters } = get();
    const chapter = chapters.find((c) => c.id === chapterId);
    if (chapter && chapter.pages && chapter.pages.length > 0) {
      set({
        currentChapter: chapterId,
        currentPage: chapter.pages[0],
        activeAyahKey: null,
        isPlaying: false,
      });
    } else {
      set({ currentChapter: chapterId });
    }
  },
  setActiveAyahKey: (key) => set({ activeAyahKey: key }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsBuffering: (buffering) => set({ isBuffering: buffering }),
  setReciterId: (id) => set({ reciterId: id }),

  // Helpers
  getVerseIndex: (verseKey) => {
    const { verses } = get();
    return verses.findIndex((v) => v.verse_key === verseKey);
  },

  getNextAyahKey: () => {
    const { verses, activeAyahKey } = get();
    if (!activeAyahKey) return verses[0]?.verse_key ?? null;
    const idx = verses.findIndex((v) => v.verse_key === activeAyahKey);
    if (idx < verses.length - 1) return verses[idx + 1].verse_key;
    return null; // Will trigger stop/next page implicitly via the hook later
  },

  getPrevAyahKey: () => {
    const { verses, activeAyahKey } = get();
    if (!activeAyahKey) return null;
    const idx = verses.findIndex((v) => v.verse_key === activeAyahKey);
    if (idx > 0) return verses[idx - 1].verse_key;
    return null;
  },
}));
