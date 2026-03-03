export const BANGLADESH_CENTER = {
  latitude: 23.8103,
  longitude: 90.4125,
} as const;

export const DHAKA_BOUNDS = {
  north: 24.0,
  south: 23.6,
  east: 90.6,
  west: 90.2,
} as const;

export const DEFAULT_ZOOM = 12;

export function getBubbleRadius(discountPercent: number): number {
  const minRadius = 6;
  const maxRadius = 30;
  const clamped = Math.max(0, Math.min(100, discountPercent));
  return minRadius + (clamped / 100) * (maxRadius - minRadius);
}
