'use client';

import { StepperStateSchema, type StepperDirection, type StepperMode } from '@/lib/state/schemas';
import { decodeStepperState, encodeStepperState, decodePredictFlag } from '@/lib/state/urlState';
import { useUrlSyncedState, useUrlFlag } from '@/lib/state/useUrlState';
import { effectiveStepsPerRev } from '@/lib/actuators/stepper';
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
import { StepperSchematic } from './StepperSchematic';
import { formatRpm, formatStepAngle } from './format';
import { QUESTIONS } from './questions';

const DEFAULT_STATE = StepperStateSchema.parse({});

const DIRECTION_OPTIONS: readonly { value: StepperDirection; label: string }[] = [
  { value: 'cw', label: 'Clockwise' },
  { value: 'ccw', label: 'Counter-clockwise' },
];

const MODE_OPTIONS: readonly { value: StepperMode; label: string }[] = [
  { value: 'full', label: 'Full step' },
  { value: 'half', label: 'Half step' },
];

export function Stepper(): React.JSX.Element {
  const predictEnabled = useUrlFlag(decodePredictFlag, true);
  const practiceMode = usePracticeMode();
  const practiceQuestion = usePracticeQuestion(QUESTIONS);
  const [state, setState] = useUrlSyncedState(
    decodeStepperState,
    encodeStepperState,
    DEFAULT_STATE
  );

  const effSteps = effectiveStepsPerRev(state.stepsPerRev, state.mode);
  const stepAngle = 360 / effSteps;
  const rpm = (state.stepRate * 60) / effSteps;

  const expression = `${state.mode === 'half' ? 'Half' : 'Full'} step: 360° / ${effSteps} steps = ${formatStepAngle(stepAngle)}`;
  const liveText = useThrottledValue(
    `${state.stepRate.toFixed(1)} steps/sec, ${state.direction === 'cw' ? 'clockwise' : 'counter-clockwise'}, ${formatRpm(rpm)}.`
  );

  const content = (
    <div className="flex flex-col gap-4">
      <StepperSchematic
        stepRate={state.stepRate}
        direction={state.direction}
        stepsPerRev={state.stepsPerRev}
        mode={state.mode}
      />

      <ExpressionReadout label="Angular resolution">{expression}</ExpressionReadout>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Step angle" value={formatStepAngle(stepAngle)} />
        <Stat label="Steps / revolution" value={String(effSteps)} />
        <Stat label="Speed" value={formatRpm(rpm)} />
        <Stat
          label="Direction"
          value={state.direction === 'cw' ? 'Clockwise' : 'Counter-clockwise'}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        <Slider
          label="Step rate"
          value={state.stepRate}
          min={0}
          max={20}
          step={0.5}
          formatValue={(v) => `${v.toFixed(1)} steps/sec`}
          onChange={(stepRate) => setState((prev) => ({ ...prev, stepRate }))}
        />
        <Slider
          label="Full steps per revolution"
          value={state.stepsPerRev}
          min={4}
          max={200}
          step={4}
          formatValue={(v) => `${v.toFixed(0)}`}
          onChange={(stepsPerRev) => setState((prev) => ({ ...prev, stepsPerRev }))}
        />
      </div>

      <SegmentedControl
        label="Direction"
        value={state.direction}
        onChange={(direction) => setState((prev) => ({ ...prev, direction }))}
        options={DIRECTION_OPTIONS}
      />
      <SegmentedControl
        label="Step mode"
        value={state.mode}
        onChange={(mode) => setState((prev) => ({ ...prev, mode }))}
        options={MODE_OPTIONS}
      />

      {!practiceMode && (
        <PredictionCheck
          moduleId="actuators-stepper"
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
      moduleId="actuators-stepper"
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
