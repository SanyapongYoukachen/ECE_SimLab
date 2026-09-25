import type { Metadata } from 'next';
import { ModuleShell } from '@/components/ui';
import SimulatorModule from '@/components/modules/simulator/SimulatorModuleClient';

export const metadata: Metadata = {
  title: 'Circuit Simulator — Signals Lab',
  description: 'Animated circuit simulations, starting with the Wheatstone bridge.',
};

export default function SimulatorPage(): React.JSX.Element {
  return (
    <ModuleShell page="simulator">
      <SimulatorModule />
    </ModuleShell>
  );
}
