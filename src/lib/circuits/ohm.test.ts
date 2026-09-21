import { describe, it, expect } from 'vitest';
import { solveOhm, loadLine } from './ohm';

describe('solveOhm', () => {
  it('matches a hand-computed result', () => {
    // I = 9V / 220Ω = 0.04090909..., P = VI = 0.368181...
    const r = solveOhm(9, 220);
    expect(r.current).toBeCloseTo(0.0409091, 6);
    expect(r.power).toBeCloseTo(0.3681818, 6);
  });

  it('doubling resistance halves current at fixed voltage', () => {
    const a = solveOhm(12, 100);
    const b = solveOhm(12, 200);
    expect(b.current).toBeCloseTo(a.current / 2, 9);
  });

  it('treats a non-positive resistance as an open circuit', () => {
    expect(solveOhm(5, 0).current).toBe(0);
    expect(solveOhm(5, -10).current).toBe(0);
  });
});

describe('loadLine', () => {
  it('samples I = V / R across the requested voltage span', () => {
    const line = loadLine(100, 10, 2);
    expect(line.vs).toEqual([0, 5, 10]);
    line.vs.forEach((v, i) => expect(line.is[i]).toBeCloseTo(v / 100, 9));
  });

  it('is flat at zero for an open circuit', () => {
    const line = loadLine(0, 10, 2);
    expect(line.is).toEqual([0, 0, 0]);
  });
});
