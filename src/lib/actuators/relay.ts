export interface RelayResult {
  readonly coilVoltage: number;
  readonly coilResistance: number;
  /** Pull-in threshold, in milliamps. */
  readonly pullInCurrent: number;
  readonly coilCurrent: number;
  readonly coilCurrentMa: number;
  readonly energized: boolean;
  readonly loadVoltage: number;
  readonly loadResistance: number;
  readonly loadCurrent: number;
  /** Which contact the common pole is currently resting on. */
  readonly activeContact: 'NO' | 'NC';
}

/**
 * An electromagnetic SPDT relay: the coil obeys Ohm's law, and the armature
 * (common pole) sits on NC until coil current reaches the pull-in threshold,
 * then snaps to NO. The load is wired through NO only — the common,
 * realistic "energize to power the load" arrangement — so load current
 * flows exactly when the relay is energized; NC is just where the armature
 * rests, not a second route to the load.
 */
export function solveRelay(
  coilVoltage: number,
  coilResistance: number,
  pullInCurrent: number,
  loadVoltage: number,
  loadResistance: number
): RelayResult {
  const coilCurrent = coilResistance > 0 ? coilVoltage / coilResistance : 0;
  const coilCurrentMa = coilCurrent * 1000;
  const energized = coilCurrentMa >= pullInCurrent;
  const loadCurrent = energized && loadResistance > 0 ? loadVoltage / loadResistance : 0;

  return {
    coilVoltage,
    coilResistance,
    pullInCurrent,
    coilCurrent,
    coilCurrentMa,
    energized,
    loadVoltage,
    loadResistance,
    loadCurrent,
    activeContact: energized ? 'NO' : 'NC',
  };
}
