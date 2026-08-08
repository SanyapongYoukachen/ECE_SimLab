'use client';

import dynamic from 'next/dynamic';
import { ModuleLoadingFallback } from '@/components/ui';

/**
 * Loaded client-only: this module's floating-point DSP output (Math.exp /
 * Math.sin, etc.) is not guaranteed bit-identical between Node's V8 and the
 * browser's, and this module displays that output at full precision — so
 * server-rendering it risks a hydration mismatch for no benefit (there's no
 * static content here worth prerendering).
 */
export default dynamic(() => import('./ConvolutionModule').then((m) => m.ConvolutionModule), {
  ssr: false,
  loading: () => <ModuleLoadingFallback />,
});
