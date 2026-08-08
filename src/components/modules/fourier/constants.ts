import type { FourierState } from '@/lib/state/schemas';

/** Analysis parameters: the finite observation window the FFT actually sees. */
export const SAMPLE_RATE = 8000;
export const N = 256;
export const BIN_SPACING = SAMPLE_RATE / N; // 31.25 Hz
export const NYQUIST = SAMPLE_RATE / 2;

// Components 1 and 2 are fixed, bin-aligned reference tones; component 3 is
// the one the student sweeps continuously.
export const FREQ1 = 8 * BIN_SPACING; // 250 Hz
export const FREQ2 = 20 * BIN_SPACING; // 625 Hz
export const FREQ3_MIN = 4 * BIN_SPACING;
export const FREQ3_MAX = 60 * BIN_SPACING;

export function nearestBinFreq(freq: number): number {
  return Math.round(freq / BIN_SPACING) * BIN_SPACING;
}

export function isOnBin(freq: number, epsilon = 0.01): boolean {
  return Math.abs(freq - nearestBinFreq(freq)) < epsilon;
}

/** The analysis-window signal: N samples at SAMPLE_RATE, built from the three components. */
export function buildSignal(
  state: Pick<FourierState, 'amp1' | 'amp2' | 'amp3' | 'freq3'>
): number[] {
  const { amp1, amp2, amp3, freq3 } = state;
  const signal = new Array<number>(N);
  for (let i = 0; i < N; i++) {
    const t = i / SAMPLE_RATE;
    signal[i] =
      amp1 * Math.cos(2 * Math.PI * FREQ1 * t) +
      amp2 * Math.cos(2 * Math.PI * FREQ2 * t) +
      amp3 * Math.cos(2 * Math.PI * freq3 * t);
  }
  return signal;
}
