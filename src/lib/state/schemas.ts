import { z } from 'zod';

export const KernelIdSchema = z.enum(['rect', 'tri', 'expo', 'diff']);
export type KernelId = z.infer<typeof KernelIdSchema>;

export const WindowTypeSchema = z.enum(['rect', 'hann', 'hamming', 'blackman']);

export const ConvolutionStateSchema = z.object({
  kernel: KernelIdSchema.default('rect'),
  x: z
    .array(z.number().min(-2).max(2))
    .min(3)
    .max(12)
    .default([0.2, 0.6, 1, 0.8, 0.4, 0.1, -0.3, 0.5]),
  n: z.number().int().min(0).default(0),
});
export type ConvolutionState = z.infer<typeof ConvolutionStateSchema>;

export const FourierPresetSchema = z.object({
  amp1: z.number().min(0).max(1).default(1),
  amp2: z.number().min(0).max(1).default(0.6),
  amp3: z.number().min(0).max(1).default(0.4),
  // Range covers 0..Nyquist (4000 Hz) for SAMPLE_RATE=8000; default sits on
  // bin 10 (10 * 31.25 Hz) so the spectrum starts clean, letting the student
  // move it off-bin themselves per the module's prediction question.
  freq3: z.number().min(0).max(4000).default(312.5),
  window: WindowTypeSchema.default('rect'),
});
export type FourierState = z.infer<typeof FourierPresetSchema>;

/** Module 3, AC circuits. Defaults are Thai mains: 220 V rms (311 V peak), 50 Hz. */
export const AcStateSchema = z.object({
  mode: z.enum(['generator', 'sine', 'load', 'threephase']).default('generator'),
  // Sine-wave section
  shape: z.enum(['sine', 'square', 'triangle']).default('sine'),
  peak: z.number().min(1).max(400).default(311),
  phase: z.number().min(-180).max(180).default(0),
  // Shared by both sections
  freq: z.number().min(1).max(200).default(50),
  // Load section (series R / L / C across a sinusoidal source)
  load: z.enum(['r', 'l', 'c', 'rl', 'rc', 'rlc']).default('rl'),
  vrms: z.number().min(1).max(240).default(220),
  r: z.number().min(1).max(200).default(10),
  /** Inductance in mH. */
  l: z.number().min(1).max(500).default(50),
  /** Capacitance in µF. */
  c: z.number().min(1).max(1000).default(100),
  // Generator section (single-phase coil in a field)
  turns: z.number().min(1).max(500).default(100),
  /** Flux density, T. */
  flux: z.number().min(0.05).max(1.5).default(0.5),
  /** Coil area, m². */
  area: z.number().min(0.001).max(0.05).default(0.01),
  rpm: z.number().min(0).max(3600).default(3000),
  poles: z.number().int().min(2).max(12).multipleOf(2).default(2),
  rload: z.number().min(1).max(1000).default(100),
  ra: z.number().min(0.1).max(20).default(1),
  // Three-phase section (230/400 V, like Thai low-voltage supply)
  vph: z.number().min(50).max(400).default(230),
  conn: z.enum(['wye', 'delta']).default('wye'),
  rph: z.number().min(1).max(200).default(20),
  xph: z.number().min(0).max(200).default(10),
  /** Phase a's load relative to b and c: 1 = balanced. */
  unb: z.number().min(0.2).max(3).default(1),
});
export type AcState = z.infer<typeof AcStateSchema>;

/**
 * Module 5, sensors as a measurement chain. Defaults are each sensor's
 * reference point: 100 lx of green light, and 25 °C.
 */
export const SensorsStateSchema = z.object({
  sensor: z.enum(['ldr', 'ntc']).default('ldr'),
  lux: z.number().min(1).max(10000).default(100),
  color: z.enum(['blue', 'green', 'red', 'ir']).default('green'),
  temp: z.number().min(-20).max(100).default(25),
  /** Draw moving charge as electrons (− → +) or as conventional current (+ → −). */
  flow: z.enum(['electron', 'conventional']).default('electron'),
});
export type SensorsState = z.infer<typeof SensorsStateSchema>;

/**
 * Module 7, electronics. The section comes from the page path
 * (/electronics/<topic>); the rest are each section's controls.
 */
export const ElectronicsStateSchema = z.object({
  mode: z.enum(['pn', 'diode', 'bjt', 'amp']).default('pn'),
  // P/N junction: doping in cm⁻³, applied bias in V
  na: z.number().min(1e14).max(1e18).default(1e16),
  nd: z.number().min(1e14).max(1e18).default(1e16),
  va: z.number().min(-10).max(0.65).default(0),
  // Diode circuit
  kind: z.enum(['si', 'ge', 'red', 'green', 'blue']).default('si'),
  approx: z.enum(['ideal', 'drop', 'exp']).default('exp'),
  vs: z.number().min(-10).max(15).default(5),
  rd: z.number().min(10).max(10000).default(430),
  // BJT bias circuit (VCC and β shared with the amplifier)
  vbb: z.number().min(0).max(5).default(2),
  rb: z.number().min(1000).max(1_000_000).default(100_000),
  vcc: z.number().min(3).max(20).default(12),
  rc: z.number().min(100).max(10_000).default(2200),
  beta: z.number().min(20).max(400).default(100),
  // Common-emitter amplifier
  r1: z.number().min(1000).max(470_000).default(100_000),
  r2: z.number().min(1000).max(100_000).default(22_000),
  rca: z.number().min(100).max(20_000).default(4700),
  re: z.number().min(0).max(5000).default(1000),
  rl: z.number().min(1000).max(100_000).default(10_000),
  byp: z.enum(['on', 'off']).default('on'),
  /** Input amplitude, mV peak. */
  vin: z.number().min(1).max(200).default(2),
});
export type ElectronicsState = z.infer<typeof ElectronicsStateSchema>;

export const CircuitModeSchema = z.enum(['ohm', 'network', 'divider', 'thevenin', 'mesh']);
export type CircuitMode = z.infer<typeof CircuitModeSchema>;

export const TopologySchema = z.enum(['series', 'parallel']);
export type Topology = z.infer<typeof TopologySchema>;

export const CircuitStateSchema = z.object({
  mode: CircuitModeSchema.default('ohm'),
  voltage: z.number().min(0).max(24).default(9),
  r1: z.number().min(1).max(10000).default(220),
  r2: z.number().min(1).max(10000).default(470),
  topology: TopologySchema.default('series'),
  // Thévenin/Norton and mesh/node sections (R1, R2 and `voltage` are shared).
  r3: z.number().min(1).max(10000).default(330),
  rl: z.number().min(1).max(10000).default(1000),
  /** Second source for mesh/node analysis. */
  v2: z.number().min(0).max(24).default(5),
  /** Which form of the source network to draw: as built, or its equivalents. */
  equiv: z.enum(['original', 'thevenin', 'norton']).default('original'),
  method: z.enum(['mesh', 'node']).default('mesh'),
});
export type CircuitState = z.infer<typeof CircuitStateSchema>;

export const SimulatorTabSchema = z.enum(['wheatstone']);
export type SimulatorTab = z.infer<typeof SimulatorTabSchema>;

export const SimulatorStateSchema = z.object({
  tab: SimulatorTabSchema.default('wheatstone'),
});
export type SimulatorState = z.infer<typeof SimulatorStateSchema>;

export const WheatstoneStateSchema = z.object({
  voltage: z.number().min(0).max(24).default(9),
  r1: z.number().min(1).max(10000).default(100),
  r2: z.number().min(1).max(10000).default(100),
  r3: z.number().min(1).max(10000).default(100),
  r4: z.number().min(1).max(10000).default(150),
  rg: z.number().min(1).max(10000).default(100),
  /** 'free': every arm on a slider. 'sensing': a quarter bridge — one sensor arm, three fixed. */
  mode: z.enum(['free', 'sensing']).default('free'),
  sensor: z.enum(['ldr', 'ntc', 'rtd', 'strain', 'pot']).default('ntc'),
  arm: z.enum(['r1', 'r2', 'r3', 'r4']).default('r4'),
  // One reading per sensor, so switching sensor type doesn't clobber the others.
  lux: z.number().min(1).max(10000).default(100),
  ntc: z.number().min(-20).max(100).default(25),
  rtd: z.number().min(-50).max(200).default(0),
  strain: z.number().min(-2000).max(2000).default(0),
  pot: z.number().min(10).max(1990).default(1000),
  config: z.enum(['quarter', 'half', 'full']).default('quarter'),
});
export type WheatstoneState = z.infer<typeof WheatstoneStateSchema>;

/** Which section of a module is showing: the interactive content, or its understanding check. */
export const ModuleViewStateSchema = z.object({
  view: z.enum(['explore', 'quiz']).default('explore'),
});
export type ModuleViewState = z.infer<typeof ModuleViewStateSchema>;

/** Instructor lecture-mode flag: when true, prediction gates are skipped entirely. */
export const PredictFlagSchema = z
  .enum(['on', 'off'])
  .default('on')
  .transform((v) => v === 'on');
