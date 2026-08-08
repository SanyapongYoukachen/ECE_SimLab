'use client';

import dynamic from 'next/dynamic';
import { ModuleLoadingFallback } from '@/components/ui';

export default dynamic(() => import('./FourierModule').then((m) => m.FourierModule), {
  ssr: false,
  loading: () => <ModuleLoadingFallback />,
});
