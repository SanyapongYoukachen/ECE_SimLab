import type { ActuatorTab } from '@/lib/state/schemas';

/** DC motor, stepper, and relay now — more actuators can land here over time. */
export const ACTUATOR_TAB_OPTIONS: readonly { value: ActuatorTab; label: string }[] = [
  { value: 'dcmotor', label: 'DC motor' },
  { value: 'stepper', label: 'Stepping motor' },
  { value: 'relay', label: 'Relay' },
];
