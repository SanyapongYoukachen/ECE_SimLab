'use client';

import dynamic from 'next/dynamic';
import { ModuleLoadingFallback } from '@/components/ui';

/**
 * Client-only: this module displays floating-point convolution results at
 * full precision (max |direct - fft| error), which can differ in the last
 * bit between server (Node V8) and browser V8 transcendental math — a
 * guaranteed-eventually hydration mismatch if server-rendered.
 */
export default dynamic(() => import('./TheoremModule').then((m) => m.TheoremModule), {
  ssr: false,
  loading: () => <ModuleLoadingFallback />,
});
