'use client';

import { useDeferredValue, useMemo } from 'react';
import { convolve, fftConvolve, directConvOps, fftConvOps } from '@/lib/dsp';
import { TheoremStateSchema, TheoremPresetSchema, type TheoremState } from '@/lib/state/schemas';
import { decodeTheoremState, encodeTheoremState, decodePredictFlag } from '@/lib/state/urlState';
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
  usePracticeMode,
  usePracticeQuestion,
  useThrottledValue,
} from '@/components/ui';
import { OverlayPanel } from './OverlayPanel';
import { CostChart } from './CostChart';
import { buildSignalPair } from './generators';
import { QUESTIONS } from './questions';
import { MIN_LENGTH, MAX_LENGTH, LENGTH_STEP } from './constants';

const DEFAULT_STATE = TheoremStateSchema.parse({});

export function TheoremModule(): React.JSX.Element {
  const predictEnabled = useUrlFlag(decodePredictFlag, true);
  const practiceMode = usePracticeMode();
  const t = useMessages().theorem;
  const questions = useLocalizedQuestions(QUESTIONS);
  const practiceQuestion = usePracticeQuestion(questions);
  const presetOptions = TheoremPresetSchema.options.map((id) => ({
    value: id,
    label: t.presets[id],
  }));
  const [state, setState] = useUrlSyncedState(
    decodeTheoremState,
    encodeTheoremState,
    DEFAULT_STATE
  );
  const deferredLength = useDeferredValue(state.length);

  const { x, h } = useMemo(
    () => buildSignalPair(state.preset, deferredLength),
    [state.preset, deferredLength]
  );

  const { direct, viaFft, maxError } = useMemo(() => {
    const directResult = convolve(x, h);
    const fftResult = fftConvolve(x, h);
    let err = 0;
    for (let i = 0; i < directResult.length; i++) {
      err = Math.max(err, Math.abs(directResult[i] - fftResult[i]));
    }
    return { direct: directResult, viaFft: fftResult, maxError: err };
  }, [x, h]);

  const directOps = directConvOps(deferredLength, deferredLength);
  const fftOps = fftConvOps(deferredLength, deferredLength);
  const speedup = directOps / Math.max(1, fftOps);

  const liveText = useThrottledValue(
    t.liveText(
      deferredLength,
      directOps.toLocaleString(),
      Math.round(fftOps).toLocaleString(),
      maxError.toExponential(2)
    )
  );

  function setPreset(preset: TheoremState['preset']): void {
    logEvent('theorem', 'preset_changed', { preset });
    setState((prev) => ({ ...prev, preset }));
  }

  const content = (
    <div className="flex flex-col gap-4">
      <OverlayPanel direct={direct} viaFft={viaFft} />
      <ExpressionReadout label={t.agreement}>
        max |direct − IFFT(FFT(x)·FFT(h))| = {maxError.toExponential(3)}
      </ExpressionReadout>

      <CostChart n={deferredLength} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t.directOps} value={directOps.toLocaleString()} />
        <Stat label={t.fftOps} value={Math.round(fftOps).toLocaleString()} />
        <Stat label={t.ratio} value={`${speedup.toFixed(1)}×`} />
        <Stat label={t.outputLength} value={`N + M − 1 = ${direct.length.toLocaleString()}`} />
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        <Slider
          label={t.lengthSlider}
          value={state.length}
          min={MIN_LENGTH}
          max={MAX_LENGTH}
          step={LENGTH_STEP}
          onChange={(v) => setState((prev) => ({ ...prev, length: v }))}
        />
      </div>

      <SegmentedControl
        label={t.signalShape}
        value={state.preset}
        onChange={setPreset}
        options={presetOptions}
      />

      {!practiceMode && (
        <PredictionCheck moduleId="theorem" disabled={!predictEnabled} questions={questions} />
      )}

      <LiveRegion text={liveText} />
    </div>
  );

  if (!practiceMode) return content;

  return (
    <PredictionGate
      moduleId="theorem"
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
