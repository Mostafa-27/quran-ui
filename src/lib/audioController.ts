let globalAudio: HTMLAudioElement | null = null;

export function getGlobalAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;

  if (!globalAudio) {
    globalAudio = new Audio();
    // Audio is fetched only when playback starts.
    globalAudio.preload = "none";
  }

  return globalAudio;
}

export function pauseGlobalAudio(): void {
  globalAudio?.pause();
}

export function stopGlobalAudio(): void {
  if (!globalAudio) return;

  globalAudio.pause();
  globalAudio.currentTime = 0;
  globalAudio.removeAttribute("src");
  globalAudio.load();
}
