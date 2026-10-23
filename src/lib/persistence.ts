export const LAST_PAGE_COOKIE = "quran_last_page";

export function getLastPageFromCookie(): number {
  if (typeof document === "undefined") return 1;

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LAST_PAGE_COOKIE}=([^;]*)`)
  );
  const value = match ? decodeURIComponent(match[1]) : "";
  const page = Number(value);

  return Number.isInteger(page) && page >= 1 && page <= 604 ? page : 1;
}

export function setLastPageCookie(page: number): void {
  if (typeof document === "undefined") return;

  document.cookie = `${LAST_PAGE_COOKIE}=${page}; path=/; max-age=31536000; SameSite=Lax`;
}
