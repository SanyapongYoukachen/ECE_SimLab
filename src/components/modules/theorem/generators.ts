import type { TheoremState } from '@/lib/state/schemas';

/** Deterministic hash-based pseudo-noise so "noisy" signals are reproducible from a URL, with no seed to carry. */
function hashNoise(i: number): number {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

function decayKernel(n: number): number[] {
  return Array.from({ length: n }, (_, i) => Math.exp((-3 * i) / n));
}

export interface SignalPair {
  readonly x: number[];
  readonly h: number[];
}

export function buildSignalPair(preset: TheoremState['preset'], n: number): SignalPair {
  const h = decayKernel(n);
  let x: number[];

  switch (preset) {
    case 'smooth':
      x = Array.from({ length: n }, (_, i) => Math.sin((2 * Math.PI * 3 * i) / n));
      break;
    case 'noisy':
      x = Array.from(
        { length: n },
        (_, i) => Math.sin((2 * Math.PI * 3 * i) / n) + 0.4 * (hashNoise(i) * 2 - 1)
      );
      break;
    case 'pulse': {
      const period = Math.max(4, Math.floor(n / 8));
      x = Array.from({ length: n }, (_, i) => (i % period < 2 ? 1 : 0));
      break;
    }
  }

  return { x, h };
}
