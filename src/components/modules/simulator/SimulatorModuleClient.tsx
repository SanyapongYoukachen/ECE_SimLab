'use client';

import dynamic from 'next/dynamic';
import { ModuleLoadingFallback } from '@/components/ui';

/**
 * Loaded client-only, matching the other modules: the animated schematic
 * reads `window.devicePixelRatio` and drives its own requestAnimationFrame
 * loop, and the prediction gate/check read `localStorage` — none of which
 * exist during server rendering.
 */
export default dynamic(() => import('./SimulatorModule').then((m) => m.SimulatorModule), {
  ssr: false,
  loading: () => <ModuleLoadingFallback />,
});
