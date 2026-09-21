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

/** Instructor lecture-mode flag: when true, prediction gates are skipped entirely. */
export const PredictFlagSchema = z
  .enum(['on', 'off'])
  .default('on')
  .transform((v) => v === 'on');
