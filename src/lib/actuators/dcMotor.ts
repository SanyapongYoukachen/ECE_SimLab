export interface DcMotorResult {
  readonly voltage: number;
  readonly armatureResistance: number;
  readonly motorConstant: number;
  readonly loadTorque: number;
  readonly friction: number;
  readonly current: number;
  readonly speedRadPerSec: number;
  readonly speedRpm: number;
  readonly torque: number;
  readonly backEmf: number;
  readonly inputPower: number;
  readonly mechPower: number;
  readonly lossPower: number;
}

/**
 * Steady-state (no acceleration) DC motor model. Two linear equations —
 * the armature loop (V = I·Ra + Ke·ω) and the torque balance at constant
 * speed (Kt·I = B·ω + Tl) — reduce, with Kt = Ke = K, to one equation in ω:
 *
 *   ω = (V − Ra·Tl/K) / (Ra·B/K + K)
 *
 * solved directly rather than iteratively, the same spirit as the
 * Wheatstone bridge's nodal analysis.
 */
export function solveDcMotor(
  voltage: number,
  armatureResistance: number,
  motorConstant: number,
  loadTorque: number,
  friction: number
): DcMotorResult {
  const ra = armatureResistance;
  const k = motorConstant;
  const denom = (ra * friction) / k + k;
  const speedRadPerSec = denom > 0 ? (voltage - (ra * loadTorque) / k) / denom : 0;
  const current = (friction * speedRadPerSec + loadTorque) / k;
  const backEmf = k * speedRadPerSec;
  const torque = k * current;

  return {
    voltage,
    armatureResistance,
    motorConstant,
    loadTorque,
    friction,
    current,
    speedRadPerSec,
    speedRpm: (speedRadPerSec * 60) / (2 * Math.PI),
    torque,
    backEmf,
    inputPower: voltage * current,
    mechPower: torque * speedRadPerSec,
    lossPower: current * current * ra,
  };
}
