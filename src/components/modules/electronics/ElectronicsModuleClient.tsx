'use client';

import dynamic from 'next/dynamic';
import { ModuleLoadingFallback } from '@/components/ui';

/**
 * Client-only, like every module: the canvases read devicePixelRatio and
 * animate from performance.now(), and the quiz reads localStorage.
 */
export default dynamic(() => import('./ElectronicsModule').then((m) => m.ElectronicsModule), {
  ssr: false,
  loading: () => <ModuleLoadingFallback />,
});
