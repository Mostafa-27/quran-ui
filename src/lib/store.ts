"use client";

import { create } from "zustand";
import { AudioFile, Chapter, Verse } from "./types";
import { pauseGlobalAudio, stopGlobalAudio } from "./audioController";
import { setLastPageCookie } from "./persistence";

interface CachedPage {
  verses: Verse[];
  audioFiles: AudioFile[];
  updatedAt: number;
}

interface QuranState {
  // Data
  chapters: Chapter[];
  verses: Verse[]; // These are now the verses for the current PAGE
  audioFiles: AudioFile[];
  pageCache: Record<string, CachedPage>;

  // Navigation
  currentPage: number;
  currentChapter: number; // Keep track of the highlighted chapter in the header
  pendingAutoPlay: boolean;

  // Audio state
  activeAyahKey: string | null;
  isPlaying: boolean;
  isBuffering: boolean;
  reciterId: number;

  // Actions
  setChapters: (chapters: Chapter[]) => void;
  setVerses: (verses: Verse[]) => void;
  setAudioFiles: (audioFiles: AudioFile[]) => void;
  addAudioFiles: (audioFiles: AudioFile[]) => void;
  setCurrentPage: (page: number) => void;
  setCurrentChapter: (chapter: number) => void;
  syncCurrentChapter: (chapter: number) => void;
  setActiveAyahKey: (key: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsBuffering: (buffering: boolean) => void;
  setReciterId: (id: number) => void;
  advanceToNextPage: () => void;
  clearAutoPlay: () => void;

  // Page cache
  cachePage: (page: number, reciterId: number, verses: Verse[], audioFiles?: AudioFile[]) => void;
  getCachedPage: (page: number, reciterId: number) => CachedPage | undefined;
  clearPageCache: () => void;
  updateCachedAudioFiles: (page: number, reciterId: number, audioFiles: AudioFile[]) => void;

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
  pageCache: {},

  // Navigation
  currentPage: 1,
  currentChapter: 1,
  pendingAutoPlay: false,

  // Audio state
  activeAyahKey: null,
  isPlaying: false,
  isBuffering: false,
  reciterId: 7, // Mishari Alafasy

  // Actions
  setChapters: (chapters) => set({ chapters }),
  setVerses: (verses) => set({ verses }),
  setAudioFiles: (audioFiles) => set({ audioFiles }),
  addAudioFiles: (newFiles) =>
    set((state) => {
      const existingKeys = new Set(state.audioFiles.map((af) => af.verse_key));
      const uniqueNew = (newFiles || []).filter(
        (af) => af && !existingKeys.has(af.verse_key)
      );
      return { audioFiles: [...state.audioFiles, ...uniqueNew] };
    }),
  setCurrentPage: (page) => {
    pauseGlobalAudio();
    set({
      currentPage: page,
      activeAyahKey: null,
      isPlaying: false,
      isBuffering: false,
      pendingAutoPlay: false,
    });
    setLastPageCookie(page);
  },
  setCurrentChapter: (chapterId) => {
    const { chapters } = get();
    const chapter = chapters.find((c) => c.id === chapterId);
    if (chapter && chapter.pages && chapter.pages.length > 0) {
      stopGlobalAudio();
      set({
        currentChapter: chapterId,
        currentPage: chapter.pages[0],
        activeAyahKey: null,
        isPlaying: false,
        isBuffering: false,
        pendingAutoPlay: false,
      });
      setLastPageCookie(chapter.pages[0]);
    } else {
      set({ currentChapter: chapterId, pendingAutoPlay: false });
    }
  },
  syncCurrentChapter: (chapterId) => set({ currentChapter: chapterId }),
  setActiveAyahKey: (key) => set({ activeAyahKey: key }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsBuffering: (buffering) => set({ isBuffering: buffering }),
  setReciterId: (id) => {
    stopGlobalAudio();
    set({
      reciterId: id,
      audioFiles: [],
      pageCache: {},
      activeAyahKey: null,
      isPlaying: false,
      isBuffering: false,
      pendingAutoPlay: false,
    });
  },
  advanceToNextPage: () => {
    const { currentPage } = get();
    const nextPage = currentPage >= 604 ? 1 : currentPage + 1;
    pauseGlobalAudio();
    set({
      currentPage: nextPage,
      activeAyahKey: null,
      isPlaying: false,
      isBuffering: false,
      pendingAutoPlay: true,
    });
    setLastPageCookie(nextPage);
  },
  clearAutoPlay: () => set({ pendingAutoPlay: false }),

  cachePage: (page, reciterId, verses, audioFiles = []) =>
    set((state) => {
      const key = `${reciterId}:${page}`;
      const nextCache = {
        ...state.pageCache,
        [key]: {
          verses,
          audioFiles,
          updatedAt: Date.now(),
        },
      };

      const keys = Object.keys(nextCache);
      if (keys.length > 10) {
        const oldestKey = keys.reduce((oldest, current) =>
          nextCache[oldest].updatedAt < nextCache[current].updatedAt
            ? oldest
            : current
        );
        delete nextCache[oldestKey];
      }

      return { pageCache: nextCache };
    }),
  getCachedPage: (page, reciterId) =>
    get().pageCache[`${reciterId}:${page}`],
  clearPageCache: () => set({ pageCache: {} }),
  updateCachedAudioFiles: (page, reciterId, audioFiles) =>
    set((state) => {
      const key = `${reciterId}:${page}`;
      const cached = state.pageCache[key];
      if (!cached) return {};

      return {
        pageCache: {
          ...state.pageCache,
          [key]: {
            ...cached,
            audioFiles,
            updatedAt: cached.updatedAt,
          },
        },
      };
    }),

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
    return null;
  },

  getPrevAyahKey: () => {
    const { verses, activeAyahKey } = get();
    if (!activeAyahKey) return null;
    const idx = verses.findIndex((v) => v.verse_key === activeAyahKey);
    if (idx > 0) return verses[idx - 1].verse_key;
    return null;
  },
}));
