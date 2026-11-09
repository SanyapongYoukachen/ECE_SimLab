import type { KernelId } from '@/lib/state/schemas';

/** Display labels and notes live in the i18n dictionary under `convolution.kernels`. */
export interface KernelPreset {
  readonly id: KernelId;
  readonly values: readonly number[];
  readonly smoothing: boolean;
}

export const KERNEL_PRESETS: Record<KernelId, KernelPreset> = {
  rect: {
    id: 'rect',
    values: [1 / 3, 1 / 3, 1 / 3],
    smoothing: true,
  },
  tri: {
    id: 'tri',
    values: [0.25, 0.5, 0.25],
    smoothing: true,
  },
  expo: {
    id: 'expo',
    values: [1, 0.6, 0.36, 0.216],
    smoothing: true,
  },
  diff: {
    id: 'diff',
    values: [1, -1],
    smoothing: false,
  },
};

export const KERNEL_ORDER: readonly KernelId[] = ['rect', 'tri', 'expo', 'diff'];
