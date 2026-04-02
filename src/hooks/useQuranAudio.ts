"use client";

import { useRef, useCallback, useEffect } from "react";
import { useQuranStore } from "@/lib/store";
import { getAudioUrl } from "@/lib/api";

export function useQuranAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Build a map of verse_key → full audio URL
  const audioMap = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const map = new Map<string, string>();
    audioFiles.forEach((af) => {
      map.set(af.verse_key, getAudioUrl(af.url));
    });
    audioMap.current = map;
  }, [audioFiles]);

  // Initialize audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }

    const audio = audioRef.current;

    const onEnded = () => {
      // Auto-play next ayah
      const nextKey = useQuranStore.getState().getNextAyahKey();
      if (nextKey) {
        const url = audioMap.current.get(nextKey);
        if (url && audio) {
          useQuranStore.getState().setActiveAyahKey(nextKey);
          audio.src = url;
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

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
    };
  }, []);

  const playAyah = useCallback(
    (verseKey: string) => {
      const audio = audioRef.current;
      if (!audio) return;

      const url = audioMap.current.get(verseKey);
      if (!url) return;

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
    [activeAyahKey, isPlaying, setActiveAyahKey, setIsPlaying, setIsBuffering]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !activeAyahKey) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [activeAyahKey, isPlaying, setIsPlaying]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

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
