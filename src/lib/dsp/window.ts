export type WindowType = 'rect' | 'hann' | 'hamming' | 'blackman';

export const WINDOW_TYPES: readonly WindowType[] = ['rect', 'hann', 'hamming', 'blackman'];

export const WINDOW_LABELS: Record<WindowType, string> = {
  rect: 'Rectangular',
  hann: 'Hann',
  hamming: 'Hamming',
  blackman: 'Blackman',
};

/**
 * Symmetric (not periodic/DFT-even) window of length n, matching the
 * textbook definitions. Symmetric windows satisfy w[i] === w[n-1-i] exactly,
 * which is what Module 2 relies on to demonstrate leakage without also
 * introducing an amplitude asymmetry artifact of its own.
 */
export function makeWindow(type: WindowType, n: number): Float64Array {
  const w = new Float64Array(n);
  if (n <= 0) return w;
  if (n === 1) {
    w[0] = 1;
    return w;
  }

  const N1 = n - 1;
  for (let i = 0; i < n; i++) {
    switch (type) {
      case 'rect':
        w[i] = 1;
        break;
      case 'hann':
        w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N1);
        break;
      case 'hamming':
        w[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / N1);
        break;
      case 'blackman':
        w[i] =
          0.42 - 0.5 * Math.cos((2 * Math.PI * i) / N1) + 0.08 * Math.cos((4 * Math.PI * i) / N1);
        break;
    }
  }
  return w;
}

/** Mean value of the window — its "coherent gain" — used to normalize amplitude after windowing. */
export function coherentGain(w: Float64Array): number {
  let sum = 0;
  for (let i = 0; i < w.length; i++) sum += w[i];
  return sum / w.length;
}
