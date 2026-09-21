export type Topology = 'series' | 'parallel';

export interface NetworkResult {
  readonly topology: Topology;
  readonly r1: number;
  readonly r2: number;
  readonly equivalent: number;
  readonly totalCurrent: number;
  readonly i1: number;
  readonly i2: number;
  readonly v1: number;
  readonly v2: number;
  readonly p1: number;
  readonly p2: number;
}

export function seriesEquivalent(r1: number, r2: number): number {
  return r1 + r2;
}

export function parallelEquivalent(r1: number, r2: number): number {
  const sum = r1 + r2;
  return sum > 0 ? (r1 * r2) / sum : 0;
}

/**
 * Solves a source V driving two resistors, either sharing one current path
 * (series: same I, V splits) or sharing one voltage (parallel: same V, I splits).
 */
export function solveNetwork(
  voltage: number,
  r1: number,
  r2: number,
  topology: Topology
): NetworkResult {
  if (topology === 'series') {
    const equivalent = seriesEquivalent(r1, r2);
    const i = equivalent > 0 ? voltage / equivalent : 0;
    const v1 = i * r1;
    const v2 = i * r2;
    return {
      topology,
      r1,
      r2,
      equivalent,
      totalCurrent: i,
      i1: i,
      i2: i,
      v1,
      v2,
      p1: v1 * i,
      p2: v2 * i,
    };
  }

  const equivalent = parallelEquivalent(r1, r2);
  const i1 = r1 > 0 ? voltage / r1 : 0;
  const i2 = r2 > 0 ? voltage / r2 : 0;
  return {
    topology,
    r1,
    r2,
    equivalent,
    totalCurrent: i1 + i2,
    i1,
    i2,
    v1: voltage,
    v2: voltage,
    p1: voltage * i1,
    p2: voltage * i2,
  };
}
