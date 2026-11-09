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
});
export type WheatstoneState = z.infer<typeof WheatstoneStateSchema>;

export const ActuatorTabSchema = z.enum(['dcmotor', 'stepper', 'relay']);
export type ActuatorTab = z.infer<typeof ActuatorTabSchema>;

export const ActuatorsStateSchema = z.object({
  tab: ActuatorTabSchema.default('dcmotor'),
});
export type ActuatorsState = z.infer<typeof ActuatorsStateSchema>;

export const DcMotorStateSchema = z.object({
  voltage: z.number().min(0).max(48).default(12),
  armatureResistance: z.number().min(0.1).max(50).default(2),
  motorConstant: z.number().min(0.005).max(0.5).default(0.05),
  loadTorque: z.number().min(0).max(2).default(0.02),
  friction: z.number().min(0).max(0.02).default(0.001),
});
export type DcMotorState = z.infer<typeof DcMotorStateSchema>;

export const StepperDirectionSchema = z.enum(['cw', 'ccw']);
export type StepperDirection = z.infer<typeof StepperDirectionSchema>;

export const StepperModeSchema = z.enum(['full', 'half']);
export type StepperMode = z.infer<typeof StepperModeSchema>;

export const StepperStateSchema = z.object({
  stepRate: z.number().min(0).max(20).default(4),
  stepsPerRev: z.number().int().min(4).max(200).default(24),
  direction: StepperDirectionSchema.default('cw'),
  mode: StepperModeSchema.default('full'),
});
export type StepperState = z.infer<typeof StepperStateSchema>;

export const RelayStateSchema = z.object({
  coilVoltage: z.number().min(0).max(24).default(5),
  coilResistance: z.number().min(10).max(5000).default(400),
  pullInCurrent: z.number().min(1).max(500).default(20),
  loadVoltage: z.number().min(0).max(24).default(12),
  loadResistance: z.number().min(1).max(10000).default(100),
});
export type RelayState = z.infer<typeof RelayStateSchema>;

/** Instructor lecture-mode flag: when true, prediction gates are skipped entirely. */
export const PredictFlagSchema = z
  .enum(['on', 'off'])
  .default('on')
  .transform((v) => v === 'on');
