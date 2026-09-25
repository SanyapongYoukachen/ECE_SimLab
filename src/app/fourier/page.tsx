import type { Metadata } from 'next';
import { ModuleShell } from '@/components/ui';
import FourierModule from '@/components/modules/fourier/FourierModuleClient';

export const metadata: Metadata = {
  title: 'Fourier transform explorer — Signals Lab',
  description: 'See — and hear — how a signal built from sinusoids maps to its magnitude spectrum.',
};

export default function FourierPage(): React.JSX.Element {
  return (
    <ModuleShell page="fourier">
      <FourierModule />
    </ModuleShell>
  );
}
