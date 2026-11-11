import { describe, it, expect } from 'vitest';
import { solveRelay } from './relay';

describe('solveRelay', () => {
  it('stays de-energized, resting on NC, below the pull-in threshold', () => {
    const r = solveRelay(5, 400, 20, 12, 100); // 12.5 mA < 20 mA
    expect(r.coilCurrentMa).toBeCloseTo(12.5, 6);
    expect(r.energized).toBe(false);
    expect(r.activeContact).toBe('NC');
  });

  it('pulls in to NO once coil current reaches the threshold', () => {
    const r = solveRelay(12, 400, 20, 12, 100); // 30 mA >= 20 mA
    expect(r.coilCurrentMa).toBeCloseTo(30, 6);
    expect(r.energized).toBe(true);
    expect(r.activeContact).toBe('NO');
  });

  it('pulls in exactly at the threshold (inclusive)', () => {
    const r = solveRelay(8, 400, 20, 12, 100); // exactly 20 mA
    expect(r.coilCurrentMa).toBeCloseTo(20, 6);
    expect(r.energized).toBe(true);
  });

  it('the load is wired through NO: no current flows until the relay energizes', () => {
    const off = solveRelay(5, 400, 20, 12, 100);
    const on = solveRelay(12, 400, 20, 12, 100);
    expect(off.loadCurrent).toBe(0);
    expect(on.loadCurrent).toBeCloseTo(0.12, 9);
  });

  it('a lower pull-in threshold energizes at the same coil current that used to be too weak', () => {
    const weakThreshold = solveRelay(5, 400, 10, 12, 100); // 12.5 mA >= 10 mA now
    expect(weakThreshold.energized).toBe(true);
  });
});
