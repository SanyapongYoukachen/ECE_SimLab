import { describe, it, expect } from 'vitest';
import { solveDivider } from './divider';

describe('solveDivider', () => {
  it('matches the standard formula Vout = V * R2 / (R1 + R2)', () => {
    const r = solveDivider(9, 220, 470);
    expect(r.vOut).toBeCloseTo((9 * 470) / (220 + 470), 9);
  });

  it('splits the source voltage across the two drops exactly', () => {
    const r = solveDivider(5, 1000, 1000);
    expect(r.vR1 + r.vOut).toBeCloseTo(5, 9);
    expect(r.vOut).toBeCloseTo(2.5, 9);
  });

  it('equal resistors give a ratio of one half', () => {
    expect(solveDivider(5, 1000, 1000).ratio).toBeCloseTo(0.5, 9);
  });

  it('is degenerate-safe when both resistors are zero', () => {
    const r = solveDivider(5, 0, 0);
    expect(r.current).toBe(0);
    expect(r.vOut).toBe(0);
  });
});
