'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { convolveSteps } from '@/lib/dsp';
import { ConvolutionStateSchema, type KernelId } from '@/lib/state/schemas';
import {
  decodeConvolutionState,
  encodeConvolutionState,
  decodePredictFlag,
} from '@/lib/state/urlState';
import { useUrlSyncedState, useUrlFlag } from '@/lib/state/useUrlState';
import { logEvent } from '@/lib/state/telemetry';
import {
  PredictionCheck,
  Slider,
  SegmentedControl,
  PlayPauseButton,
  ExpressionReadout,
  LiveRegion,
  usePrefersReducedMotion,
  useThrottledValue,
} from '@/components/ui';
import { ConvolutionInputPanel } from './ConvolutionInputPanel';
import { ConvolutionOutputPanel } from './ConvolutionOutputPanel';
import { KERNEL_PRESETS, KERNEL_ORDER } from './kernels';
import { formatConvExpression } from './expression';

const DEFAULT_STATE = ConvolutionStateSchema.parse({});
const STEP_MS = 700;

export function ConvolutionModule(): React.JSX.Element {
  const predictEnabled = useUrlFlag(decodePredictFlag, true);
  const [state, setState] = useUrlSyncedState(
    decodeConvolutionState,
    encodeConvolutionState,
    DEFAULT_STATE
  );
  const [playing, setPlaying] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const kernelValues = useMemo(() => KERNEL_PRESETS[state.kernel].values, [state.kernel]);
  const steps = useMemo(() => convolveSteps(state.x, kernelValues), [state.x, kernelValues]);
  const y = useMemo(() => steps.map((s) => s.sum), [steps]);
  const outLen = steps.length;
  const n = Math.min(state.n, Math.max(0, outLen - 1));
  const currentStep = steps[n];

  // Mirrors the latest state into a ref (written from an effect, never
  // during render) so the interval callback below always acts on fresh
  // values without needing to restart the interval — and without reaching
  // for `setState`'s functional-updater form just to dodge a stale closure,
  // which would make stopping playback from inside that updater an impure
  // side effect.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const id = setInterval(() => {
      const prev = stateRef.current;
      const len = prev.x.length + KERNEL_PRESETS[prev.kernel].values.length - 1;
      if (prev.n >= len - 1) {
        setPlaying(false);
        return;
      }
      setState({ ...prev, n: prev.n + 1 });
    }, STEP_MS);
    return () => clearInterval(id);
  }, [playing, reducedMotion, setState]);

  function setKernel(kernel: KernelId): void {
    logEvent('convolution', 'kernel_changed', { kernel });
    setState((prev) => {
      const len = prev.x.length + KERNEL_PRESETS[kernel].values.length - 1;
      return { ...prev, kernel, n: Math.min(prev.n, len - 1) };
    });
  }

  function setN(next: number): void {
    setState((prev) => ({ ...prev, n: next }));
  }

  function editSample(index: number, value: number): void {
    setState((prev) => ({ ...prev, x: prev.x.map((v, i) => (i === index ? value : v)) }));
  }

  function togglePlay(): void {
    if (n >= outLen - 1) setN(0);
    setPlaying((p) => !p);
    logEvent('convolution', 'play_toggled', { playing: !playing });
  }

  function stepOnce(): void {
    setN(Math.min(n + 1, outLen - 1));
  }

  const kernel = KERNEL_PRESETS[state.kernel];
  const liveText = useThrottledValue(
    `Shift n=${n} of ${outLen - 1}. ${formatConvExpression(currentStep)}`
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <ConvolutionInputPanel
          x={state.x}
          kernelValues={kernelValues}
          n={n}
          step={currentStep}
          onEditSample={editSample}
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
        />
        <ConvolutionOutputPanel y={y} n={n} />
      </div>

      <ExpressionReadout label="Current shift">
        {formatConvExpression(currentStep) || '—'}
      </ExpressionReadout>

      <div className="flex flex-wrap items-center gap-4 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        {reducedMotion ? (
          <button
            type="button"
            onClick={stepOnce}
            disabled={n >= outLen - 1}
            className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] disabled:opacity-40"
          >
            Step →
          </button>
        ) : (
          <PlayPauseButton playing={playing} onToggle={togglePlay} />
        )}
        <div className="min-w-[220px] flex-1">
          <Slider
            label="Shift n"
            value={n}
            min={0}
            max={Math.max(0, outLen - 1)}
            step={1}
            onChange={setN}
          />
        </div>
      </div>

      <SegmentedControl
        label="Kernel"
        value={state.kernel}
        onChange={setKernel}
        options={KERNEL_ORDER.map((id) => ({ value: id, label: KERNEL_PRESETS[id].label }))}
      />

      <p className="text-sm text-[var(--foreground)]/70">{kernel.note}</p>

      <p className="font-mono tabular-nums text-xs text-[var(--foreground)]/60">
        h[k] = [{kernelValues.map((v) => v.toFixed(2)).join(', ')}] → flipped: h[−k] = [
        {[...kernelValues]
          .reverse()
          .map((v) => v.toFixed(2))
          .join(', ')}
        ]
      </p>

      <PredictionCheck
        moduleId="convolution"
        disabled={!predictEnabled}
        question="x has 5 samples and h has 3 samples. How many samples will y = x * h have?"
        options={[
          { id: 'a', label: '5 — output matches the input length', correct: false },
          { id: 'b', label: '8 — output is the sum of both lengths', correct: false },
          { id: 'c', label: '7 — output is N + M − 1', correct: true },
          { id: 'd', label: '3 — output matches the shorter kernel', correct: false },
        ]}
      />

      <LiveRegion text={liveText} />
    </div>
  );
}
