import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const API_BASE = "https://api.quran.com/api/v4";
const OUTPUT_DIR = path.join(process.cwd(), "public", "data");
const PAGES_DIR = path.join(OUTPUT_DIR, "pages");

const pageUrl = (pageNumber) =>
  `${API_BASE}/verses/by_page/${pageNumber}?words=true&word_fields=code_v2,text_uthmani,text_qpc_hafs,line_number,page_number,location,audio_url,verse_key&fields=juz_number&mushaf=1&per_page=50`;

async function fetchJson(url, retries = 3) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "quran-ui-data-downloader/1.0", Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function fetchRawPage(pageNumber) {
  const data = await fetchJson(pageUrl(pageNumber));
  return data.verses ?? [];
}

function mergeVerses(responses) {
  const verseMap = new Map();
  for (const verses of responses) {
    for (const verse of verses) {
      const existing = verseMap.get(verse.verse_key);
      if (!existing || (verse.words?.length ?? 0) > (existing.words?.length ?? 0)) {
        verseMap.set(verse.verse_key, verse);
      }
    }
  }
  return Array.from(verseMap.values()).sort((a, b) => {
    const aKey = a.verse_key.split(":").map(Number);
    const bKey = b.verse_key.split(":").map(Number);
    if (aKey[0] !== bKey[0]) return aKey[0] - bKey[0];
    return aKey[1] - bKey[1];
  });
}

function compactVerse(verse) {
  return {
    id: verse.id,
    verse_key: verse.verse_key,
    text_uthmani: verse.text_uthmani,
    juz_number: verse.juz_number,
    words: (verse.words ?? []).map((word) => ({
      id: word.id,
      position: word.position,
      char_type_name: word.char_type_name,
      text_uthmani: word.text_uthmani,
      code_v2: word.code_v2,
      line_number: word.line_number,
      verse_key: word.verse_key ?? verse.verse_key,
    })),
  };
}

async function mapWithConcurrency(items, worker, concurrency = 8) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function run() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results;
}

async function main() {
  await mkdir(PAGES_DIR, { recursive: true });

  console.log("Downloading chapters and reciters...");
  const [chaptersData, recitersData] = await Promise.all([
    fetchJson(`${API_BASE}/chapters`),
    fetchJson(`${API_BASE}/resources/recitations?language=ar`),
  ]);

  await writeFile(
    path.join(OUTPUT_DIR, "chapters.json"),
    JSON.stringify(chaptersData.chapters ?? [], null, 2),
    "utf8"
  );
  await writeFile(
    path.join(OUTPUT_DIR, "reciters.json"),
    JSON.stringify(recitersData.recitations ?? [], null, 2),
    "utf8"
  );

  console.log("Downloading and normalizing 604 pages...");
  const pageNumbers = Array.from({ length: 604 }, (_, i) => i + 1);

  await mapWithConcurrency(pageNumbers, async (pageNumber) => {
    const responses = await Promise.all([
      fetchRawPage(pageNumber),
      pageNumber < 604 ? fetchRawPage(pageNumber + 1) : Promise.resolve([]),
    ]);

    const pageVerses = mergeVerses(responses)
      .filter((verse) => verse.page_number === pageNumber)
      .map(compactVerse);

    await writeFile(
      path.join(PAGES_DIR, `${pageNumber}.json`),
      JSON.stringify(pageVerses, null, 2),
      "utf8"
    );

    if (pageNumber % 50 === 0 || pageNumber === 604) {
      console.log(`Generated ${pageNumber}/604 pages`);
    }
  }, 6);

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});