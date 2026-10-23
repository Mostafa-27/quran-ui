import {
  Chapter,
  Verse,
  AudioFile,
  Reciter,
  ChaptersResponse,
  VersesResponse,
  AudioFilesResponse,
  RecitersResponse,
} from "./types";

const API_BASE = "https://api.quran.com/api/v4";
const AUDIO_CDN_BASE = "https://verses.quran.com";

export async function fetchChapters(): Promise<Chapter[]> {
  const res = await fetch(`${API_BASE}/chapters`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Failed to fetch chapters: ${res.status}`);
  const data: ChaptersResponse = await res.json();
  return data.chapters;
}

// Raw page responses are cached for the lifetime of the browser session so
// that prefetching adjacent pages does not duplicate network requests.
const rawPageCache = new Map<number, Promise<Verse[]>>();

async function fetchRawPage(pageNumber: number): Promise<Verse[]> {
  const cached = rawPageCache.get(pageNumber);
  if (cached) return cached;

  const promise = (async () => {
    const res = await fetch(
      `${API_BASE}/verses/by_page/${pageNumber}?words=true&word_fields=code_v2,text_uthmani,text_qpc_hafs,line_number,page_number,location,audio_url,verse_key&fields=juz_number&mushaf=1&per_page=50`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
    const data: VersesResponse = await res.json();
    return data.verses;
  })();

  rawPageCache.set(pageNumber, promise);
  return promise;
}

export async function fetchPage(pageNumber: number): Promise<Verse[]> {
  const pagesToFetch = [pageNumber];
  if (pageNumber < 604) pagesToFetch.push(pageNumber + 1);

  const responses = await Promise.all(pagesToFetch.map(fetchRawPage));

  // Merge verses from the current and next page, deduplicating by verse_key.
  const verseMap = new Map<string, Verse>();
  for (const verses of responses) {
    for (const verse of verses) {
      const existing = verseMap.get(verse.verse_key);
      if (!existing || (verse.words?.length ?? 0) > (existing.words?.length ?? 0)) {
        verseMap.set(verse.verse_key, verse);
      }
    }
  }

  // The API's by_page endpoint returns a sliding window: it includes verses
  // from the previous page (with their previous-page line numbers) and omits
  // the last verse(s) of the current page (which appear in the next response).
  // Keep only the verses that actually belong to this page.
  const pageVerses = Array.from(verseMap.values())
    .filter((verse) => verse.page_number === pageNumber)
    .sort((a, b) => {
      const aKey = a.verse_key.split(":").map(Number);
      const bKey = b.verse_key.split(":").map(Number);
      if (aKey[0] !== bKey[0]) return aKey[0] - bKey[0];
      return aKey[1] - bKey[1];
    });

  return pageVerses;
}

export async function fetchVerses(chapterNumber: number): Promise<Verse[]> {
  const res = await fetch(
    `${API_BASE}/verses/by_chapter/${chapterNumber}?words=true&word_fields=text_uthmani,line_number,page_number,location,audio_url,verse_key`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) throw new Error(`Failed to fetch verses: ${res.status}`);
  const data: VersesResponse = await res.json();
  return data.verses;
}

export async function fetchAudioFiles(
  reciterId: number,
  chapterNumber: number
): Promise<AudioFile[]> {
  let allAudioFiles: AudioFile[] = [];
  let currentPage = 1;
  let totalPages = 1;

  try {
    do {
      const res = await fetch(
        `${API_BASE}/recitations/${reciterId}/by_chapter/${chapterNumber}?per_page=300&page=${currentPage}`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) throw new Error(`Failed to fetch audio files page ${currentPage}: ${res.status}`);
      
      const data: AudioFilesResponse = await res.json();
      allAudioFiles = [...allAudioFiles, ...data.audio_files];
      
      totalPages = data.pagination.total_pages;
      currentPage++;
    } while (currentPage <= totalPages);

    return allAudioFiles;
  } catch (err) {
    console.error("Error fetching paginated audio files:", err);
    throw err;
  }
}

export async function fetchReciters(): Promise<Reciter[]> {
  const res = await fetch(`${API_BASE}/resources/recitations?language=ar`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Failed to fetch reciters: ${res.status}`);
  const data: RecitersResponse = await res.json();
  return data.recitations;
}

export function getAudioUrl(relativePath: string): string {
  return `${AUDIO_CDN_BASE}/${relativePath}`;
}

/**
 * Convert a Western digit (0-9) to Arabic-Indic numeral
 */
export function toArabicNumerals(num: number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .split("")
    .map((d) => arabicDigits[parseInt(d)])
    .join("");
}
