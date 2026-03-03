const LOCATION_KEY = "offerlagbe_user_location";

export interface UserLocation {
  latitude: number;
  longitude: number;
  label: string;
}

export function getUserLocation(): UserLocation | null {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserLocation;
  } catch {
    return null;
  }
}

export function setUserLocation(loc: UserLocation) {
  localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
}

export function clearUserLocation() {
  localStorage.removeItem(LOCATION_KEY);
}

export async function getLocationWithFallback(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  // 1. Try saved location from localStorage
  const saved = getUserLocation();
  if (saved) return { latitude: saved.latitude, longitude: saved.longitude };

  // 2. Try browser GPS
  return requestGPSLocation();
}

/** Always requests fresh GPS position (triggers browser permission prompt). */
export function requestGPSLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  if (!navigator.geolocation) return Promise.resolve(null);

  // Try high accuracy first, then fall back to low accuracy
  // High accuracy can fail on HTTP or when GPS hardware isn't available
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => {
        // Retry without high accuracy (uses Wi-Fi/cell tower instead of GPS)
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          () => resolve(null),
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  });
}

export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}
