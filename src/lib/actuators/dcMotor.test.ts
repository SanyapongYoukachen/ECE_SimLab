import { describe, it, expect } from 'vitest';
import { solveDcMotor } from './dcMotor';

describe('solveDcMotor', () => {
  it('matches a hand-computed loaded case', () => {
    const r = solveDcMotor(12, 2, 0.05, 0.02, 0.001);
    expect(r.speedRadPerSec).toBeCloseTo(124.444444, 4);
    expect(r.current).toBeCloseTo(2.888889, 4);
    expect(r.backEmf).toBeCloseTo(6.222222, 4);
  });

  it('obeys the armature loop: V = I*Ra + backEmf', () => {
    const r = solveDcMotor(24, 3, 0.08, 0.05, 0.002);
    expect(r.voltage).toBeCloseTo(r.current * r.armatureResistance + r.backEmf, 9);
  });

  it('obeys the torque balance: torque = B*omega + loadTorque', () => {
    const r = solveDcMotor(24, 3, 0.08, 0.05, 0.002);
    expect(r.torque).toBeCloseTo(r.friction * r.speedRadPerSec + r.loadTorque, 9);
  });

  it('an unloaded, frictionless motor draws no current and spins at V/K', () => {
    const r = solveDcMotor(12, 2, 0.05, 0, 0);
    expect(r.current).toBeCloseTo(0, 9);
    expect(r.speedRadPerSec).toBeCloseTo(12 / 0.05, 6);
  });

  it('more load torque means less speed and more current', () => {
    const light = solveDcMotor(12, 2, 0.05, 0.01, 0.001);
    const heavy = solveDcMotor(12, 2, 0.05, 0.05, 0.001);
    expect(heavy.speedRadPerSec).toBeLessThan(light.speedRadPerSec);
    expect(heavy.current).toBeGreaterThan(light.current);
  });

  it('mechanical power never exceeds input power', () => {
    const r = solveDcMotor(12, 2, 0.05, 0.02, 0.001);
    expect(r.mechPower).toBeLessThanOrEqual(r.inputPower + 1e-9);
    expect(r.inputPower).toBeCloseTo(r.mechPower + r.lossPower, 6);
  });
});
