import { describe, it, expect } from 'vitest';
import { convolve, convolveSteps, fftConvolve } from './convolution';

describe('convolve', () => {
  it('matches a hand-computed result for equal-length signals', () => {
    // x = [1, 2, 3], h = [0, 1, 0.5]
    // y[0] = 1*0 = 0
    // y[1] = 1*1 + 2*0 = 1
    // y[2] = 1*0.5 + 2*1 + 3*0 = 2.5
    // y[3] = 2*0.5 + 3*1 = 4
    // y[4] = 3*0.5 = 1.5
    const y = convolve([1, 2, 3], [0, 1, 0.5]);
    expect(y).toEqual([0, 1, 2.5, 4, 1.5]);
  });

  it('matches a hand-computed result for an asymmetric kernel', () => {
    // x = [1, 2, 3, 4], h = [1, -1] (difference kernel)
    // y[0] = 1*1 = 1
    // y[1] = 1*-1 + 2*1 = 1
    // y[2] = 2*-1 + 3*1 = 1
    // y[3] = 3*-1 + 4*1 = 1
    // y[4] = 4*-1 = -4
    const y = convolve([1, 2, 3, 4], [1, -1]);
    expect(y).toEqual([1, 1, 1, 1, -4]);
  });

  it('produces output of length N + M - 1', () => {
    const x = [1, 2, 3, 4, 5];
    const h = [1, 0, -1];
    expect(convolve(x, h)).toHaveLength(x.length + h.length - 1);
  });

  it('is commutative to within floating point tolerance', () => {
    const x = [0.3, -1.2, 2.7, 0.1, 4.4];
    const h = [1.1, -0.4, 0.2];
    const a = convolve(x, h);
    const b = convolve(h, x);
    expect(a).toHaveLength(b.length);
    for (let i = 0; i < a.length; i++) {
      expect(a[i]).toBeCloseTo(b[i], 9);
    }
  });

  it('returns an empty array for empty input', () => {
    expect(convolve([], [1, 2, 3])).toEqual([]);
    expect(convolve([1, 2, 3], [])).toEqual([]);
  });
});

describe('convolveSteps', () => {
  it('sums match convolve output exactly', () => {
    const x = [1, 2, 3, 4];
    const h = [0.5, 0.25, 0.1];
    const direct = convolve(x, h);
    const steps = convolveSteps(x, h);
    expect(steps).toHaveLength(direct.length);
    steps.forEach((step, i) => {
      expect(step.sum).toBeCloseTo(direct[i], 12);
      expect(step.n).toBe(i);
    });
  });

  it('each term reflects a genuine overlap between x and h', () => {
    const x = [1, 2, 3];
    const h = [10, 20];
    const steps = convolveSteps(x, h);
    for (const step of steps) {
      for (const term of step.terms) {
        expect(term.i + term.j).toBe(step.n);
        expect(term.xVal).toBe(x[term.i]);
        expect(term.hVal).toBe(h[term.j]);
        expect(term.product).toBeCloseTo(term.xVal * term.hVal, 12);
      }
    }
  });
});

describe('fftConvolve', () => {
  it('matches direct convolution to within 1e-9', () => {
    const x = [1, 2, 3, 4, 5, 0.5, -1, 2];
    const h = [0.2, -0.5, 1, 0.1];
    const direct = convolve(x, h);
    const viaFft = fftConvolve(x, h);
    expect(viaFft).toHaveLength(direct.length);
    for (let i = 0; i < direct.length; i++) {
      expect(viaFft[i]).toBeCloseTo(direct[i], 9);
    }
  });

  it('matches direct convolution for non-power-of-two lengths', () => {
    const x = [1, 0, -1, 2, 3];
    const h = [1, 1, 1];
    const direct = convolve(x, h);
    const viaFft = fftConvolve(x, h);
    for (let i = 0; i < direct.length; i++) {
      expect(viaFft[i]).toBeCloseTo(direct[i], 9);
    }
  });
});
