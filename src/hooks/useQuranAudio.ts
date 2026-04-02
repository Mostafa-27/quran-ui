"use client";

import { useRef, useCallback, useEffect } from "react";
import { useQuranStore } from "@/lib/store";
import { getAudioUrl } from "@/lib/api";

// Singleton audio element to be shared across all instances of the hook
let globalAudio: HTMLAudioElement | null = null;
const listenersAttached = { ended: false, canplay: false, waiting: false, playing: false };

export function useQuranAudio() {
  const {
    audioFiles,
    activeAyahKey,
    isPlaying,
    setActiveAyahKey,
    setIsPlaying,
    setIsBuffering,
    getNextAyahKey,
    getPrevAyahKey,
  } = useQuranStore();

  // Initialize audio element once
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!globalAudio) {
      globalAudio = new Audio();
      globalAudio.preload = "auto";
    }

    const audio = globalAudio;

    const onEnded = () => {
      const nextKey = useQuranStore.getState().getNextAyahKey();
      if (nextKey) {
        // We use the audioMap from the current store state
        // but since we need the URL, we'll get it from the store's audioFiles
        const state = useQuranStore.getState();
        const af = state.audioFiles.find(f => f.verse_key === nextKey);
        if (af && audio) {
          state.setActiveAyahKey(nextKey);
          audio.src = getAudioUrl(af.url);
          audio.play().catch(console.error);
        }
      } else {
        useQuranStore.getState().setActiveAyahKey(null);
        useQuranStore.getState().setIsPlaying(false);
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

    // Attach listeners only once
    if (!listenersAttached.ended) {
      audio.addEventListener("ended", onEnded);
      listenersAttached.ended = true;
    }
    if (!listenersAttached.canplay) {
      audio.addEventListener("canplay", onCanPlay);
      listenersAttached.canplay = true;
    }
    if (!listenersAttached.waiting) {
      audio.addEventListener("waiting", onWaiting);
      listenersAttached.waiting = true;
    }
    if (!listenersAttached.playing) {
      audio.addEventListener("playing", onPlaying);
      listenersAttached.playing = true;
    }

    // We don't remove them on unmount because other instances might still need them
    // and we only want one set of listeners for the singleton.
  }, []);

  const playAyah = useCallback(
    (verseKey: string) => {
      if (!globalAudio) return;
      const audio = globalAudio;

      const af = audioFiles.find(f => f.verse_key === verseKey);
      if (!af) {
        console.warn(`No audio file found for ${verseKey}`);
        return;
      }

      const url = getAudioUrl(af.url);

      // If same ayah is playing, toggle pause
      if (activeAyahKey === verseKey && isPlaying) {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      // If same ayah is paused, resume
      if (activeAyahKey === verseKey && !isPlaying) {
        audio.play().catch(console.error);
        setIsPlaying(true);
        return;
      }

      // New ayah
      setActiveAyahKey(verseKey);
      setIsBuffering(true);
      audio.src = url;
      audio.play().catch(console.error);
    },
    [activeAyahKey, isPlaying, audioFiles, setActiveAyahKey, setIsPlaying, setIsBuffering]
  );

  const togglePlayPause = useCallback(() => {
    if (!globalAudio || !activeAyahKey) return;
    const audio = globalAudio;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [activeAyahKey, isPlaying, setIsPlaying]);

  const stop = useCallback(() => {
    if (!globalAudio) return;
    const audio = globalAudio;

    audio.pause();
    audio.currentTime = 0;
    setActiveAyahKey(null);
    setIsPlaying(false);
  }, [setActiveAyahKey, setIsPlaying]);

  const playNext = useCallback(() => {
    const nextKey = getNextAyahKey();
    if (nextKey) playAyah(nextKey);
  }, [getNextAyahKey, playAyah]);

  const playPrev = useCallback(() => {
    const prevKey = getPrevAyahKey();
    if (prevKey) playAyah(prevKey);
  }, [getPrevAyahKey, playAyah]);

  return {
    playAyah,
    togglePlayPause,
    stop,
    playNext,
    playPrev,
  };
}

