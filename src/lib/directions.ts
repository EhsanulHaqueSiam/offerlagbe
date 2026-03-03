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

/**
 * Fallback: OpenStreetMap directions (completely free).
 */
export function getOSMDirectionsUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=;${lat},${lng}`;
}

/**
 * Get a static map link that shows the location (no API key).
 * Opens Google Maps centered on the location.
 */
export function getMapUrl(lat: number, lng: number, label?: string): string {
  const q = label ? `${label}@${lat},${lng}` : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
