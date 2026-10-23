"use client";

import { useRef, useCallback, useEffect } from "react";
import { useQuranStore } from "@/lib/store";
import { getAudioUrl, fetchAudioFiles } from "@/lib/api";
import { getGlobalAudio, stopGlobalAudio } from "@/lib/audioController";

let audioRequestCounter = 0;

export function useQuranAudio() {
  const playAyahRef = useRef<(verseKey: string) => void | Promise<void>>(async () => {});

  useEffect(() => {
    const audio = getGlobalAudio();
    if (!audio) return;

    const onEnded = () => {
      const state = useQuranStore.getState();
      const nextKey = state.getNextAyahKey();

      if (nextKey) {
        playAyahRef.current(nextKey);
        return;
      }

      if (state.currentPage < 604) {
        state.advanceToNextPage();
      } else {
        state.setActiveAyahKey(null);
        state.setIsPlaying(false);
        state.setIsBuffering(false);
        stopGlobalAudio();
      }
    };

    const onCanPlay = () => {
      useQuranStore.getState().setIsBuffering(false);
    };

    const onWaiting = () => {
      useQuranStore.getState().setIsBuffering(true);
    };

    const onPlaying = () => {
      useQuranStore.getState().setIsPlaying(true);
      useQuranStore.getState().setIsBuffering(false);
    };

    const listenersAttached = (audio as HTMLAudioElement & {
      __quranListenersAttached?: boolean;
    }).__quranListenersAttached;

    if (!listenersAttached) {
      audio.addEventListener("ended", onEnded);
      audio.addEventListener("canplay", onCanPlay);
      audio.addEventListener("waiting", onWaiting);
      audio.addEventListener("playing", onPlaying);
      (audio as HTMLAudioElement & { __quranListenersAttached?: boolean }).__quranListenersAttached = true;
    }
  }, []);

  const playAyah = useCallback(async (verseKey: string) => {
    const audio = getGlobalAudio();
    if (!audio) return;

    const requestId = ++audioRequestCounter;
    const state = useQuranStore.getState();
    const activeAyahKey = state.activeAyahKey;
    const isPlaying = state.isPlaying;

    // Toggle pause for the currently playing ayah.
    if (activeAyahKey === verseKey && isPlaying) {
      audio.pause();
      useQuranStore.getState().setIsPlaying(false);
      return;
    }

    // Resume the currently paused ayah.
    if (activeAyahKey === verseKey && !isPlaying) {
      audio.play().catch(console.error);
      useQuranStore.getState().setIsPlaying(true);
      return;
    }

    // Start a new ayah.
    useQuranStore.getState().setActiveAyahKey(verseKey);
    useQuranStore.getState().setIsBuffering(true);

    let audioFile = useQuranStore.getState().audioFiles.find(
      (file) => file.verse_key === verseKey
    );

    if (!audioFile) {
      try {
        const reciterId = useQuranStore.getState().reciterId;
        const chapterId = parseInt(verseKey.split(":")[0], 10);
        const audioData = await fetchAudioFiles(reciterId, chapterId);

        if (requestId !== audioRequestCounter) return;

        useQuranStore.getState().addAudioFiles(audioData);

        const page = useQuranStore.getState().currentPage;
        useQuranStore.getState().updateCachedAudioFiles(
          page,
          reciterId,
          useQuranStore.getState().audioFiles
        );

        audioFile = useQuranStore.getState().audioFiles.find(
          (file) => file.verse_key === verseKey
        );
      } catch (err) {
        console.error("Error fetching audio files:", err);
        if (requestId === audioRequestCounter) {
          useQuranStore.getState().setIsBuffering(false);
        }
        return;
      }
    }

    if (requestId !== audioRequestCounter) return;
    if (!audioFile) {
      useQuranStore.getState().setIsBuffering(false);
      return;
    }

    const latestAudio = getGlobalAudio();
    if (!latestAudio) return;

    latestAudio.src = getAudioUrl(audioFile.url);
    latestAudio.play().catch(console.error);
  }, []);

  useEffect(() => {
    playAyahRef.current = playAyah;
  }, [playAyah]);

  const togglePlayPause = useCallback(() => {
    const audio = getGlobalAudio();
    if (!audio) return;

    const state = useQuranStore.getState();
    if (!state.activeAyahKey) return;

    if (state.isPlaying) {
      audio.pause();
      state.setIsPlaying(false);
    } else {
      audio.play().catch(console.error);
      state.setIsPlaying(true);
    }
  }, []);

  const stop = useCallback(() => {
    const audio = getGlobalAudio();
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.removeAttribute("src");

    useQuranStore.getState().setActiveAyahKey(null);
    useQuranStore.getState().setIsPlaying(false);
    useQuranStore.getState().setIsBuffering(false);
  }, []);

  const playNext = useCallback(() => {
    const state = useQuranStore.getState();
    const nextKey = state.getNextAyahKey();

    if (nextKey) {
      playAyah(nextKey);
      return;
    }

    if (state.currentPage < 604) {
      state.advanceToNextPage();
    }
  }, [playAyah]);

  const playPrev = useCallback(() => {
    const state = useQuranStore.getState();
    const prevKey = state.getPrevAyahKey();
    if (prevKey) playAyah(prevKey);
  }, [playAyah]);

  return {
    playAyah,
    togglePlayPause,
    stop,
    playNext,
    playPrev,
  };
}
