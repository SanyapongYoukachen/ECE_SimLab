export function formatAngle(deg: number): string {
  return `${deg.toFixed(1)}°`;
}

export function formatRpm(rpm: number): string {
  return `${rpm.toFixed(1)} RPM`;
}

export function formatStepAngle(deg: number): string {
  return `${deg.toFixed(2)}°/step`;
}
