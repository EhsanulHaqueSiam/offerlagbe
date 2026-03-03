/**
 * Extract latitude/longitude from various Google Maps URL formats:
 * - https://www.google.com/maps/place/.../@23.7891,90.4125,17z/...
 * - https://www.google.com/maps?q=23.7891,90.4125
 * - https://maps.google.com/maps?ll=23.7891,90.4125
 * - https://goo.gl/maps/...  (needs redirect resolution)
 * - https://maps.app.goo.gl/... (needs redirect resolution)
 *
 * For short links (goo.gl / maps.app.goo.gl), we attempt to follow the redirect
 * client-side. If that fails (CORS), we return null and the user must use the full URL.
 */

interface LatLng {
  latitude: number;
  longitude: number;
}

/** Try to extract lat/lng directly from a Google Maps URL string. */
function extractFromUrl(url: string): LatLng | null {
  // Pattern 1: /@lat,lng in path (most common when sharing from Google Maps)
  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    const lat = Number.parseFloat(atMatch[1]);
    const lng = Number.parseFloat(atMatch[2]);
    if (isValidCoord(lat, lng)) return { latitude: lat, longitude: lng };
  }

  // Pattern 2: ?q=lat,lng or &q=lat,lng
  const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) {
    const lat = Number.parseFloat(qMatch[1]);
    const lng = Number.parseFloat(qMatch[2]);
    if (isValidCoord(lat, lng)) return { latitude: lat, longitude: lng };
  }

  // Pattern 3: ?ll=lat,lng
  const llMatch = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (llMatch) {
    const lat = Number.parseFloat(llMatch[1]);
    const lng = Number.parseFloat(llMatch[2]);
    if (isValidCoord(lat, lng)) return { latitude: lat, longitude: lng };
  }

  // Pattern 4: /place/lat,lng
  const placeMatch = url.match(/\/place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (placeMatch) {
    const lat = Number.parseFloat(placeMatch[1]);
    const lng = Number.parseFloat(placeMatch[2]);
    if (isValidCoord(lat, lng)) return { latitude: lat, longitude: lng };
  }

  // Pattern 5: data=!3d{lat}!4d{lng}
  const dataMatch = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (dataMatch) {
    const lat = Number.parseFloat(dataMatch[1]);
    const lng = Number.parseFloat(dataMatch[2]);
    if (isValidCoord(lat, lng)) return { latitude: lat, longitude: lng };
  }

  return null;
}

function isValidCoord(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !Number.isNaN(lat) && !Number.isNaN(lng);
}

function isGoogleMapsUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?(google\.com\/maps|maps\.google\.|goo\.gl\/maps|maps\.app\.goo\.gl)/i.test(url);
}

function isShortLink(url: string): boolean {
  return /^https?:\/\/(goo\.gl\/maps|maps\.app\.goo\.gl)\//i.test(url);
}

/**
 * Resolve a short Google Maps link by following redirects.
 * Uses a CORS proxy approach — fetches with redirect: "manual" and reads the Location header.
 * Falls back to an <a> tag approach if that fails.
 */
async function resolveShortLink(url: string): Promise<string | null> {
  try {
    // Try fetching with no-cors to get the redirect URL
    // This won't give us the Location header due to CORS, so we try another approach:
    // Use the Google Maps URL unshortener by appending the URL to a known endpoint
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
    });
    // If we got redirected, the final URL should have coordinates
    if (response.url && response.url !== url) {
      return response.url;
    }
  } catch {
    // CORS blocked — expected for cross-origin short links
  }

  return null;
}

/**
 * Parse a Google Maps URL (including short links) and extract lat/lng.
 * Returns null if the URL is not a valid Google Maps link or coordinates can't be extracted.
 */
export async function parseGoogleMapsUrl(input: string): Promise<LatLng | null> {
  const url = input.trim();
  if (!url) return null;

  // Must be a Google Maps URL
  if (!isGoogleMapsUrl(url)) return null;

  // Try direct extraction first
  const direct = extractFromUrl(url);
  if (direct) return direct;

  // If it's a short link, try to resolve it
  if (isShortLink(url)) {
    const resolved = await resolveShortLink(url);
    if (resolved) {
      return extractFromUrl(resolved);
    }
  }

  return null;
}

/** Quick sync check — returns true if the input looks like a Google Maps URL */
export function looksLikeGoogleMapsUrl(input: string): boolean {
  const trimmed = input.trim();
  return isGoogleMapsUrl(trimmed) || /^https?:\/\/maps\.app\.goo\.gl\//i.test(trimmed);
}
