import { redirect } from "next/navigation";
import { readFile } from "node:fs/promises";
import path from "node:path";
import ClientApp from "@/components/ClientApp";
import type { Chapter, Reciter, Verse } from "@/lib/types";

type PageParams = {
  pageNumber: string;
};

export function generateStaticParams() {
  return Array.from({ length: 604 }, (_, index) => ({
    pageNumber: String(index + 1),
  }));
}

export const dynamicParams = false;

async function readJson<T>(filePath: string): Promise<T> {
  const contents = await readFile(filePath, "utf8");
  return JSON.parse(contents) as T;
}

export default async function MushafPageRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { pageNumber: rawPageNumber } = await params;
  const pageNumber = Number(rawPageNumber);

  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 604) {
    redirect("/");
  }

  const dataDir = path.join(process.cwd(), "public", "data");
  const [chapters, reciters, verses] = await Promise.all([
    readJson<Chapter[]>(path.join(dataDir, "chapters.json")),
    readJson<Reciter[]>(path.join(dataDir, "reciters.json")),
    readJson<Verse[]>(path.join(dataDir, "pages", `${pageNumber}.json`)),
  ]);

  return (
    <ClientApp
      chapters={chapters}
      reciters={reciters}
      initialPage={pageNumber}
      initialVerses={verses}
    />
  );
}