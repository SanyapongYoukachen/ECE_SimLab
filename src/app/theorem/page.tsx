import type { Metadata } from 'next';
import { ModuleShell } from '@/components/ui';
import TheoremModule from '@/components/modules/theorem/TheoremModuleClient';

export const metadata: Metadata = {
  title: 'The convolution theorem — Signals Lab',
  description: 'Two paths to the same answer — and why one of them is the reason the FFT exists.',
};

export default function TheoremPage(): React.JSX.Element {
  return (
    <ModuleShell page="theorem">
      <TheoremModule />
    </ModuleShell>
  );
}
