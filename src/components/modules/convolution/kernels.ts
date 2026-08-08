import type { KernelId } from '@/lib/state/schemas';

export interface KernelPreset {
  readonly id: KernelId;
  readonly label: string;
  readonly values: readonly number[];
  readonly smoothing: boolean;
  readonly note: string;
}

export const KERNEL_PRESETS: Record<KernelId, KernelPreset> = {
  rect: {
    id: 'rect',
    label: 'Rectangular',
    values: [1 / 3, 1 / 3, 1 / 3],
    smoothing: true,
    note: 'An unweighted moving average — every sample in the window counts equally.',
  },
  tri: {
    id: 'tri',
    label: 'Triangular',
    values: [0.25, 0.5, 0.25],
    smoothing: true,
    note: 'A weighted average that favours the centre sample — smoother than the rectangular kernel.',
  },
  expo: {
    id: 'expo',
    label: 'Exponential decay',
    values: [1, 0.6, 0.36, 0.216],
    smoothing: true,
    note: 'Weights recent samples most heavily — the impulse response of a simple RC-style filter.',
  },
  diff: {
    id: 'diff',
    label: 'Difference [1, −1]',
    values: [1, -1],
    smoothing: false,
    note: 'Not a smoother: it responds to change, not level. Constant regions of x collapse to zero.',
  },
};

export const KERNEL_ORDER: readonly KernelId[] = ['rect', 'tri', 'expo', 'diff'];
