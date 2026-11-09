import { describe, it, expect } from 'vitest';
import { solveWheatstoneBridge } from '@/lib/circuits/wheatstone';
import { decodeWheatstoneState, encodeWheatstoneState } from './urlState';
import { WheatstoneStateSchema } from './schemas';

describe('Wheatstone URL codec', () => {
  it('round-trips a solved balance point without breaking balance', () => {
    const state = { ...WheatstoneStateSchema.parse({}), r1: 300, r2: 100, r3: 100 };
    const balanced = { ...state, r4: (state.r2 * state.r3) / state.r1 };
    const decoded = decodeWheatstoneState(encodeWheatstoneState(balanced));
    const r = solveWheatstoneBridge(
      decoded.voltage,
      decoded.r1,
      decoded.r2,
      decoded.r3,
      decoded.r4,
      decoded.rg
    );
    expect(r.balanced).toBe(true);
  });

  it('keeps whole-ohm values short in the URL', () => {
    const params = encodeWheatstoneState(WheatstoneStateSchema.parse({}));
    expect(params.get('r1')).toBe('100');
    expect(params.get('voltage')).toBe('9');
  });
});
