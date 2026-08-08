'use client';

import { useDeferredValue, useMemo } from 'react';
import { convolve, fftConvolve, directConvOps, fftConvOps } from '@/lib/dsp';
import { TheoremStateSchema, TheoremPresetSchema, type TheoremState } from '@/lib/state/schemas';
import { decodeTheoremState, encodeTheoremState, decodePredictFlag } from '@/lib/state/urlState';
import { useUrlSyncedState, useUrlFlag } from '@/lib/state/useUrlState';
import { logEvent } from '@/lib/state/telemetry';
import {
  PredictionGate,
  Slider,
  SegmentedControl,
  ExpressionReadout,
  LiveRegion,
  useThrottledValue,
} from '@/components/ui';
import { OverlayPanel } from './OverlayPanel';
import { CostChart } from './CostChart';
import { buildSignalPair } from './generators';
import { MIN_LENGTH, MAX_LENGTH, LENGTH_STEP } from './constants';

const DEFAULT_STATE = TheoremStateSchema.parse({});
const PRESET_OPTIONS = TheoremPresetSchema.options.map((id) => ({
  value: id,
  label: id[0].toUpperCase() + id.slice(1),
}));

export function TheoremModule(): React.JSX.Element {
  const predictEnabled = useUrlFlag(decodePredictFlag, true);
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
    `Length ${deferredLength}. Direct: ${directOps.toLocaleString()} operations. FFT: ${Math.round(
      fftOps
    ).toLocaleString()} operations. Maximum error between the two paths: ${maxError.toExponential(2)}.`
  );

  function setPreset(preset: TheoremState['preset']): void {
    logEvent('theorem', 'preset_changed', { preset });
    setState((prev) => ({ ...prev, preset }));
  }

  return (
    <PredictionGate
      moduleId="theorem"
      disabled={!predictEnabled}
      question="You double the signal length N. How does the operation count change for each method?"
      options={[
        { id: 'a', label: 'Both roughly double', correct: false },
        {
          id: 'b',
          label: 'Direct roughly quadruples; FFT barely more than doubles',
          correct: true,
        },
        { id: 'c', label: 'Direct doubles; FFT quadruples', correct: false },
        { id: 'd', label: 'Neither changes', correct: false },
      ]}
    >
      <div className="flex flex-col gap-4">
        <OverlayPanel direct={direct} viaFft={viaFft} />
        <ExpressionReadout label="Agreement between the two paths">
          max |direct − IFFT(FFT(x)·FFT(h))| = {maxError.toExponential(3)}
        </ExpressionReadout>

        <CostChart n={deferredLength} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Direct operations" value={directOps.toLocaleString()} />
          <Stat label="FFT operations" value={Math.round(fftOps).toLocaleString()} />
          <Stat label="Operation ratio" value={`${speedup.toFixed(1)}×`} />
          <Stat label="Output length" value={`N + M − 1 = ${direct.length.toLocaleString()}`} />
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
          <Slider
            label="Signal length N (x and h are both this long)"
            value={state.length}
            min={MIN_LENGTH}
            max={MAX_LENGTH}
            step={LENGTH_STEP}
            onChange={(v) => setState((prev) => ({ ...prev, length: v }))}
          />
        </div>

        <SegmentedControl
          label="Signal shape"
          value={state.preset}
          onChange={setPreset}
          options={PRESET_OPTIONS}
        />

        <LiveRegion text={liveText} />
      </div>
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
