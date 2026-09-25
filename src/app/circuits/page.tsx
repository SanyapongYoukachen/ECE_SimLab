import type { Metadata } from 'next';
import { ModuleShell } from '@/components/ui';
import CircuitsModule from '@/components/modules/circuits/CircuitsModuleClient';

export const metadata: Metadata = {
  title: 'DC Circuits — Signals Lab',
  description: "Ohm's law, series and parallel resistors, and the voltage divider, made visible.",
};

export default function CircuitsPage(): React.JSX.Element {
  return (
    <ModuleShell page="circuits">
      <CircuitsModule />
    </ModuleShell>
  );
}
