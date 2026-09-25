'use client';

import { useMemo } from 'react';
import { solveWheatstoneBridge } from '@/lib/circuits/wheatstone';
import { WheatstoneStateSchema } from '@/lib/state/schemas';
import {
  decodeWheatstoneState,
  encodeWheatstoneState,
  decodePredictFlag,
} from '@/lib/state/urlState';
import { useUrlSyncedState, useUrlFlag } from '@/lib/state/useUrlState';
import { logEvent } from '@/lib/state/telemetry';
import {
  PredictionCheck,
  PredictionGate,
  Slider,
  ExpressionReadout,
  LiveRegion,
  usePracticeMode,
  usePracticeQuestion,
  useThrottledValue,
} from '@/components/ui';
import { WheatstoneSchematic } from './WheatstoneSchematic';
import { formatCurrent, formatResistance, formatVoltage } from './format';
import { QUESTIONS } from './questions';

const DEFAULT_STATE = WheatstoneStateSchema.parse({});
const MIN_R = 10;
const MAX_R = 2200;

type ResistorField = 'r1' | 'r2' | 'r3' | 'r4' | 'rg';

export function WheatstoneBridge(): React.JSX.Element {
  const predictEnabled = useUrlFlag(decodePredictFlag, true);
  const practiceMode = usePracticeMode();
  const practiceQuestion = usePracticeQuestion(QUESTIONS);
  const [state, setState] = useUrlSyncedState(
    decodeWheatstoneState,
    encodeWheatstoneState,
    DEFAULT_STATE
  );

  const result = useMemo(
    () => solveWheatstoneBridge(state.voltage, state.r1, state.r2, state.r3, state.r4, state.rg),
    [state.voltage, state.r1, state.r2, state.r3, state.r4, state.rg]
  );

  function setResistor(field: ResistorField, value: number): void {
    setState((prev) => ({ ...prev, [field]: value }));
  }

  function balanceBridge(): void {
    const solvedR4 = Math.min(MAX_R, Math.max(MIN_R, (state.r2 * state.r3) / state.r1));
    logEvent('simulator-wheatstone', 'balance_clicked', { r4: solvedR4 });
    setState((prev) => ({ ...prev, r4: solvedR4 }));
  }

  const expression = `R1·R4 = ${formatResistance(result.r1 * result.r4)}  ${
    result.balanced ? '=' : '≠'
  }  R2·R3 = ${formatResistance(result.r2 * result.r3)}`;
  const liveText = useThrottledValue(
    `Bridge is ${result.balanced ? 'balanced' : 'unbalanced'}. Galvanometer current ${formatCurrent(result.ig)}.`
  );

  const content = (
    <div className="flex flex-col gap-4">
      <WheatstoneSchematic result={result} />

      <ExpressionReadout label="Balance condition: R1·R4 = R2·R3">{expression}</ExpressionReadout>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Galvanometer current" value={formatCurrent(result.ig)} />
        <Stat label="Node B voltage" value={formatVoltage(result.vb)} />
        <Stat label="Node C voltage" value={formatVoltage(result.vc)} />
        <Stat label="Balanced?" value={result.balanced ? 'Yes' : 'No'} />
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        <Slider
          label="Source voltage V"
          value={state.voltage}
          min={0}
          max={24}
          step={0.5}
          formatValue={(v) => `${v.toFixed(1)} V`}
          onChange={(voltage) => setState((prev) => ({ ...prev, voltage }))}
        />
        <Slider
          label="R1"
          value={state.r1}
          min={MIN_R}
          max={MAX_R}
          step={10}
          formatValue={formatResistance}
          onChange={(v) => setResistor('r1', v)}
        />
        <Slider
          label="R2"
          value={state.r2}
          min={MIN_R}
          max={MAX_R}
          step={10}
          formatValue={formatResistance}
          onChange={(v) => setResistor('r2', v)}
        />
        <Slider
          label="R3"
          value={state.r3}
          min={MIN_R}
          max={MAX_R}
          step={10}
          formatValue={formatResistance}
          onChange={(v) => setResistor('r3', v)}
        />
        <Slider
          label="R4 (the unknown, in a real bridge)"
          value={state.r4}
          min={MIN_R}
          max={MAX_R}
          step={10}
          formatValue={formatResistance}
          onChange={(v) => setResistor('r4', v)}
        />
        <Slider
          label="Galvanometer resistance Rg"
          value={state.rg}
          min={MIN_R}
          max={MAX_R}
          step={10}
          formatValue={formatResistance}
          onChange={(v) => setResistor('rg', v)}
        />
        <div>
          <button
            type="button"
            onClick={balanceBridge}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-2)]"
          >
            Balance the bridge (solve R4)
          </button>
        </div>
      </div>

      {!practiceMode && (
        <PredictionCheck
          moduleId="simulator-wheatstone"
          disabled={!predictEnabled}
          questions={QUESTIONS}
        />
      )}

      <LiveRegion text={liveText} />
    </div>
  );

  if (!practiceMode) return content;

  return (
    <PredictionGate
      moduleId="simulator-wheatstone"
      disabled={!predictEnabled}
      question={practiceQuestion.question}
      options={practiceQuestion.options}
      persist={false}
    >
      {content}
    </PredictionGate>
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
