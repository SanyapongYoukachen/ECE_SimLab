import { describe, it, expect } from 'vitest';
import { makeWindow, WINDOW_TYPES } from './window';

function sum(w: Float64Array): number {
  let s = 0;
  for (let i = 0; i < w.length; i++) s += w[i];
  return s;
}

describe('makeWindow', () => {
  it('is symmetric for every window type, odd and even length', () => {
    for (const type of WINDOW_TYPES) {
      for (const n of [8, 9, 32, 65]) {
        const w = makeWindow(type, n);
        for (let i = 0; i < n; i++) {
          expect(w[i]).toBeCloseTo(w[n - 1 - i], 12);
        }
      }
    }
  });

  it('rectangular window is all ones and sums to n', () => {
    const w = makeWindow('rect', 65);
    expect(sum(w)).toBeCloseTo(65, 9);
    for (let i = 0; i < w.length; i++) expect(w[i]).toBe(1);
  });

  // For N = 65 (N - 1 = 64), the harmonic sums used by the window formulas
  // resolve to exact closed forms (derived from full-period cosine sums),
  // giving these known totals.
  it('hann window sums to its known value', () => {
    const w = makeWindow('hann', 65);
    expect(sum(w)).toBeCloseTo(32.0, 9);
  });

  it('hamming window sums to its known value', () => {
    const w = makeWindow('hamming', 65);
    expect(sum(w)).toBeCloseTo(34.64, 9);
  });

  it('blackman window sums to its known value', () => {
    const w = makeWindow('blackman', 65);
    expect(sum(w)).toBeCloseTo(26.88, 9);
  });

  it('non-rectangular windows taper to (near) zero at the edges', () => {
    for (const type of ['hann', 'hamming', 'blackman'] as const) {
      const w = makeWindow(type, 65);
      expect(w[0]).toBeLessThan(0.1);
      expect(w[w.length - 1]).toBeLessThan(0.1);
      expect(w[Math.floor(w.length / 2)]).toBeGreaterThan(0.9);
    }
  });

  it('handles n = 1 without dividing by zero', () => {
    for (const type of WINDOW_TYPES) {
      const w = makeWindow(type, 1);
      expect(Array.from(w)).toEqual([1]);
    }
  });
});
