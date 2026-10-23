import { cookies } from "next/headers";
import ClientApp from "@/components/ClientApp";
import { fetchChapters, fetchReciters } from "@/lib/api";

export default async function Home() {
  const cookieStore = await cookies();
  const rawPage = cookieStore.get("quran_last_page")?.value;
  const parsedPage = Number(rawPage);
  const initialPage =
    Number.isInteger(parsedPage) && parsedPage >= 1 && parsedPage <= 604
      ? parsedPage
      : 1;

  // Server-side data fetching for SEO and initial load
  const [chapters, reciters] = await Promise.all([
    fetchChapters(),
    fetchReciters(),
  ]);

  return (
    <ClientApp
      chapters={chapters}
      reciters={reciters}
      initialPage={initialPage}
    />
  );
}
