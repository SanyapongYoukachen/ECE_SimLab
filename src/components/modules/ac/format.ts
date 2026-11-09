/** Engineering-style formatting for the AC module: one to three decimals, auto-scaled units. */

function scaled(value: number, unit: string, big = 'k'): string {
  const abs = Math.abs(value);
  if (abs >= 1000) return `${(value / 1000).toFixed(abs >= 10_000 ? 1 : 2)} ${big}${unit}`;
  if (abs >= 100) return `${value.toFixed(0)} ${unit}`;
  if (abs >= 10) return `${value.toFixed(1)} ${unit}`;
  return `${value.toFixed(2)} ${unit}`;
}

export function formatVolts(v: number): string {
  return scaled(v, 'V');
}

export function formatAmps(a: number): string {
  if (Math.abs(a) < 1) return `${(a * 1000).toFixed(Math.abs(a) < 0.01 ? 2 : 1)} mA`;
  return scaled(a, 'A');
}

export function formatWatts(w: number): string {
  return scaled(w, 'W');
}

export function formatVar(q: number): string {
  return scaled(q, 'var');
}

export function formatVa(s: number): string {
  return scaled(s, 'VA');
}

export function formatOhms(ohms: number): string {
  return scaled(ohms, 'Ω');
}

export function formatHz(hz: number): string {
  return `${hz.toFixed(hz < 10 ? 2 : 1)} Hz`;
}

export function formatDegrees(rad: number): string {
  const deg = (rad * 180) / Math.PI;
  return `${Math.abs(deg) < 0.05 ? '0.0' : deg.toFixed(1)}°`;
}

export function formatMs(seconds: number): string {
  return `${(seconds * 1000).toFixed(seconds < 0.01 ? 2 : 1)} ms`;
}

/** Z = R ± jX, the rectangular form students write by hand. */
export function formatImpedance(re: number, im: number): string {
  const sign = im < 0 ? '−' : '+';
  return `${Number(re.toFixed(2))} ${sign} j${Number(Math.abs(im).toFixed(2))} Ω`;
}
