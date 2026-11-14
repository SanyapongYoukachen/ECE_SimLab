export interface DcMotorResult {
  /** The DC supply the PWM switch chops. */
  readonly supplyVoltage: number;
  /** PWM duty cycle, 0–1: the fraction of each period the switch is on. */
  readonly duty: number;
  /** Average armature voltage, duty × supplyVoltage — what the motor responds to. */
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
  /** The motor cannot overcome the load torque: it sits still drawing V/Ra. */
  readonly stalled: boolean;
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
 *
 * PWM is the averaged model: at a switching frequency well above the
 * armature's L/R corner, inductance smooths the current, so the motor sees
 * V = duty × supply. If that V cannot produce the load torque even at
 * standstill (K·V/Ra < Tl), the motor stalls rather than running backwards.
 */
export function solveDcMotor(
  supplyVoltage: number,
  armatureResistance: number,
  motorConstant: number,
  loadTorque: number,
  friction: number,
  duty = 1
): DcMotorResult {
  const ra = armatureResistance;
  const k = motorConstant;
  const voltage = supplyVoltage * duty;
  const denom = (ra * friction) / k + k;
  const freeSpeed = denom > 0 ? (voltage - (ra * loadTorque) / k) / denom : 0;
  const stalled = freeSpeed < 0;
  const speedRadPerSec = stalled ? 0 : freeSpeed;
  const current = stalled ? voltage / ra : (friction * speedRadPerSec + loadTorque) / k;
  const backEmf = k * speedRadPerSec;
  const torque = k * current;

  return {
    supplyVoltage,
    duty,
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
    stalled,
  };
}
