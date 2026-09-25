import type { Metadata } from 'next';
import { ModuleShell } from '@/components/ui';
import SimulatorModule from '@/components/modules/simulator/SimulatorModuleClient';

export const metadata: Metadata = {
  title: 'Circuit Simulator — Signals Lab',
  description: 'Animated circuit simulations, starting with the Wheatstone bridge.',
};

export default function SimulatorPage(): React.JSX.Element {
  return (
    <ModuleShell
      title="Circuit simulator"
      tagline="Watch current actually flow through the circuit. Pick a circuit from the tabs; more are coming."
    >
      <SimulatorModule />
    </ModuleShell>
  );
}
