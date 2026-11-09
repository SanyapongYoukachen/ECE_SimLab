import type { Metadata } from 'next';
import { ModuleShell } from '@/components/ui';
import ActuatorsModule from '@/components/modules/actuators/ActuatorsModuleClient';

export const metadata: Metadata = {
  title: 'Actuators — Signals Lab',
  description: 'DC motors, stepping motors, and relays, made visible — one actuator per tab.',
};

export default function ActuatorsPage(): React.JSX.Element {
  return (
    <ModuleShell
      title="Actuators"
      tagline="Electrical signals becoming motion and switching. Pick an actuator from the tabs."
    >
      <ActuatorsModule />
    </ModuleShell>
  );
}
