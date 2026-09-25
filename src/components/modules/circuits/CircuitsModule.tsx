'use client';

import { useMemo } from 'react';
import { solveOhm } from '@/lib/circuits/ohm';
import { solveNetwork } from '@/lib/circuits/network';
import { solveDivider } from '@/lib/circuits/divider';
import { CircuitStateSchema, type CircuitMode, type Topology } from '@/lib/state/schemas';
import { decodeCircuitState, encodeCircuitState, decodePredictFlag } from '@/lib/state/urlState';
import { useUrlSyncedState, useUrlFlag } from '@/lib/state/useUrlState';
import { logEvent } from '@/lib/state/telemetry';
import {
  PredictionCheck,
  PredictionGate,
  Slider,
  SegmentedControl,
  ExpressionReadout,
  LiveRegion,
  usePracticeMode,
  usePracticeQuestion,
  useThrottledValue,
} from '@/components/ui';
import { SchematicPanel } from './SchematicPanel';
import { ReadoutPanel } from './ReadoutPanel';
import { formatCircuitExpression } from './expression';
import { formatCurrent, formatPower, formatResistance, formatVoltage } from './format';
import { QUESTIONS } from './questions';
import {
  MODE_OPTIONS,
  TOPOLOGY_OPTIONS,
  MIN_VOLTAGE,
  MAX_VOLTAGE,
  MIN_RESISTANCE,
  MAX_RESISTANCE,
} from './constants';

const DEFAULT_STATE = CircuitStateSchema.parse({});

export function CircuitsModule(): React.JSX.Element {
  const predictEnabled = useUrlFlag(decodePredictFlag, true);
  const practiceMode = usePracticeMode();
  const practiceQuestion = usePracticeQuestion(QUESTIONS);
  const [state, setState] = useUrlSyncedState(
    decodeCircuitState,
    encodeCircuitState,
    DEFAULT_STATE
  );

  const ohm = useMemo(() => solveOhm(state.voltage, state.r1), [state.voltage, state.r1]);
  const network = useMemo(
    () => solveNetwork(state.voltage, state.r1, state.r2, state.topology),
    [state.voltage, state.r1, state.r2, state.topology]
  );
  const divider = useMemo(
    () => solveDivider(state.voltage, state.r1, state.r2),
    [state.voltage, state.r1, state.r2]
  );

  function setMode(mode: CircuitMode): void {
    logEvent('circuits', 'mode_changed', { mode });
    setState((prev) => ({ ...prev, mode }));
  }

  function setTopology(topology: Topology): void {
    logEvent('circuits', 'topology_changed', { topology });
    setState((prev) => ({ ...prev, topology }));
  }

  const expression = formatCircuitExpression(state.mode, state.topology, ohm, network, divider);
  const liveText = useThrottledValue(expression);

  const content = (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <SchematicPanel
          mode={state.mode}
          topology={state.topology}
          voltage={state.voltage}
          r1={state.r1}
          r2={state.r2}
        />
        <ReadoutPanel mode={state.mode} ohm={ohm} network={network} divider={divider} />
      </div>

      <ExpressionReadout label="Governing equation">{expression}</ExpressionReadout>

      <StatGrid mode={state.mode} ohm={ohm} network={network} divider={divider} />

      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        <Slider
          label="Source voltage V"
          value={state.voltage}
          min={MIN_VOLTAGE}
          max={MAX_VOLTAGE}
          step={0.5}
          formatValue={(v) => `${v.toFixed(1)} V`}
          onChange={(voltage) => setState((prev) => ({ ...prev, voltage }))}
        />
        <Slider
          label={state.mode === 'ohm' ? 'Resistance R' : 'Resistance R1'}
          value={state.r1}
          min={MIN_RESISTANCE}
          max={MAX_RESISTANCE}
          step={10}
          formatValue={(v) => formatResistance(v)}
          onChange={(r1) => setState((prev) => ({ ...prev, r1 }))}
        />
        {state.mode !== 'ohm' && (
          <Slider
            label="Resistance R2"
            value={state.r2}
            min={MIN_RESISTANCE}
            max={MAX_RESISTANCE}
            step={10}
            formatValue={(v) => formatResistance(v)}
            onChange={(r2) => setState((prev) => ({ ...prev, r2 }))}
          />
        )}
      </div>

      <SegmentedControl
        label="Circuit"
        value={state.mode}
        onChange={setMode}
        options={MODE_OPTIONS}
      />

      {state.mode === 'network' && (
        <SegmentedControl
          label="Topology"
          value={state.topology}
          onChange={setTopology}
          options={TOPOLOGY_OPTIONS}
        />
      )}

      {!practiceMode && (
        <PredictionCheck moduleId="circuits" disabled={!predictEnabled} questions={QUESTIONS} />
      )}

      <LiveRegion text={liveText} />
    </div>
  );

  if (!practiceMode) return content;

  return (
    <PredictionGate
      moduleId="circuits"
      disabled={!predictEnabled}
      question={practiceQuestion.question}
      options={practiceQuestion.options}
      persist={false}
    >
      {content}
    </PredictionGate>
  );
}

function StatGrid({
  mode,
  ohm,
  network,
  divider,
}: {
  readonly mode: CircuitMode;
  readonly ohm: ReturnType<typeof solveOhm>;
  readonly network: ReturnType<typeof solveNetwork>;
  readonly divider: ReturnType<typeof solveDivider>;
}): React.JSX.Element {
  if (mode === 'ohm') {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Current I" value={formatCurrent(ohm.current)} />
        <Stat label="Power P = VI" value={formatPower(ohm.power)} />
        <Stat label="Voltage V" value={formatVoltage(ohm.voltage)} />
        <Stat label="Resistance R" value={formatResistance(ohm.resistance)} />
      </div>
    );
  }

  if (mode === 'network') {
    const third =
      network.topology === 'series'
        ? { label: 'Voltage across R1', value: formatVoltage(network.v1) }
        : { label: 'Current through R1', value: formatCurrent(network.i1) };
    const fourth =
      network.topology === 'series'
        ? { label: 'Voltage across R2', value: formatVoltage(network.v2) }
        : { label: 'Current through R2', value: formatCurrent(network.i2) };
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Equivalent resistance" value={formatResistance(network.equivalent)} />
        <Stat label="Total current" value={formatCurrent(network.totalCurrent)} />
        <Stat label={third.label} value={third.value} />
        <Stat label={fourth.label} value={fourth.value} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Vout (across R2)" value={formatVoltage(divider.vOut)} />
      <Stat label="Current" value={formatCurrent(divider.current)} />
      <Stat label="Voltage across R1" value={formatVoltage(divider.vR1)} />
      <Stat label="Divider ratio R2/(R1+R2)" value={`${(divider.ratio * 100).toFixed(1)}%`} />
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}): React.JSX.Element {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
      <div className="text-xs text-[var(--foreground)]/60">{label}</div>
      <div className="font-mono tabular-nums text-sm text-[var(--foreground)]">{value}</div>
    </div>
  );
}
