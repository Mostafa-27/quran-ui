export interface Chapter {
  id: number;
  name_arabic: string;
  name_simple: string;
  name_complex: string;
  verses_count: number;
  bismillah_pre: boolean;
  revelation_place: string;
  revelation_order: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface Word {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: string; // 'word' or 'end'
  text_uthmani: string;
  line_number: number;
  page_number: number;
  location: string;
  verse_key: string;
}

export interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  words: Word[];
}

export interface AudioFile {
  verse_key: string;
  url: string;
}

export interface Reciter {
  id: number;
  reciter_name: string;
  style: string | null;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export interface ChaptersResponse {
  chapters: Chapter[];
}

export interface VersesResponse {
  verses: Verse[];
}

export interface AudioFilesResponse {
  audio_files: AudioFile[];
}

export interface RecitersResponse {
  recitations: Reciter[];
}
