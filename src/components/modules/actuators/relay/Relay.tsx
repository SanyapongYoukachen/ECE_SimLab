'use client';

import { useMemo } from 'react';
import { solveRelay } from '@/lib/actuators/relay';
import { RelayStateSchema } from '@/lib/state/schemas';
import { decodeRelayState, encodeRelayState, decodePredictFlag } from '@/lib/state/urlState';
import { useUrlSyncedState, useUrlFlag } from '@/lib/state/useUrlState';
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
import { RelaySchematic } from './RelaySchematic';
import { RelayStructure } from './RelayStructure';
import { formatCurrentA, formatCurrentMa, formatResistance, formatVoltage } from './format';
import { QUESTIONS } from './questions';

const DEFAULT_STATE = RelayStateSchema.parse({});

type Field = 'coilVoltage' | 'coilResistance' | 'pullInCurrent' | 'loadVoltage' | 'loadResistance';

export function Relay(): React.JSX.Element {
  const predictEnabled = useUrlFlag(decodePredictFlag, true);
  const practiceMode = usePracticeMode();
  const practiceQuestion = usePracticeQuestion(QUESTIONS);
  const [state, setState] = useUrlSyncedState(decodeRelayState, encodeRelayState, DEFAULT_STATE);

  const result = useMemo(
    () =>
      solveRelay(
        state.coilVoltage,
        state.coilResistance,
        state.pullInCurrent,
        state.loadVoltage,
        state.loadResistance
      ),
    [
      state.coilVoltage,
      state.coilResistance,
      state.pullInCurrent,
      state.loadVoltage,
      state.loadResistance,
    ]
  );

  function setField(field: Field, value: number): void {
    setState((prev) => ({ ...prev, [field]: value }));
  }

  const expression = `Icoil = Vcoil / Rcoil = ${formatVoltage(result.coilVoltage)} / ${formatResistance(result.coilResistance)} = ${formatCurrentMa(result.coilCurrentMa)}`;
  const liveText = useThrottledValue(
    `Relay is ${result.energized ? 'energized, resting on NO' : 'de-energized, resting on NC'}. Coil current ${formatCurrentMa(result.coilCurrentMa)}, pull-in threshold ${formatCurrentMa(state.pullInCurrent)}.`
  );

  const content = (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <figure className="flex flex-col gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
          <figcaption className="text-sm font-medium text-[var(--foreground)]">
            Circuit symbol
          </figcaption>
          <RelaySchematic result={result} />
        </figure>
        <figure className="flex flex-col gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
          <figcaption className="text-sm font-medium text-[var(--foreground)]">
            Inside the relay
          </figcaption>
          <RelayStructure result={result} />
        </figure>
      </div>
      <p className="text-sm text-[var(--foreground)]/70">
        Both pictures show the same part. On a circuit diagram the rectangle K1 is the coil, and the
        dashed line joins it to the contact it moves. Inside, that line is a real mechanism: coil
        current magnetizes the iron core, the core pulls the hinged armature down against its
        spring, and the armature carries the moving contact (COM) from NC over to NO. Cut the coil
        current and the spring puts it back.
      </p>

      <ExpressionReadout label="Coil current vs. pull-in threshold">
        {expression} — pull-in at {formatCurrentMa(state.pullInCurrent)}
      </ExpressionReadout>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Coil current" value={formatCurrentMa(result.coilCurrentMa)} />
        <Stat label="State" value={result.energized ? 'Energized' : 'De-energized'} />
        <Stat label="Active contact" value={result.activeContact} />
        <Stat label="Load current" value={formatCurrentA(result.loadCurrent)} />
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        <Slider
          label="Coil voltage"
          value={state.coilVoltage}
          min={0}
          max={24}
          step={0.2}
          formatValue={(v) => `${v.toFixed(1)} V`}
          onChange={(v) => setField('coilVoltage', v)}
        />
        <Slider
          label="Coil resistance"
          value={state.coilResistance}
          min={10}
          max={5000}
          step={10}
          formatValue={formatResistance}
          onChange={(v) => setField('coilResistance', v)}
        />
        <Slider
          label="Pull-in current threshold"
          value={state.pullInCurrent}
          min={1}
          max={500}
          step={1}
          formatValue={(v) => formatCurrentMa(v)}
          onChange={(v) => setField('pullInCurrent', v)}
        />
        <Slider
          label="Load voltage"
          value={state.loadVoltage}
          min={0}
          max={24}
          step={0.5}
          formatValue={(v) => `${v.toFixed(1)} V`}
          onChange={(v) => setField('loadVoltage', v)}
        />
        <Slider
          label="Load resistance"
          value={state.loadResistance}
          min={1}
          max={10000}
          step={10}
          formatValue={formatResistance}
          onChange={(v) => setField('loadResistance', v)}
        />
      </div>

      {!practiceMode && (
        <PredictionCheck
          moduleId="actuators-relay"
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
      moduleId="actuators-relay"
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
