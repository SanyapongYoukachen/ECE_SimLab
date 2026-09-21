'use client';

import dynamic from 'next/dynamic';
import { ModuleLoadingFallback } from '@/components/ui';

/**
 * Loaded client-only, matching the other three modules: the schematic and
 * readout canvases read `window.devicePixelRatio` and the prediction gate
 * reads `localStorage`, neither of which exist during server rendering.
 */
export default dynamic(() => import('./CircuitsModule').then((m) => m.CircuitsModule), {
  ssr: false,
  loading: () => <ModuleLoadingFallback />,
});
