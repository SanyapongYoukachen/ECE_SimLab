const PREFIXES: readonly [number, string][] = [
  [1e6, 'M'],
  [1e3, 'k'],
  [1, ''],
  [1e-3, 'm'],
  [1e-6, 'µ'],
  [1e-9, 'n'],
  [1e-12, 'p'],
];

/** Engineering notation: 0.00123 A → "1.23 mA", 47000 Ω → "47.0 kΩ". */
export function eng(value: number, unit: string, digits = 3): string {
  if (value === 0 || !Number.isFinite(value)) return `0 ${unit}`;
  const abs = Math.abs(value);
  for (const [scale, prefix] of PREFIXES) {
    if (abs >= scale * 0.9995) {
      const v = value / scale;
      // toPrecision(2) on 100 gives "1.0e+2"; whole numbers that long print plainly.
      const str = Math.abs(v) >= 10 ** digits ? v.toFixed(0) : v.toPrecision(digits);
      return `${str} ${prefix}${unit}`;
    }
  }
  return `${value.toExponential(2)} ${unit}`;
}

export function volts(v: number, digits = 3): string {
  return `${v.toFixed(digits)} V`;
}

/** Doping like 1.0 × 10¹⁶ cm⁻³. */
export function doping(n: number): string {
  const exp = Math.floor(Math.log10(n));
  const mant = n / Math.pow(10, exp);
  const sup = String(exp)
    .split('')
    .map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)] ?? d)
    .join('');
  return `${mant.toFixed(1)} × 10${sup} cm⁻³`;
}

/** Lengths in µm. */
export function microns(cm: number): string {
  const um = cm * 1e4;
  return `${um < 1 ? um.toFixed(3) : um.toFixed(2)} µm`;
}

/** A ratio that can be astronomically large: ×1.0e10. */
export function hugeRatio(r: number): string {
  if (Math.abs(r) < 1000) return `×${r.toFixed(2)}`;
  return `×${r.toExponential(1).replace('e+', 'e')}`;
}
