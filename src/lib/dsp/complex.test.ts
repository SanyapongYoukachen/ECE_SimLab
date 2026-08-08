import { describe, it, expect } from 'vitest';
import { add, sub, mul, div, conjugate, magnitude, phase, fromPolar, complex } from './complex';

describe('complex arithmetic', () => {
  const a = complex(3, 4);
  const b = complex(1, -2);

  it('adds', () => {
    expect(add(a, b)).toEqual({ re: 4, im: 2 });
  });

  it('subtracts', () => {
    expect(sub(a, b)).toEqual({ re: 2, im: 6 });
  });

  it('multiplies', () => {
    // (3+4i)(1-2i) = 3 -6i +4i -8i^2 = 3 -2i +8 = 11 - 2i
    expect(mul(a, b)).toEqual({ re: 11, im: -2 });
  });

  it('divides', () => {
    const result = div(a, b);
    // verify by multiplying back
    const back = mul(result, b);
    expect(back.re).toBeCloseTo(a.re, 9);
    expect(back.im).toBeCloseTo(a.im, 9);
  });

  it('computes conjugate', () => {
    expect(conjugate(a)).toEqual({ re: 3, im: -4 });
  });

  it('computes magnitude', () => {
    expect(magnitude(a)).toBe(5);
  });

  it('computes phase', () => {
    expect(phase(complex(1, 1))).toBeCloseTo(Math.PI / 4, 12);
  });

  it('fromPolar is the inverse of magnitude/phase', () => {
    const c = fromPolar(5, Math.PI / 4);
    expect(c.re).toBeCloseTo(5 * Math.SQRT1_2, 9);
    expect(c.im).toBeCloseTo(5 * Math.SQRT1_2, 9);
  });
});
