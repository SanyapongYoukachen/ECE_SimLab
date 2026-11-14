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

  it('PWM: the motor responds to the average voltage, duty × supply', () => {
    const pwm = solveDcMotor(24, 2, 0.05, 0.02, 0.001, 0.5);
    const dc = solveDcMotor(12, 2, 0.05, 0.02, 0.001);
    expect(pwm.voltage).toBeCloseTo(12, 9);
    expect(pwm.speedRadPerSec).toBeCloseTo(dc.speedRadPerSec, 9);
    expect(pwm.current).toBeCloseTo(dc.current, 9);
    expect(pwm.supplyVoltage).toBe(24);
  });

  it('PWM: full duty is the plain DC case, and less duty means less speed', () => {
    const full = solveDcMotor(12, 2, 0.05, 0.02, 0.001, 1);
    const half = solveDcMotor(12, 2, 0.05, 0.02, 0.001, 0.5);
    expect(full.speedRadPerSec).toBeCloseTo(124.444444, 4);
    expect(half.speedRadPerSec).toBeLessThan(full.speedRadPerSec);
    expect(half.speedRadPerSec).toBeGreaterThan(0);
  });

  it('stalls instead of running backwards when it cannot overcome the load', () => {
    // Stall torque at 10 % duty: K·V/Ra = 0.05 · 1.2 / 2 = 0.03 N·m < 0.05 N·m load.
    const r = solveDcMotor(12, 2, 0.05, 0.05, 0.001, 0.1);
    expect(r.stalled).toBe(true);
    expect(r.speedRadPerSec).toBe(0);
    expect(r.backEmf).toBe(0);
    expect(r.current).toBeCloseTo(1.2 / 2, 9);
    expect(r.torque).toBeLessThan(r.loadTorque);
    expect(r.mechPower).toBe(0);
    expect(r.inputPower).toBeCloseTo(r.lossPower, 9);
  });

  it('is not stalled when it can turn the load', () => {
    expect(solveDcMotor(12, 2, 0.05, 0.02, 0.001).stalled).toBe(false);
  });
});
