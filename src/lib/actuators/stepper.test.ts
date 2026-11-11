import { describe, it, expect } from 'vitest';
import {
  solveStepper,
  effectiveStepsPerRev,
  sequenceFor,
  FULL_STEP_SEQUENCE,
  HALF_STEP_SEQUENCE,
} from './stepper';

describe('effectiveStepsPerRev / sequenceFor', () => {
  it('half-stepping doubles the resolution of full-stepping', () => {
    expect(effectiveStepsPerRev(24, 'full')).toBe(24);
    expect(effectiveStepsPerRev(24, 'half')).toBe(48);
  });

  it('picks the right sequence table', () => {
    expect(sequenceFor('full')).toBe(FULL_STEP_SEQUENCE);
    expect(sequenceFor('half')).toBe(HALF_STEP_SEQUENCE);
  });
});

describe('solveStepper', () => {
  it('sits at step 0 at t=0', () => {
    const r = solveStepper(0, 4, 'cw', 24, 'full');
    expect(r.stepIndex).toBe(0);
    expect(r.positionSteps).toBe(0);
    expect(r.angleDeg).toBe(0);
    expect(r.activeCoils).toEqual(FULL_STEP_SEQUENCE[0]);
  });

  it('advances one step per 1/stepRate seconds', () => {
    const stepRate = 5;
    const r = solveStepper(1 / stepRate + 1e-6, stepRate, 'cw', 24, 'full');
    expect(r.stepIndex).toBe(1);
  });

  it('runs backwards under ccw', () => {
    const stepRate = 5;
    const r = solveStepper(1 / stepRate + 1e-6, stepRate, 'ccw', 24, 'full');
    expect(r.stepIndex).toBe(-1);
  });

  it('wraps position into one revolution', () => {
    const r = solveStepper(10, 4, 'cw', 24, 'full'); // 40 steps elapsed, 24 steps/rev
    expect(r.stepIndex).toBe(40);
    expect(r.positionSteps).toBe(40 % 24);
    expect(r.positionSteps).toBeGreaterThanOrEqual(0);
    expect(r.positionSteps).toBeLessThan(24);
  });

  it('wraps a negative position into [0, effectiveStepsPerRev) too', () => {
    const r = solveStepper(10, 4, 'ccw', 24, 'full');
    expect(r.positionSteps).toBeGreaterThanOrEqual(0);
    expect(r.positionSteps).toBeLessThan(24);
  });

  it('cycles through the active-coil sequence in order', () => {
    const stepRate = 1;
    for (let i = 0; i < FULL_STEP_SEQUENCE.length; i++) {
      const r = solveStepper(i / stepRate + 1e-6, stepRate, 'cw', 24, 'full');
      expect(r.activeCoils).toEqual(FULL_STEP_SEQUENCE[i % FULL_STEP_SEQUENCE.length]);
    }
  });

  it('rpm matches stepRate * 60 / effectiveStepsPerRev', () => {
    const r = solveStepper(0, 10, 'cw', 48, 'half');
    expect(r.rpm).toBeCloseTo((10 * 60) / effectiveStepsPerRev(48, 'half'), 9);
  });
});
