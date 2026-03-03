/**
 * Get a Google Maps directions URL (free, no API key required).
 * Opens Google Maps app on mobile or web on desktop.
 */
export function getDirectionsUrl(lat: number, lng: number, label?: string): string {
  const destination = `${lat},${lng}`;
  const params = new URLSearchParams({
    api: "1",
    destination,
    travelmode: "walking",
  });
  if (label) params.set("destination_place_id", ""); // ignored, but label helps
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
