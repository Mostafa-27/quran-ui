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

export async function fetchPage(pageNumber: number): Promise<Verse[]> {
  const res = await fetch(
    `${API_BASE}/verses/by_page/${pageNumber}?words=true&word_fields=text_uthmani,line_number,page_number,location,audio_url,verse_key`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
  const data: VersesResponse = await res.json();
  return data.verses;
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
