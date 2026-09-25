'use client';

import { SimulatorStateSchema, type SimulatorTab } from '@/lib/state/schemas';
import { decodeSimulatorState, encodeSimulatorState } from '@/lib/state/urlState';
import { useUrlSyncedState } from '@/lib/state/useUrlState';
import { logEvent } from '@/lib/state/telemetry';
import { SegmentedControl } from '@/components/ui';
import { WheatstoneBridge } from './wheatstone/WheatstoneBridge';
import { SIMULATOR_TAB_ORDER } from './constants';
import { useMessages } from '@/lib/i18n';

const DEFAULT_STATE = SimulatorStateSchema.parse({});

/**
 * The simulator's own state (which tab is active) is a separate URL-synced
 * store from each tab's circuit state, the same way the instructor's
 * `?predict=off` flag coexists with a module's own state — independent
 * writes merge into one query string rather than clobbering each other.
 */
export function SimulatorModule(): React.JSX.Element {
  const t = useMessages().simulator;
  const [state, setState] = useUrlSyncedState(
    decodeSimulatorState,
    encodeSimulatorState,
    DEFAULT_STATE
  );

  function setTab(tab: SimulatorTab): void {
    logEvent('simulator', 'tab_changed', { tab });
    setState((prev) => ({ ...prev, tab }));
  }

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        label={t.circuit}
        value={state.tab}
        onChange={setTab}
        options={SIMULATOR_TAB_ORDER.map((value) => ({ value, label: t.tabs[value] }))}
      />
      {state.tab === 'wheatstone' && <WheatstoneBridge />}
    </div>
  );
}
