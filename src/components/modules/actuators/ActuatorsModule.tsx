'use client';

import { ActuatorsStateSchema, type ActuatorTab } from '@/lib/state/schemas';
import { decodeActuatorsState, encodeActuatorsState } from '@/lib/state/urlState';
import { useUrlSyncedState } from '@/lib/state/useUrlState';
import { logEvent } from '@/lib/state/telemetry';
import { SegmentedControl } from '@/components/ui';
import { DcMotor } from './dc-motor/DcMotor';
import { Stepper } from './stepper/Stepper';
import { Relay } from './relay/Relay';
import { ACTUATOR_TAB_OPTIONS } from './constants';

const DEFAULT_STATE = ActuatorsStateSchema.parse({});

/**
 * Same shape as the circuit simulator's tab switcher: which tab is active
 * lives in its own tiny URL-synced store, independent of each tab's own
 * state, so switching tabs never touches another tab's sliders.
 */
export function ActuatorsModule(): React.JSX.Element {
  const [state, setState] = useUrlSyncedState(
    decodeActuatorsState,
    encodeActuatorsState,
    DEFAULT_STATE
  );

  function setTab(tab: ActuatorTab): void {
    logEvent('actuators', 'tab_changed', { tab });
    setState((prev) => ({ ...prev, tab }));
  }

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        label="Actuator"
        value={state.tab}
        onChange={setTab}
        options={ACTUATOR_TAB_OPTIONS}
      />
      {state.tab === 'dcmotor' && <DcMotor />}
      {state.tab === 'stepper' && <Stepper />}
      {state.tab === 'relay' && <Relay />}
    </div>
  );
}
