'use client';

import { useMemo } from 'react';
import { balancingR4, solveWheatstoneBridge } from '@/lib/circuits/wheatstone';
import { WheatstoneStateSchema } from '@/lib/state/schemas';
import {
  decodeWheatstoneState,
  encodeWheatstoneState,
  decodePredictFlag,
} from '@/lib/state/urlState';
import { useUrlSyncedState, useUrlFlag } from '@/lib/state/useUrlState';
import { logEvent } from '@/lib/state/telemetry';
import { useLocalizedQuestions, useMessages } from '@/lib/i18n';
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
  const common = useMessages().common;
  const t = useMessages().simulator.wheatstone;
  const questions = useLocalizedQuestions(QUESTIONS);
  const practiceQuestion = usePracticeQuestion(questions);
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

  const targetR4 = balancingR4(state.r1, state.r2, state.r3);
  const balanceReachable = targetR4 >= MIN_R && targetR4 <= MAX_R;

  function balanceBridge(): void {
    if (!balanceReachable) return;
    logEvent('simulator-wheatstone', 'balance_clicked', { r4: targetR4 });
    setState((prev) => ({ ...prev, r4: targetR4 }));
  }

  const expression = `R1·R4 = ${formatResistance(result.r1 * result.r4)}  ${
    result.balanced ? '=' : '≠'
  }  R2·R3 = ${formatResistance(result.r2 * result.r3)}`;
  const liveText = useThrottledValue(t.liveText(result.balanced, formatCurrent(result.ig)));

  const content = (
    <div className="flex flex-col gap-4">
      <WheatstoneSchematic result={result} />

      <ExpressionReadout label={t.balanceCondition}>{expression}</ExpressionReadout>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label={t.ig} value={formatCurrent(result.ig)} />
        <Stat label={t.vb} value={formatVoltage(result.vb)} />
        <Stat label={t.vc} value={formatVoltage(result.vc)} />
        <Stat label={t.vbc} value={formatVoltage(result.vb - result.vc)} />
        <Stat label={t.r4Balance} value={formatResistance(targetR4)} />
        <Stat label={t.balancedQ} value={result.balanced ? common.yes : common.no} />
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        <Slider
          label={t.sourceVoltage}
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
          label={t.r4}
          value={state.r4}
          min={MIN_R}
          max={MAX_R}
          step={10}
          formatValue={formatResistance}
          onChange={(v) => setResistor('r4', v)}
        />
        <Slider
          label={t.rg}
          value={state.rg}
          min={MIN_R}
          max={MAX_R}
          step={10}
          formatValue={formatResistance}
          onChange={(v) => setResistor('rg', v)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={balanceBridge}
            disabled={!balanceReachable}
            aria-describedby={balanceReachable ? undefined : 'wheatstone-balance-hint'}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
          >
            {t.balanceButton}
          </button>
          {!balanceReachable && (
            <p id="wheatstone-balance-hint" className="text-xs text-[var(--foreground)]/70">
              {t.balanceHint(
                formatResistance(targetR4),
                formatResistance(MIN_R),
                formatResistance(MAX_R)
              )}
            </p>
          )}
        </div>
      </div>

      {!practiceMode && (
        <PredictionCheck
          moduleId="simulator-wheatstone"
          disabled={!predictEnabled}
          questions={questions}
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
