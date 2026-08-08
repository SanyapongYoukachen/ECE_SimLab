import { describe, it, expect } from 'vitest';
import { fft, ifft, nextPow2, zeroPad } from './fft';

describe('nextPow2', () => {
  it('returns the smallest power of two >= n', () => {
    expect(nextPow2(1)).toBe(1);
    expect(nextPow2(2)).toBe(2);
    expect(nextPow2(3)).toBe(4);
    expect(nextPow2(4)).toBe(4);
    expect(nextPow2(5)).toBe(8);
    expect(nextPow2(1000)).toBe(1024);
  });
});

describe('zeroPad', () => {
  it('pads with zeros to the requested length', () => {
    const out = zeroPad([1, 2, 3], 8);
    expect(Array.from(out)).toEqual([1, 2, 3, 0, 0, 0, 0, 0]);
  });

  it('truncates when n is shorter than input', () => {
    const out = zeroPad([1, 2, 3, 4], 2);
    expect(Array.from(out)).toEqual([1, 2]);
  });
});

describe('fft / ifft round trip', () => {
  it('ifft(fft(x)) === x to within 1e-10', () => {
    const n = 64;
    const re = new Float64Array(n);
    const im = new Float64Array(n);
    for (let i = 0; i < n; i++) re[i] = Math.sin((2 * Math.PI * 5 * i) / n) + 0.3 * i;

    const originalRe = re.slice();

    fft(re, im);
    ifft(re, im);

    for (let i = 0; i < n; i++) {
      expect(re[i]).toBeCloseTo(originalRe[i], 10);
      expect(im[i]).toBeCloseTo(0, 10);
    }
  });

  it('throws on non-power-of-two length', () => {
    const re = new Float64Array(6);
    const im = new Float64Array(6);
    expect(() => fft(re, im)).toThrow();
  });
});

describe('fft of a pure sinusoid at a bin centre', () => {
  it('produces a single non-zero bin (plus its mirror)', () => {
    const n = 64;
    const binIndex = 5;
    const re = new Float64Array(n);
    const im = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      re[i] = Math.cos((2 * Math.PI * binIndex * i) / n);
    }

    fft(re, im);

    const mags = Array.from({ length: n }, (_, k) => Math.hypot(re[k], im[k]));

    for (let k = 0; k < n; k++) {
      if (k === binIndex || k === n - binIndex) {
        expect(mags[k]).toBeGreaterThan(1);
      } else {
        expect(mags[k]).toBeLessThan(1e-9);
      }
    }
  });
});
