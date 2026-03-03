/**
 * Get a directions URL. Prefers the original Google Maps URL if available,
 * otherwise generates a Google Maps directions URL from coordinates.
 */
export function getDirectionsUrl(lat: number, lng: number, label?: string, googleMapsUrl?: string): string {
  // If the offer has an original Google Maps URL, use it directly
  if (googleMapsUrl) return googleMapsUrl;

  const destination = `${lat},${lng}`;
  const params = new URLSearchParams({
    api: "1",
    destination,
    travelmode: "walking",
  });
  if (label) params.set("destination_place_id", ""); // ignored, but label helps
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
