'use client';

import { useMemo } from 'react';
import {
  LOAD_TYPES,
  WAVE_SHAPES,
  acInstant,
  loadParts,
  solveAcLoad,
  unitWave,
  waveStats,
  type LoadType,
  type WaveShape,
} from '@/lib/circuits/ac';
import { AcStateSchema, type AcState } from '@/lib/state/schemas';
import { decodeAcState, encodeAcState, decodePredictFlag } from '@/lib/state/urlState';
import { useUrlSyncedState, useUrlFlag } from '@/lib/state/useUrlState';
import { logEvent } from '@/lib/state/telemetry';
import { useLocalizedQuestions, useMessages } from '@/lib/i18n';
import {
  ExpressionReadout,
  Field,
  LiveRegion,
  ModuleTabs,
  PredictionGate,
  SegmentedControl,
  Slider,
  usePracticeMode,
  usePracticeQuestion,
  useThrottledValue,
} from '@/components/ui';
import { TimeStack, type StackPanel } from './TimeStack';
import { LoadPhasor, PowerTriangle, SinePhasor } from './Phasors';
import {
  formatAmps,
  formatDegrees,
  formatHz,
  formatImpedance,
  formatMs,
  formatOhms,
  formatVa,
  formatVar,
  formatVolts,
  formatWatts,
} from './format';
import { QUESTIONS } from './questions';

const DEFAULT_STATE = AcStateSchema.parse({});
const MODULE_ID = 'ac';

export function AcModule(): React.JSX.Element {
  const predictEnabled = useUrlFlag(decodePredictFlag, true);
  const practiceMode = usePracticeMode();
  const t = useMessages().ac;
  const questions = useLocalizedQuestions(QUESTIONS);
  const practiceQuestion = usePracticeQuestion(questions);
  const [state, setState] = useUrlSyncedState(decodeAcState, encodeAcState, DEFAULT_STATE);

  function set<K extends keyof AcState>(key: K, value: AcState[K]): void {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function setMode(mode: AcState['mode']): void {
    logEvent(MODULE_ID, 'mode_changed', { mode });
    set('mode', mode);
  }

  const content = (
    <div className="flex flex-col gap-4">
      <Field label={t.modeLabel}>
        <SegmentedControl
          label={t.modeLabel}
          value={state.mode}
          onChange={setMode}
          options={[
            { value: 'sine', label: t.modes.sine },
            { value: 'load', label: t.modes.load },
          ]}
        />
      </Field>
      {state.mode === 'sine' ? (
        <SineSection state={state} set={set} />
      ) : (
        <LoadSection state={state} set={set} />
      )}
    </div>
  );

  if (!practiceMode) {
    return (
      <ModuleTabs moduleId={MODULE_ID} questions={questions} disabled={!predictEnabled}>
        {content}
      </ModuleTabs>
    );
  }

  return (
    <PredictionGate
      moduleId={MODULE_ID}
      disabled={!predictEnabled}
      question={practiceQuestion.question}
      options={practiceQuestion.options}
      persist={false}
    >
      {content}
    </PredictionGate>
  );
}

interface SectionProps {
  readonly state: AcState;
  readonly set: <K extends keyof AcState>(key: K, value: AcState[K]) => void;
}

function SineSection({ state, set }: SectionProps): React.JSX.Element {
  const t = useMessages().ac;
  const shape = state.shape as WaveShape;
  const stats = waveStats(shape, state.peak, state.freq);
  const phaseRad = (state.phase * Math.PI) / 180;
  const omega = 2 * Math.PI * state.freq;
  const ruleValue = state.peak / Math.SQRT2;
  const ruleHolds = Math.abs(ruleValue - stats.rms) < 1e-9;

  const panels = useMemo<StackPanel[]>(() => {
    const v = (tt: number): number => state.peak * unitWave(shape, omega * tt + phaseRad);
    return [
      {
        title: `${t.panelV} [V]`,
        series: [{ f: v, color: 'input' }],
        lines: [
          { y: stats.rms, label: `+Vrms = ${formatVolts(stats.rms)}`, color: 'output' },
          { y: -stats.rms, label: '−Vrms', color: 'output' },
        ],
        format: (x) => `${Math.round(x)}`,
      },
      {
        title: `${t.panelV2} [V²]`,
        series: [{ f: (tt) => v(tt) ** 2, color: 'active', fill: true }],
        lines: [
          {
            y: stats.rms ** 2,
            label: `${t.meanSquare} = ${Math.round(stats.rms ** 2).toLocaleString('en-US')} V²`,
            color: 'output',
          },
        ],
        format: (x) => (Math.abs(x) >= 1000 ? `${Math.round(x / 1000)}k` : `${Math.round(x)}`),
      },
    ];
  }, [shape, state.peak, omega, phaseRad, stats.rms, t]);

  const liveText = useThrottledValue(t.liveSine(formatVolts(stats.rms), formatVolts(stats.peak)));

  return (
    <>
      <Field label={t.shapeLabel}>
        <SegmentedControl
          label={t.shapeLabel}
          value={shape}
          onChange={(v) => {
            logEvent(MODULE_ID, 'shape_changed', { shape: v });
            set('shape', v);
          }}
          options={WAVE_SHAPES.map((s) => ({ value: s, label: t.shapes[s] }))}
        />
      </Field>

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <TimeStack
          panels={panels}
          period={stats.period}
          ariaLabel={t.sineAria(
            t.shapes[shape],
            formatVolts(stats.peak),
            formatVolts(stats.rms),
            formatHz(state.freq)
          )}
        />
        <div className="flex flex-col gap-2">
          <div className="text-xs text-[var(--foreground)]/70">{t.phasorTitle}</div>
          {shape === 'sine' ? (
            <>
              <SinePhasor phase={phaseRad} ariaLabel={t.phasorAria(`${state.phase}°`)} />
              <p className="text-xs text-[var(--foreground)]/55">{t.phasorNote}</p>
            </>
          ) : (
            <p className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--foreground)]/75">
              {t.notSine}
            </p>
          )}
        </div>
      </div>

      <ExpressionReadout label={t.statRule}>
        Vp/√2 = {formatVolts(ruleValue)} → {ruleHolds ? t.ruleHolds : t.ruleFails} (Vrms ={' '}
        {formatVolts(stats.rms)})
      </ExpressionReadout>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t.statPeak} value={formatVolts(stats.peak)} />
        <Stat label={t.statPeakToPeak} value={formatVolts(stats.peakToPeak)} />
        <Stat label={t.statRms} value={formatVolts(stats.rms)} />
        <Stat label={t.statRectified} value={formatVolts(stats.rectifiedMean)} />
        <Stat label={t.statCrest} value={stats.crestFactor.toFixed(3)} />
        <Stat label={t.statPeriod} value={formatMs(stats.period)} />
        <Stat label={t.statOmega} value={`${stats.omega.toFixed(1)} rad/s`} />
        <Stat label={t.phase} value={`${state.phase}°`} />
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        <Slider
          label={t.peak}
          value={state.peak}
          min={1}
          max={400}
          step={1}
          formatValue={(v) => `${v} V`}
          onChange={(v) => set('peak', v)}
        />
        <Slider
          label={t.frequency}
          value={state.freq}
          min={1}
          max={200}
          step={1}
          formatValue={formatHz}
          onChange={(v) => set('freq', v)}
        />
        <Slider
          label={t.phase}
          value={state.phase}
          min={-180}
          max={180}
          step={5}
          formatValue={(v) => `${v}°`}
          onChange={(v) => set('phase', v)}
        />
      </div>

      <p className="text-sm text-[var(--foreground)]/70">{t.rmsExplain}</p>
      <LiveRegion text={liveText} />
    </>
  );
}

function LoadSection({ state, set }: SectionProps): React.JSX.Element {
  const t = useMessages().ac;
  const load = state.load as LoadType;
  const parts = loadParts(load);
  const result = useMemo(
    () => solveAcLoad(load, state.vrms, state.freq, state.r, state.l / 1000, state.c / 1e6),
    [load, state.vrms, state.freq, state.r, state.l, state.c]
  );
  const period = 1 / state.freq;
  const omega = 2 * Math.PI * state.freq;
  const deg = formatDegrees(Math.abs(result.theta));
  const relation =
    result.pfKind === 'unity'
      ? t.inPhaseText
      : result.pfKind === 'lagging'
        ? t.lagText(deg)
        : t.leadText(deg);
  const pfText = `${result.powerFactor.toFixed(3)} ${t[result.pfKind]}`;
  // Current's positive-going zero crossing, the one right after the voltage's at t = T.
  const shift = result.theta / omega;

  const panels = useMemo<StackPanel[]>(() => {
    const at = (tt: number): { v: number; i: number; p: number } =>
      acInstant(result, state.freq, tt);
    const bracket =
      Math.abs(result.theta) > 1e-6
        ? { from: period, to: period + shift, label: `Δt = ${formatMs(Math.abs(shift))}` }
        : undefined;
    return [
      {
        title: `${t.panelV} [V]`,
        series: [{ f: (tt) => at(tt).v, color: 'input' }],
        format: (x) => `${Math.round(x)}`,
      },
      {
        title: `${t.panelI} [A]`,
        series: [{ f: (tt) => at(tt).i, color: 'output' }],
        bracket,
        format: (x) => (Math.abs(x) < 10 ? x.toFixed(1) : `${Math.round(x)}`),
      },
      {
        title: `${t.panelP} [W]`,
        series: [{ f: (tt) => at(tt).p, color: 'active', fill: true }],
        lines: [
          { y: result.p, label: `${t.averageP} = ${formatWatts(result.p)}`, color: 'output' },
        ],
        format: (x) => (Math.abs(x) >= 1000 ? `${(x / 1000).toFixed(1)}k` : `${Math.round(x)}`),
      },
    ];
  }, [result, state.freq, period, shift, t]);

  const guides = useMemo(
    () => [
      { t: period, color: 'input' as const },
      ...(Math.abs(result.theta) > 1e-6 ? [{ t: period + shift, color: 'output' as const }] : []),
    ],
    [period, shift, result.theta]
  );

  const liveText = useThrottledValue(t.liveLoad(formatAmps(result.iRms), relation, pfText));
  const f0 = result.resonance;
  const f0InRange = f0 !== null && f0 >= 1 && f0 <= 200;

  return (
    <>
      <Field label={t.loadLabel}>
        <SegmentedControl
          label={t.loadLabel}
          value={load}
          onChange={(v) => {
            logEvent(MODULE_ID, 'load_changed', { load: v });
            set('load', v);
          }}
          options={LOAD_TYPES.map((l) => ({ value: l, label: t.loads[l] }))}
        />
      </Field>
      <p className="text-sm text-[var(--foreground)]/70">{t.loadHow[load]}</p>

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <TimeStack
          panels={panels}
          period={period}
          guides={guides}
          ariaLabel={t.loadAria(t.loads[load], formatDegrees(result.theta), pfText)}
        />
        <div className="flex flex-col gap-2">
          <div className="text-xs text-[var(--foreground)]/70">{t.phasorLoadTitle}</div>
          <LoadPhasor theta={result.theta} ariaLabel={t.phasorLoadAria(relation)} />
          <p className="text-xs text-[var(--foreground)]/55">{t.phasorScale}</p>
          <div className="text-xs text-[var(--foreground)]/70">{t.triangleTitle}</div>
          <PowerTriangle
            p={result.p}
            q={result.q}
            s={result.s}
            labels={{
              p: `P = ${formatWatts(result.p)}`,
              q: `Q = ${formatVar(result.q)}`,
              s: `S = ${formatVa(result.s)}`,
            }}
            ariaLabel={t.triangleAria(
              formatWatts(result.p),
              formatVar(result.q),
              formatVa(result.s)
            )}
          />
        </div>
      </div>

      <ExpressionReadout label={t.statZ}>
        Z = {formatImpedance(result.zRe, result.zIm)}, |Z| = {formatOhms(result.zMag)}, θ ={' '}
        {formatDegrees(result.theta)} → {relation}, PF = {pfText}
      </ExpressionReadout>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t.statI} value={formatAmps(result.iRms)} />
        <Stat label={t.statTheta} value={formatDegrees(result.theta)} />
        <Stat label={t.statPf} value={pfText} />
        <Stat label={t.statZMag} value={formatOhms(result.zMag)} />
        <Stat label={t.statP} value={formatWatts(result.p)} />
        <Stat label={t.statQ} value={formatVar(result.q)} />
        <Stat label={t.statS} value={formatVa(result.s)} />
        {parts.r && <Stat label={t.statVr} value={formatVolts(result.vR)} />}
        {parts.l && <Stat label={t.statXl} value={formatOhms(result.xl)} />}
        {parts.l && <Stat label={t.statVl} value={formatVolts(result.vL)} />}
        {parts.c && <Stat label={t.statXc} value={formatOhms(result.xc)} />}
        {parts.c && <Stat label={t.statVc} value={formatVolts(result.vC)} />}
        {f0 !== null && <Stat label={t.statF0} value={formatHz(f0)} />}
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        <Slider
          label={t.sourceRms}
          value={state.vrms}
          min={1}
          max={240}
          step={1}
          formatValue={(v) => `${v} V`}
          onChange={(v) => set('vrms', v)}
        />
        <Slider
          label={t.frequency}
          value={state.freq}
          min={1}
          max={200}
          step={1}
          formatValue={formatHz}
          onChange={(v) => set('freq', v)}
        />
        {parts.r && (
          <Slider
            label={t.resistance}
            value={state.r}
            min={1}
            max={200}
            step={1}
            formatValue={(v) => `${v} Ω`}
            onChange={(v) => set('r', v)}
          />
        )}
        {parts.l && (
          <Slider
            label={t.inductance}
            value={state.l}
            min={1}
            max={500}
            step={1}
            formatValue={(v) => `${v} mH`}
            onChange={(v) => set('l', v)}
          />
        )}
        {parts.c && (
          <Slider
            label={t.capacitance}
            value={state.c}
            min={1}
            max={1000}
            step={1}
            formatValue={(v) => `${v} µF`}
            onChange={(v) => set('c', v)}
          />
        )}
        {f0 !== null && f0InRange && (
          <div>
            <button
              type="button"
              onClick={() => {
                logEvent(MODULE_ID, 'tuned_to_resonance', { f0 });
                // Exact, not rounded: 50.33 Hz leaves a residual angle that reads as lagging.
                set('freq', f0);
              }}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-2)]"
            >
              {t.tuneResonance(formatHz(f0))}
            </button>
          </div>
        )}
      </div>

      <LiveRegion text={liveText} />
    </>
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
