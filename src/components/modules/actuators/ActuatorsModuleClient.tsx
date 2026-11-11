'use client';

import dynamic from 'next/dynamic';
import { ModuleLoadingFallback } from '@/components/ui';

/**
 * Loaded client-only, matching the other modules: the rotating/stepping
 * schematics read `window.devicePixelRatio` and drive their own
 * requestAnimationFrame loop, and the prediction gate/check read
 * `localStorage` — none of which exist during server rendering.
 */
export default dynamic(() => import('./ActuatorsModule').then((m) => m.ActuatorsModule), {
  ssr: false,
  loading: () => <ModuleLoadingFallback />,
});
