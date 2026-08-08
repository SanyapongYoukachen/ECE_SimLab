/**
 * Iterative, in-place, radix-2 Cooley-Tukey FFT. Operates on parallel
 * re/im arrays (rather than an array-of-objects) so hot loops avoid
 * allocation and object indirection — this matters for Module 3, which
 * re-runs the transform every time the length slider moves.
 */

/** Smallest power of two >= n (n >= 1). */
export function nextPow2(n: number): number {
  if (n <= 1) return 1;
  return 2 ** Math.ceil(Math.log2(n));
}

/** Zero-pads (or truncates) x to exactly length n. */
export function zeroPad(x: readonly number[], n: number): Float64Array {
  const out = new Float64Array(n);
  const copyLen = Math.min(x.length, n);
  for (let i = 0; i < copyLen; i++) out[i] = x[i];
  return out;
}

function isPow2(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

function bitReverse(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) {
      j ^= bit;
    }
    j ^= bit;
    if (i < j) {
      const tr = re[i];
      re[i] = re[j];
      re[j] = tr;
      const ti = im[i];
      im[i] = im[j];
      im[j] = ti;
    }
  }
}

/**
 * In-place forward FFT. `re` and `im` must have equal, power-of-two length.
 * `im` should be zero-filled for a real-valued input signal.
 */
export function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  if (im.length !== n) {
    throw new Error('fft: re and im must have equal length');
  }
  if (!isPow2(n)) {
    throw new Error(`fft: length must be a power of 2, got ${n}`);
  }
  if (n <= 1) return;

  bitReverse(re, im);

  for (let size = 2; size <= n; size *= 2) {
    const half = size / 2;
    const angleStep = (-2 * Math.PI) / size;
    for (let start = 0; start < n; start += size) {
      for (let k = 0; k < half; k++) {
        const angle = angleStep * k;
        const wRe = Math.cos(angle);
        const wIm = Math.sin(angle);

        const evenIdx = start + k;
        const oddIdx = start + k + half;

        const oddRe = re[oddIdx] * wRe - im[oddIdx] * wIm;
        const oddIm = re[oddIdx] * wIm + im[oddIdx] * wRe;

        re[oddIdx] = re[evenIdx] - oddRe;
        im[oddIdx] = im[evenIdx] - oddIm;
        re[evenIdx] = re[evenIdx] + oddRe;
        im[evenIdx] = im[evenIdx] + oddIm;
      }
    }
  }
}

/**
 * In-place inverse FFT, via the standard conjugate trick:
 * ifft(X) = conj(fft(conj(X))) / N
 */
export function ifft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  if (im.length !== n) {
    throw new Error('ifft: re and im must have equal length');
  }
  if (n <= 1) return;

  for (let i = 0; i < n; i++) im[i] = -im[i];

  fft(re, im);

  for (let i = 0; i < n; i++) {
    re[i] = re[i] / n;
    im[i] = -im[i] / n;
  }
}
