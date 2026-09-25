import type { Metadata } from 'next';
import { ModuleShell } from '@/components/ui';
import AcModule from '@/components/modules/ac/AcModuleClient';

export const metadata: Metadata = {
  title: 'AC circuits — Signals Lab',
  description:
    'Sine waves, RMS and phasors; R, L and C loads with leading and lagging current, power factor and resonance.',
};

export default function AcPage(): React.JSX.Element {
  return (
    <ModuleShell page="ac">
      <AcModule />
    </ModuleShell>
  );
}
