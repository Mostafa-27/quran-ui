import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const rawPage = cookieStore.get("quran_last_page")?.value;
  const parsedPage = Number(rawPage);
  const initialPage =
    Number.isInteger(parsedPage) && parsedPage >= 1 && parsedPage <= 604
      ? parsedPage
      : 1;

  redirect(`/page/${initialPage}`);
}
