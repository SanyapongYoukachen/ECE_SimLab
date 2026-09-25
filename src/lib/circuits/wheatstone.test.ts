import { describe, it, expect } from 'vitest';
import { balancingR4, galvanometerDeflection, solveWheatstoneBridge } from './wheatstone';

describe('solveWheatstoneBridge', () => {
  it('is balanced (zero galvanometer current) whenever R1*R4 = R2*R3', () => {
    const r = solveWheatstoneBridge(9, 100, 200, 150, 300, 50);
    expect(r.balanced).toBe(true);
    expect(r.ig).toBeCloseTo(0, 9);
    expect(r.vb).toBeCloseTo(r.vc, 9);
    // Isolated-divider check: Vb = V*R2/(R1+R2) when ig = 0.
    expect(r.vb).toBeCloseTo((9 * 200) / 300, 9);
  });

  it('balance does not depend on the galvanometer resistance', () => {
    const low = solveWheatstoneBridge(12, 100, 200, 150, 300, 1);
    const high = solveWheatstoneBridge(12, 100, 200, 150, 300, 100000);
    expect(low.ig).toBeCloseTo(0, 6);
    expect(high.ig).toBeCloseTo(0, 6);
    expect(low.vb).toBeCloseTo(high.vb, 6);
  });

  it('matches a hand-computed unbalanced case', () => {
    const r = solveWheatstoneBridge(12, 100, 100, 100, 300, 50);
    expect(r.vb).toBeCloseTo(6.857142857, 6);
    expect(r.vc).toBeCloseTo(7.714285714, 6);
    expect(r.balanced).toBe(false);
    expect(r.ig).toBeLessThan(0); // pulled C -> B since the right side sits at a higher potential
  });

  it('obeys KCL at both bridge nodes for an asymmetric network', () => {
    const r = solveWheatstoneBridge(15, 220, 470, 330, 100, 75);
    // Node B: current in from A equals current out to D plus current out to C.
    expect(r.i1).toBeCloseTo(r.i2 + r.ig, 9);
    // Node C: current in from A plus current in from B equals current out to D.
    expect(r.i3 + r.ig).toBeCloseTo(r.i4, 9);
  });

  it('flips the sign of ig when R4 crosses the balance point', () => {
    const below = solveWheatstoneBridge(9, 100, 100, 100, 90, 50);
    const above = solveWheatstoneBridge(9, 100, 100, 100, 110, 50);
    expect(below.ig).toBeGreaterThan(0);
    expect(above.ig).toBeLessThan(0);
  });
});

describe('balancingR4', () => {
  it('returns the R4 that satisfies R1*R4 = R2*R3', () => {
    const r4 = balancingR4(300, 100, 100);
    expect(r4).toBeCloseTo(33.3333333, 6);
    expect(solveWheatstoneBridge(9, 300, 100, 100, r4, 50).balanced).toBe(true);
  });
});

describe('galvanometerDeflection', () => {
  it('is zero at balance, signed with ig, and saturates toward +/-1', () => {
    expect(galvanometerDeflection(0)).toBe(0);
    expect(galvanometerDeflection(1e-4)).toBeGreaterThan(0);
    expect(galvanometerDeflection(-1e-4)).toBeLessThan(0);
    expect(galvanometerDeflection(1)).toBeCloseTo(1, 9);
    expect(galvanometerDeflection(-1)).toBeCloseTo(-1, 9);
  });

  it('moves visibly for a single 10-ohm slider step off balance', () => {
    const r = solveWheatstoneBridge(9, 100, 100, 100, 110, 100);
    expect(Math.abs(galvanometerDeflection(r.ig))).toBeGreaterThan(0.2);
  });
});
