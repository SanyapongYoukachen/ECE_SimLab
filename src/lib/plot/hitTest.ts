import type { Scale } from './scale';

/**
 * Finds the index of the sample whose x position is closest to a pixel
 * coordinate — used for click/drag-to-edit on stem plots. Returns null if
 * nothing is within `maxPixelDistance`.
 */
export function nearestSampleIndex(
  xs: readonly number[],
  xScale: Scale,
  pixelX: number,
  maxPixelDistance = 14
): number | null {
  let bestIndex: number | null = null;
  let bestDist = Infinity;
  for (let i = 0; i < xs.length; i++) {
    const px = xScale.toPixel(xs[i]);
    const dist = Math.abs(px - pixelX);
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = i;
    }
  }
  if (bestIndex === null || bestDist > maxPixelDistance) return null;
  return bestIndex;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
