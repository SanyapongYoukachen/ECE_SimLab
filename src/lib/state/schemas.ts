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

export const TheoremPresetSchema = z.enum(['smooth', 'noisy', 'pulse']);

export const TheoremStateSchema = z.object({
  length: z.number().int().min(4).max(2048).default(64),
  preset: TheoremPresetSchema.default('smooth'),
});
export type TheoremState = z.infer<typeof TheoremStateSchema>;

export const CircuitModeSchema = z.enum(['ohm', 'network', 'divider']);
export type CircuitMode = z.infer<typeof CircuitModeSchema>;

export const TopologySchema = z.enum(['series', 'parallel']);
export type Topology = z.infer<typeof TopologySchema>;

export const CircuitStateSchema = z.object({
  mode: CircuitModeSchema.default('ohm'),
  voltage: z.number().min(0).max(24).default(9),
  r1: z.number().min(1).max(10000).default(220),
  r2: z.number().min(1).max(10000).default(470),
  topology: TopologySchema.default('series'),
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

/** Instructor lecture-mode flag: when true, prediction gates are skipped entirely. */
export const PredictFlagSchema = z
  .enum(['on', 'off'])
  .default('on')
  .transform((v) => v === 'on');
