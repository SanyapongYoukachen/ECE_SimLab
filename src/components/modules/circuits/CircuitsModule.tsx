'use client';

import { useMemo } from 'react';
import { solveOhm } from '@/lib/circuits/ohm';
import { solveNetwork } from '@/lib/circuits/network';
import { solveDivider } from '@/lib/circuits/divider';
import { CircuitStateSchema, type CircuitMode, type Topology } from '@/lib/state/schemas';
import { decodeCircuitState, encodeCircuitState, decodePredictFlag } from '@/lib/state/urlState';
import { useUrlSyncedState, useUrlFlag } from '@/lib/state/useUrlState';
import { logEvent } from '@/lib/state/telemetry';
import { useLocalizedQuestions, useMessages, type Messages } from '@/lib/i18n';
import {
  ModuleTabs,
  PredictionGate,
  Slider,
  SegmentedControl,
  ExpressionReadout,
  Field,
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
import { Stat } from './Stat';
import { TheveninSection } from './TheveninSection';
import { MeshNodeSection } from './MeshNodeSection';
import {
  MODE_ORDER,
  TOPOLOGY_ORDER,
  MIN_VOLTAGE,
  MAX_VOLTAGE,
  MIN_RESISTANCE,
  MAX_RESISTANCE,
} from './constants';

const DEFAULT_STATE = CircuitStateSchema.parse({});

export function CircuitsModule(): React.JSX.Element {
  const predictEnabled = useUrlFlag(decodePredictFlag, true);
  const practiceMode = usePracticeMode();
  const t = useMessages().circuits;
  const questions = useLocalizedQuestions(QUESTIONS);
  const practiceQuestion = usePracticeQuestion(questions);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
        <Field label={t.circuit}>
          <SegmentedControl
            label={t.circuit}
            value={state.mode}
            onChange={setMode}
            options={MODE_ORDER.map((value) => ({ value, label: t.modes[value] }))}
          />
        </Field>
        {state.mode === 'network' && (
          <Field label={t.topology}>
            <SegmentedControl
              label={t.topology}
              value={state.topology}
              onChange={setTopology}
              options={TOPOLOGY_ORDER.map((value) => ({ value, label: t.topologies[value] }))}
            />
          </Field>
        )}
      </div>

      {state.mode === 'thevenin' ? (
        <TheveninSection state={state} setState={setState} />
      ) : state.mode === 'mesh' ? (
        <MeshNodeSection state={state} setState={setState} />
      ) : (
        <>
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

          <ExpressionReadout label={t.governingEquation}>{expression}</ExpressionReadout>

          <StatGrid mode={state.mode} ohm={ohm} network={network} divider={divider} t={t} />

          <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
            <Slider
              label={t.sourceVoltage}
              value={state.voltage}
              min={MIN_VOLTAGE}
              max={MAX_VOLTAGE}
              step={0.5}
              formatValue={(v) => `${v.toFixed(1)} V`}
              onChange={(voltage) => setState((prev) => ({ ...prev, voltage }))}
            />
            <Slider
              label={state.mode === 'ohm' ? t.resistanceR : t.resistanceR1}
              value={state.r1}
              min={MIN_RESISTANCE}
              max={MAX_RESISTANCE}
              step={10}
              formatValue={(v) => formatResistance(v)}
              onChange={(r1) => setState((prev) => ({ ...prev, r1 }))}
            />
            {state.mode !== 'ohm' && (
              <Slider
                label={t.resistanceR2}
                value={state.r2}
                min={MIN_RESISTANCE}
                max={MAX_RESISTANCE}
                step={10}
                formatValue={(v) => formatResistance(v)}
                onChange={(r2) => setState((prev) => ({ ...prev, r2 }))}
              />
            )}
          </div>
        </>
      )}

      <LiveRegion text={liveText} />
    </div>
  );

  if (!practiceMode) {
    return (
      <ModuleTabs moduleId="circuits" questions={questions} disabled={!predictEnabled}>
        {content}
      </ModuleTabs>
    );
  }

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
  t,
}: {
  readonly mode: CircuitMode;
  readonly ohm: ReturnType<typeof solveOhm>;
  readonly network: ReturnType<typeof solveNetwork>;
  readonly divider: ReturnType<typeof solveDivider>;
  readonly t: Messages['circuits'];
}): React.JSX.Element {
  if (mode === 'ohm') {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t.currentI} value={formatCurrent(ohm.current)} />
        <Stat label={t.powerP} value={formatPower(ohm.power)} />
        <Stat label={t.voltageV} value={formatVoltage(ohm.voltage)} />
        <Stat label={t.resistanceR} value={formatResistance(ohm.resistance)} />
      </div>
    );
  }

  if (mode === 'network') {
    const third =
      network.topology === 'series'
        ? { label: t.vAcrossR1, value: formatVoltage(network.v1) }
        : { label: t.iThroughR1, value: formatCurrent(network.i1) };
    const fourth =
      network.topology === 'series'
        ? { label: t.vAcrossR2, value: formatVoltage(network.v2) }
        : { label: t.iThroughR2, value: formatCurrent(network.i2) };
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t.equivalent} value={formatResistance(network.equivalent)} />
        <Stat label={t.totalCurrent} value={formatCurrent(network.totalCurrent)} />
        <Stat label={third.label} value={third.value} />
        <Stat label={fourth.label} value={fourth.value} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label={t.vout} value={formatVoltage(divider.vOut)} />
      <Stat label={t.current} value={formatCurrent(divider.current)} />
      <Stat label={t.vAcrossR1} value={formatVoltage(divider.vR1)} />
      <Stat label={t.dividerRatio} value={`${(divider.ratio * 100).toFixed(1)}%`} />
    </div>
  );
}
