import { fft, ifft, nextPow2, zeroPad } from './fft';

/**
 * Discrete linear convolution, computed directly (O(N*M)) rather than via
 * the FFT. This is the "ground truth" path used both by Module 1's
 * flip-and-slide animation and as the reference Module 3 checks the FFT
 * path against.
 */

export interface ConvTerm {
  /** index into x */
  readonly i: number;
  /** index into h */
  readonly j: number;
  readonly xVal: number;
  readonly hVal: number;
  readonly product: number;
}

export interface ConvStep {
  /** output index n, for y[n] */
  readonly n: number;
  readonly terms: readonly ConvTerm[];
  readonly sum: number;
}

/**
 * y[n] = sum_k x[k] * h[n-k], for n = 0 .. (N + M - 2).
 * Returns an empty array if either input is empty.
 */
export function convolve(x: readonly number[], h: readonly number[]): number[] {
  const n = x.length;
  const m = h.length;
  if (n === 0 || m === 0) return [];

  const outLen = n + m - 1;
  const y = new Array<number>(outLen).fill(0);

  for (let outN = 0; outN < outLen; outN++) {
    const kMin = Math.max(0, outN - m + 1);
    const kMax = Math.min(n - 1, outN);
    let sum = 0;
    for (let k = kMin; k <= kMax; k++) {
      sum += x[k] * h[outN - k];
    }
    y[outN] = sum;
  }

  return y;
}

/**
 * Same computation as `convolve`, but returns the full per-shift breakdown
 * (which samples overlapped, each product, and the running sum) so the UI
 * can render the animation and the live arithmetic expression directly from
 * data instead of recomputing anything on each frame.
 */
export function convolveSteps(x: readonly number[], h: readonly number[]): ConvStep[] {
  const n = x.length;
  const m = h.length;
  if (n === 0 || m === 0) return [];

  const outLen = n + m - 1;
  const steps: ConvStep[] = [];

  for (let outN = 0; outN < outLen; outN++) {
    const kMin = Math.max(0, outN - m + 1);
    const kMax = Math.min(n - 1, outN);
    const terms: ConvTerm[] = [];
    let sum = 0;
    for (let k = kMin; k <= kMax; k++) {
      const j = outN - k;
      const xVal = x[k];
      const hVal = h[j];
      const product = xVal * hVal;
      terms.push({ i: k, j, xVal, hVal, product });
      sum += product;
    }
    steps.push({ n: outN, terms, sum });
  }

  return steps;
}

/**
 * Linear convolution computed via IFFT(FFT(x) . FFT(h)) — the "fast" path
 * for Module 3. Both signals are zero-padded to the next power of two at or
 * above the full linear-convolution output length (N + M - 1), which avoids
 * circular-convolution wraparound while still allowing a radix-2 FFT.
 */
export function fftConvolve(x: readonly number[], h: readonly number[]): number[] {
  const n = x.length;
  const m = h.length;
  if (n === 0 || m === 0) return [];

  const outLen = n + m - 1;
  const nfft = nextPow2(outLen);

  const xRe = zeroPad(x, nfft);
  const xIm = new Float64Array(nfft);
  const hRe = zeroPad(h, nfft);
  const hIm = new Float64Array(nfft);

  fft(xRe, xIm);
  fft(hRe, hIm);

  const yRe = new Float64Array(nfft);
  const yIm = new Float64Array(nfft);
  for (let k = 0; k < nfft; k++) {
    yRe[k] = xRe[k] * hRe[k] - xIm[k] * hIm[k];
    yIm[k] = xRe[k] * hIm[k] + xIm[k] * hRe[k];
  }

  ifft(yRe, yIm);

  return Array.from(yRe.subarray(0, outLen));
}
