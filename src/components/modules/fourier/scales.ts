import { linearScale, autoscaleWithZero, type Scale } from '@/lib/plot';

export const PAD_LEFT = 40;
export const PAD_RIGHT = 14;
export const PAD_TOP = 14;
export const PAD_BOTTOM = 22;

export interface PlotScales {
  readonly xScale: Scale;
  readonly yScale: Scale;
}

export function timeScales(
  size: { width: number; height: number },
  n: number,
  values: readonly number[]
): PlotScales {
  const xScale = linearScale([0, Math.max(1, n - 1)], [PAD_LEFT, size.width - PAD_RIGHT]);
  const yScale = linearScale(autoscaleWithZero(values, 0.25), [size.height - PAD_BOTTOM, PAD_TOP]);
  return { xScale, yScale };
}

export const DB_FLOOR = -80;
export const DB_CEIL = 6;
export const THRESHOLD_DB = -40;

/**
 * Decibels relative to full-scale amplitude (1.0). A linear amplitude axis
 * hides exactly the thing a window comparison needs to show: rectangular's
 * far sidelobes are small in absolute terms but decay far slower than a
 * tapered window's, which only reads clearly on a log scale.
 */
export function magnitudeToDb(mag: number): number {
  const eps = 10 ** (DB_FLOOR / 20);
  return 20 * Math.log10(Math.max(mag, eps));
}

/** Fixed dB range so the axis never rescales as the student changes parameters — the comparison stays legible. */
export function spectrumScales(
  size: { width: number; height: number },
  maxFreq: number
): PlotScales {
  const xScale = linearScale([0, maxFreq], [PAD_LEFT, size.width - PAD_RIGHT]);
  const yScale = linearScale([DB_FLOOR, DB_CEIL], [size.height - PAD_BOTTOM, PAD_TOP]);
  return { xScale, yScale };
}
