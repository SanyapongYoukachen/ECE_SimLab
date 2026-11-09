export type StepperMode = 'full' | 'half';
export type StepperDirection = 'cw' | 'ccw';

/** Two coils energized at a time — the common full-step bipolar drive sequence. */
export const FULL_STEP_SEQUENCE: readonly (readonly string[])[] = [
  ['A', 'B'],
  ['B', 'C'],
  ['C', 'D'],
  ['D', 'A'],
];

/** Alternates one- and two-coil states, doubling angular resolution over full-step. */
export const HALF_STEP_SEQUENCE: readonly (readonly string[])[] = [
  ['A'],
  ['A', 'B'],
  ['B'],
  ['B', 'C'],
  ['C'],
  ['C', 'D'],
  ['D'],
  ['D', 'A'],
];

export function sequenceFor(mode: StepperMode): readonly (readonly string[])[] {
  return mode === 'half' ? HALF_STEP_SEQUENCE : FULL_STEP_SEQUENCE;
}

/** Half-stepping visits twice as many rotor positions per revolution as full-stepping. */
export function effectiveStepsPerRev(stepsPerRev: number, mode: StepperMode): number {
  return mode === 'half' ? stepsPerRev * 2 : stepsPerRev;
}

export interface StepperResult {
  /** Signed step count since t=0 — negative once the motor has run CCW. */
  readonly stepIndex: number;
  /** stepIndex wrapped into one revolution, always in [0, effectiveStepsPerRev). */
  readonly positionSteps: number;
  readonly angleDeg: number;
  readonly activeCoils: readonly string[];
  readonly rpm: number;
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Where a stepper sits at a given moment: purely a function of elapsed time
 * and the step rate, not an integrated/accumulated simulation — so scrubbing
 * the rate or direction never drifts from what the formula says it should be.
 */
export function solveStepper(
  elapsedSec: number,
  stepRate: number,
  direction: StepperDirection,
  stepsPerRev: number,
  mode: StepperMode
): StepperResult {
  const dirSign = direction === 'cw' ? 1 : -1;
  const effSteps = effectiveStepsPerRev(stepsPerRev, mode);
  const stepIndex = Math.floor(elapsedSec * stepRate) * dirSign;
  const positionSteps = mod(stepIndex, effSteps);
  const sequence = sequenceFor(mode);
  const activeCoils = sequence[mod(stepIndex, sequence.length)];

  return {
    stepIndex,
    positionSteps,
    angleDeg: (positionSteps / effSteps) * 360,
    activeCoils,
    rpm: (stepRate * 60) / effSteps,
  };
}
