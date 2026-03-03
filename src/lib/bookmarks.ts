const BOOKMARKS_KEY = "offerlagbe_bookmarks";

export function getBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function isBookmarked(offerId: string): boolean {
  return getBookmarks().includes(offerId);
}

export function toggleBookmark(offerId: string): boolean {
  const bookmarks = getBookmarks();
  const index = bookmarks.indexOf(offerId);
  if (index >= 0) {
    bookmarks.splice(index, 1);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return false;
  }
  bookmarks.push(offerId);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  return true;
}
