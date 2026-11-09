'use client';

import { useMemo } from 'react';
import { solveDcMotor } from '@/lib/actuators/dcMotor';
import { DcMotorStateSchema } from '@/lib/state/schemas';
import { decodeDcMotorState, encodeDcMotorState, decodePredictFlag } from '@/lib/state/urlState';
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
import { DcMotorSchematic } from './DcMotorSchematic';
import { formatCurrent, formatPower, formatSpeed, formatTorque, formatVoltage } from './format';
import { QUESTIONS } from './questions';

const DEFAULT_STATE = DcMotorStateSchema.parse({});

type Field = 'voltage' | 'armatureResistance' | 'motorConstant' | 'loadTorque' | 'friction';

export function DcMotor(): React.JSX.Element {
  const predictEnabled = useUrlFlag(decodePredictFlag, true);
  const practiceMode = usePracticeMode();
  const practiceQuestion = usePracticeQuestion(QUESTIONS);
  const [state, setState] = useUrlSyncedState(
    decodeDcMotorState,
    encodeDcMotorState,
    DEFAULT_STATE
  );

  const result = useMemo(
    () =>
      solveDcMotor(
        state.voltage,
        state.armatureResistance,
        state.motorConstant,
        state.loadTorque,
        state.friction
      ),
    [state.voltage, state.armatureResistance, state.motorConstant, state.loadTorque, state.friction]
  );

  function setField(field: Field, value: number): void {
    setState((prev) => ({ ...prev, [field]: value }));
  }

  const expression = `ω = (V − Ra·Tl/K) / (Ra·B/K + K) = ${formatSpeed(result.speedRpm)}`;
  const liveText = useThrottledValue(
    `Speed ${formatSpeed(result.speedRpm)}, current ${formatCurrent(result.current)}, torque ${formatTorque(result.torque)}.`
  );

  const content = (
    <div className="flex flex-col gap-4">
      <DcMotorSchematic result={result} />

      <ExpressionReadout label="Steady-state speed">{expression}</ExpressionReadout>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Speed" value={formatSpeed(result.speedRpm)} />
        <Stat label="Armature current" value={formatCurrent(result.current)} />
        <Stat label="Torque" value={formatTorque(result.torque)} />
        <Stat label="Back-EMF" value={formatVoltage(result.backEmf)} />
        <Stat label="Input power" value={formatPower(result.inputPower)} />
        <Stat label="Mechanical power" value={formatPower(result.mechPower)} />
        <Stat label="Resistive loss" value={formatPower(result.lossPower)} />
        <Stat
          label="Efficiency"
          value={`${result.inputPower > 0 ? ((result.mechPower / result.inputPower) * 100).toFixed(0) : '0'}%`}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        <Slider
          label="Supply voltage V"
          value={state.voltage}
          min={0}
          max={48}
          step={0.5}
          formatValue={(v) => `${v.toFixed(1)} V`}
          onChange={(v) => setField('voltage', v)}
        />
        <Slider
          label="Armature resistance Ra"
          value={state.armatureResistance}
          min={0.1}
          max={50}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)} Ω`}
          onChange={(v) => setField('armatureResistance', v)}
        />
        <Slider
          label="Motor constant K (= Kt = Ke)"
          value={state.motorConstant}
          min={0.005}
          max={0.5}
          step={0.005}
          formatValue={(v) => v.toFixed(3)}
          onChange={(v) => setField('motorConstant', v)}
        />
        <Slider
          label="Load torque Tl"
          value={state.loadTorque}
          min={0}
          max={2}
          step={0.01}
          formatValue={(v) => `${v.toFixed(3)} N·m`}
          onChange={(v) => setField('loadTorque', v)}
        />
        <Slider
          label="Friction B"
          value={state.friction}
          min={0}
          max={0.02}
          step={0.0005}
          formatValue={(v) => v.toFixed(4)}
          onChange={(v) => setField('friction', v)}
        />
      </div>

      {!practiceMode && (
        <PredictionCheck
          moduleId="actuators-dcmotor"
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
      moduleId="actuators-dcmotor"
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
