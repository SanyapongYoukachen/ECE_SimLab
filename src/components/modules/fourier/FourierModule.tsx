'use client';

import { useMemo, useState } from 'react';
import { magnitudeSpectrum } from '@/lib/dsp';
import { FourierPresetSchema, WindowTypeSchema } from '@/lib/state/schemas';
import { decodeFourierState, encodeFourierState, decodePredictFlag } from '@/lib/state/urlState';
import { useUrlSyncedState, useUrlFlag } from '@/lib/state/useUrlState';
import { logEvent } from '@/lib/state/telemetry';
import { useLocalizedQuestions, useMessages } from '@/lib/i18n';
import {
  PredictionCheck,
  PredictionGate,
  Slider,
  SegmentedControl,
  ExpressionReadout,
  LiveRegion,
  PlayPauseButton,
  usePracticeMode,
  usePracticeQuestion,
  useThrottledValue,
} from '@/components/ui';
import { TimeDomainPanel } from './TimeDomainPanel';
import { SpectrumPanel } from './SpectrumPanel';
import { useAdditiveSynth } from './useAdditiveSynth';
import { QUESTIONS } from './questions';
import {
  SAMPLE_RATE,
  BIN_SPACING,
  NYQUIST,
  FREQ1,
  FREQ2,
  FREQ3_MIN,
  FREQ3_MAX,
  buildSignal,
  isOnBin,
  nearestBinFreq,
} from './constants';

const DEFAULT_STATE = FourierPresetSchema.parse({});
const DISPLAY_MAX_FREQ = FREQ2 + 400;

export function FourierModule(): React.JSX.Element {
  const predictEnabled = useUrlFlag(decodePredictFlag, true);
  const practiceMode = usePracticeMode();
  const t = useMessages();
  const tf = t.fourier;
  const questions = useLocalizedQuestions(QUESTIONS);
  const practiceQuestion = usePracticeQuestion(questions);
  const windowOptions = WindowTypeSchema.options.map((id) => ({
    value: id,
    label: tf.windows[id],
  }));
  const [state, setState] = useUrlSyncedState(
    decodeFourierState,
    encodeFourierState,
    DEFAULT_STATE
  );
  const [audioPlaying, setAudioPlaying] = useState(false);

  const signal = useMemo(
    () =>
      buildSignal({
        amp1: state.amp1,
        amp2: state.amp2,
        amp3: state.amp3,
        freq3: state.freq3,
      }),
    [state.amp1, state.amp2, state.amp3, state.freq3]
  );
  const spectrum = useMemo(
    () => magnitudeSpectrum(signal, SAMPLE_RATE, state.window),
    [signal, state.window]
  );
  const referenceSpectrum = useMemo(() => magnitudeSpectrum(signal, SAMPLE_RATE, 'rect'), [signal]);

  const onBin = isOnBin(state.freq3);

  useAdditiveSynth(
    [
      { amp: state.amp1, freq: FREQ1 },
      { amp: state.amp2, freq: FREQ2 },
      { amp: state.amp3, freq: state.freq3 },
    ],
    audioPlaying
  );

  function set<K extends keyof typeof state>(key: K, value: (typeof state)[K]): void {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  const liveText = useThrottledValue(
    tf.liveText(state.freq3.toFixed(1), onBin, tf.windows[state.window])
  );

  const content = (
    <div className="flex flex-col gap-4">
      <TimeDomainPanel signal={signal} window={state.window} />
      <SpectrumPanel
        spectrum={spectrum}
        referenceSpectrum={referenceSpectrum}
        showReference={state.window !== 'rect'}
        variableFreq={state.freq3}
        maxFreq={DISPLAY_MAX_FREQ}
      />

      <ExpressionReadout>
        {onBin
          ? tf.onBin(nearestBinFreq(state.freq3).toFixed(2))
          : tf.offBin(nearestBinFreq(state.freq3).toFixed(2))}
      </ExpressionReadout>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={tf.binSpacing} value={`${BIN_SPACING.toFixed(2)} Hz`} />
        <Stat label={tf.nyquist} value={`${NYQUIST.toFixed(0)} Hz`} />
        <Stat label={tf.component3} value={`${state.freq3.toFixed(1)} Hz`} />
        <Stat label={tf.onBinQ} value={onBin ? t.common.yes : t.common.no} />
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        <Slider
          label={tf.amp1}
          value={state.amp1}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => set('amp1', v)}
          formatValue={(v) => v.toFixed(2)}
        />
        <Slider
          label={tf.amp2}
          value={state.amp2}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => set('amp2', v)}
          formatValue={(v) => v.toFixed(2)}
        />
        <Slider
          label={tf.amp3}
          value={state.amp3}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => set('amp3', v)}
          formatValue={(v) => v.toFixed(2)}
        />
        <Slider
          label={tf.freq3}
          value={state.freq3}
          min={FREQ3_MIN}
          max={FREQ3_MAX}
          step={0.5}
          onChange={(v) => set('freq3', v)}
          formatValue={(v) => `${v.toFixed(1)} Hz`}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => set('freq3', nearestBinFreq(state.freq3))}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-2)]"
          >
            {tf.snap}
          </button>
          <PlayPauseButton
            playing={audioPlaying}
            onToggle={() => {
              setAudioPlaying((p) => !p);
              logEvent('fourier', 'audio_toggled', { playing: !audioPlaying });
            }}
          />
          <span className="text-xs text-[var(--foreground)]/60">{tf.hear}</span>
        </div>
      </div>

      <SegmentedControl
        label={tf.windowFunction}
        value={state.window}
        onChange={(v) => {
          logEvent('fourier', 'window_changed', { window: v });
          set('window', v);
        }}
        options={windowOptions}
      />
      <p className="text-sm text-[var(--foreground)]/70">
        {state.window === 'rect' ? tf.rectNote : tf.taperNote}
      </p>

      {!practiceMode && (
        <PredictionCheck moduleId="fourier" disabled={!predictEnabled} questions={questions} />
      )}

      <LiveRegion text={liveText} />
    </div>
  );

  if (!practiceMode) return content;

  return (
    <PredictionGate
      moduleId="fourier"
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
