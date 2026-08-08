import { linearScale, autoscaleWithZero, type Scale } from '@/lib/plot';

export const PAD_LEFT = 34;
export const PAD_RIGHT = 14;
export const PAD_TOP = 14;
export const PAD_BOTTOM = 20;

export interface PlotScales {
  readonly xScale: Scale;
  readonly yScale: Scale;
}

/** Fixed viewport covering the whole slide range, so only content moves as n changes — not the axes. */
export function topScales(
  size: { width: number; height: number },
  x: readonly number[],
  kernelValues: readonly number[]
): PlotScales {
  const m = kernelValues.length;
  const domain: [number, number] = [-(m - 1) - 1, x.length - 1 + (m - 1) + 1];
  const xScale = linearScale(domain, [PAD_LEFT, size.width - PAD_RIGHT]);
  const yDomain = autoscaleWithZero([...x, ...kernelValues], 0.35);
  const yScale = linearScale(yDomain, [size.height - PAD_BOTTOM, PAD_TOP]);
  return { xScale, yScale };
}

export function bottomScales(
  size: { width: number; height: number },
  y: readonly number[]
): PlotScales {
  const domain: [number, number] = [0, Math.max(1, y.length - 1)];
  const xScale = linearScale(domain, [PAD_LEFT, size.width - PAD_RIGHT]);
  const yDomain = autoscaleWithZero(y, 0.35);
  const yScale = linearScale(yDomain, [size.height - PAD_BOTTOM, PAD_TOP]);
  return { xScale, yScale };
}
