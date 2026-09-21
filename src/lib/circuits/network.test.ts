import { describe, it, expect } from 'vitest';
import { solveNetwork, seriesEquivalent, parallelEquivalent } from './network';

describe('series', () => {
  it('adds resistances and shares one current', () => {
    // Req = 220 + 470 = 690, I = 9/690, V1 = I*220, V2 = I*470
    const r = solveNetwork(9, 220, 470, 'series');
    expect(r.equivalent).toBe(690);
    expect(r.i1).toBeCloseTo(r.i2, 12);
    expect(r.i1).toBeCloseTo(9 / 690, 9);
    expect(r.v1 + r.v2).toBeCloseTo(9, 9);
  });
});

describe('parallel', () => {
  it('combines resistances reciprocally and shares one voltage', () => {
    // Req = (220*470)/(220+470) ≈ 149.855...
    const r = solveNetwork(9, 220, 470, 'parallel');
    expect(r.equivalent).toBeCloseTo((220 * 470) / 690, 6);
    expect(r.v1).toBe(9);
    expect(r.v2).toBe(9);
    expect(r.totalCurrent).toBeCloseTo(r.i1 + r.i2, 12);
  });

  it('total current matches V / equivalent resistance', () => {
    const r = solveNetwork(12, 100, 300, 'parallel');
    expect(r.totalCurrent).toBeCloseTo(12 / r.equivalent, 9);
  });
});

describe('seriesEquivalent / parallelEquivalent', () => {
  it('parallel of equal resistors halves the value', () => {
    expect(parallelEquivalent(100, 100)).toBeCloseTo(50, 9);
  });

  it('series equivalent is never less than the larger resistor', () => {
    expect(seriesEquivalent(220, 470)).toBeGreaterThanOrEqual(470);
  });
});
