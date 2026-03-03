export function timeAgo(timestamp: number): { key: string; n?: number } {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return { key: "time.justNow" };

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return { key: "time.minutesAgo", n: minutes };

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { key: "time.hoursAgo", n: hours };

  const days = Math.floor(hours / 24);
  return { key: "time.daysAgo", n: days };
}
