export interface Scale {
  /** data value -> pixel coordinate */
  toPixel(value: number): number;
  /** pixel coordinate -> data value */
  toValue(pixel: number): number;
  readonly domain: readonly [number, number];
  readonly range: readonly [number, number];
}

/** A linear scale mapping [domain] to [range]. Range may be inverted (e.g. y-down canvases). */
export function linearScale(
  domain: readonly [number, number],
  range: readonly [number, number]
): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const dSpan = d1 - d0;
  const rSpan = r1 - r0;

  return {
    domain,
    range,
    toPixel(value: number): number {
      if (dSpan === 0) return r0;
      return r0 + ((value - d0) / dSpan) * rSpan;
    },
    toValue(pixel: number): number {
      if (rSpan === 0) return d0;
      return d0 + ((pixel - r0) / rSpan) * dSpan;
    },
  };
}

/**
 * Computes a padded [min, max] domain from a set of values. Guards against
 * degenerate (empty, constant, or single-value) inputs so scales never
 * divide by zero.
 */
export function autoscale(values: readonly number[], paddingRatio = 0.15): [number, number] {
  if (values.length === 0) return [-1, 1];

  let min = values[0];
  let max = values[0];
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }

  if (min === max) {
    const pad = min === 0 ? 1 : Math.abs(min) * 0.5;
    return [min - pad, max + pad];
  }

  const span = max - min;
  const pad = span * paddingRatio;
  return [min - pad, max + pad];
}

/** Domain that always includes zero — appropriate for signal amplitude axes. */
export function autoscaleWithZero(
  values: readonly number[],
  paddingRatio = 0.15
): [number, number] {
  const [min, max] = autoscale([...values, 0], paddingRatio);
  return [min, max];
}

/** Chooses a "nice" tick step for an axis spanning `span` over roughly `targetCount` ticks. */
export function niceTickStep(span: number, targetCount = 5): number {
  if (span <= 0) return 1;
  const rough = span / targetCount;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;
  let niceResidual: number;
  if (residual < 1.5) niceResidual = 1;
  else if (residual < 3) niceResidual = 2;
  else if (residual < 7) niceResidual = 5;
  else niceResidual = 10;
  return niceResidual * magnitude;
}

export function tickValues(domain: readonly [number, number], targetCount = 5): number[] {
  const [d0, d1] = domain;
  const step = niceTickStep(d1 - d0, targetCount);
  const start = Math.ceil(d0 / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= d1 + step * 1e-9; v += step) {
    ticks.push(Math.round(v / step) * step);
  }
  return ticks;
}
