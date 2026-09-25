import { describe, it, expect } from 'vitest';
import { solveWheatstoneBridge } from './wheatstone';

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
