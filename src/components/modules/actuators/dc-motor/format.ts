export function formatVoltage(volts: number): string {
  return `${volts.toFixed(2)} V`;
}

export function formatCurrent(amps: number): string {
  return `${amps.toFixed(3)} A`;
}

export function formatTorque(nm: number): string {
  return `${nm.toFixed(4)} N·m`;
}

export function formatSpeed(rpm: number): string {
  return `${rpm.toFixed(0)} RPM`;
}

export function formatPower(watts: number): string {
  return `${watts.toFixed(2)} W`;
}
