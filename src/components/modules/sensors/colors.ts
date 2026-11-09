import type { LightColor } from '@/lib/circuits/transducer';

/**
 * Physical colours: a photon is drawn in the colour it is, and temperature
 * runs blue → red. Fixed rather than themed, since "red light" and "hot"
 * must read the same in light and dark mode.
 */
export const PHOTON_COLOR: Readonly<Record<LightColor, string>> = {
  blue: '#3f6ff0',
  green: '#2fa84f',
  red: '#e0433b',
  // Invisible to the eye; drawn dim and dashed.
  ir: '#8e4a5a',
};

const COLD = [74, 127, 212] as const;
const HOT = [217, 83, 79] as const;

/** Blue → red across a 0..1 temperature fraction. */
export function heatColor(t: number, alpha = 1): string {
  const f = Math.min(1, Math.max(0, t));
  const c = COLD.map((cold, i) => Math.round(cold + (HOT[i] - cold) * f));
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
}
