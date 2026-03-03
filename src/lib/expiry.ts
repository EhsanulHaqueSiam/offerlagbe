const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function isExpiringSoon(endDate?: string): boolean {
  if (!endDate) return false;
  const end = new Date(endDate).getTime();
  const now = Date.now();
  return end > now && end - now <= FORTY_EIGHT_HOURS_MS;
}

export function isEndingToday(endDate: string): boolean {
  const remaining = new Date(endDate).getTime() - Date.now();
  return remaining > 0 && remaining <= TWENTY_FOUR_HOURS_MS;
}

export function formatOfferDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
