import type { ActuatorTab } from '@/lib/state/schemas';

export const ACTUATOR_LABELS: Readonly<Record<ActuatorTab, string>> = {
  dcmotor: 'DC motor',
  stepper: 'Stepping motor',
  relay: 'Relay',
};
