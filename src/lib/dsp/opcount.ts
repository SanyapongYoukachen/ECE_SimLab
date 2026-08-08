import { nextPow2 } from './fft';

/**
 * Operation-count estimates used by Module 3's live counter. These are
 * complexity-class illustrations (real multiply-adds for the direct path,
 * complex multiply-adds for the FFT path), not cycle-accurate cost models —
 * the point is to make O(N*M) vs O(N log N) visible as the length grows,
 * not to benchmark a real implementation.
 */

/** Direct-form convolution: one multiply-add per (x, h) pair. */
export function directConvOps(n: number, m: number): number {
  return n * m;
}

/** FFT-based convolution: two forward FFTs + one inverse FFT + one pointwise multiply. */
export function fftConvOps(n: number, m: number): number {
  if (n === 0 || m === 0) return 0;
  const outLen = n + m - 1;
  const nfft = nextPow2(outLen);
  const perFft = nfft <= 1 ? 0 : (nfft / 2) * Math.log2(nfft);
  return 3 * perFft + nfft;
}
