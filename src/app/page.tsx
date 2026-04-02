import ClientApp from "@/components/ClientApp";
import { fetchChapters, fetchReciters } from "@/lib/api";

export default async function Home() {
  // Server-side data fetching for SEO and initial load
  const [chapters, reciters] = await Promise.all([
    fetchChapters(),
    fetchReciters(),
  ]);

  return <ClientApp chapters={chapters} reciters={reciters} />;
}
