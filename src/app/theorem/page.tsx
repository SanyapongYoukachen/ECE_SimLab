import type { Metadata } from 'next';
import { ModuleShell } from '@/components/ui';
import TheoremModule from '@/components/modules/theorem/TheoremModuleClient';

export const metadata: Metadata = {
  title: 'The convolution theorem — Signals Lab',
  description: 'Two paths to the same answer — and why one of them is the reason the FFT exists.',
};

export default function TheoremPage(): React.JSX.Element {
  return (
    <ModuleShell
      title="The convolution theorem: two paths, one answer"
      tagline="Drag the length slider up and watch the direct method's cost curve pull away from the FFT's."
    >
      <TheoremModule />
    </ModuleShell>
  );
}
