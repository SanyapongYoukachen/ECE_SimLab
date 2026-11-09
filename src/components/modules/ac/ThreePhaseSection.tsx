'use client';

import { useMemo } from 'react';
import {
  PHASES,
  instant,
  solveThreePhase,
  totalPower,
  type Connection,
} from '@/lib/circuits/generator';
import type { AcState } from '@/lib/state/schemas';
import { logEvent } from '@/lib/state/telemetry';
import { useMessages } from '@/lib/i18n';
import { Field, LiveRegion, SegmentedControl, Slider, useThrottledValue } from '@/components/ui';
import { TimeStack, type StackPanel } from './TimeStack';
import { ThreePhaseMachine, ThreePhasePhasors } from './ThreePhaseCanvases';
import { ConnectionDiagram } from './ConnectionDiagram';
import { PHASE_COLOR } from './phaseColors';
import {
  formatAmps,
  formatDegrees,
  formatHz,
  formatVa,
  formatVar,
  formatVolts,
  formatWatts,
} from './format';

interface Props {
  readonly state: AcState;
  readonly setState: (updater: (prev: AcState) => AcState) => void;
}

/**
 * Three phase: three coils 120° apart make three voltages 120° apart. The
 * payoffs students should see: line voltage is √3 × phase voltage; a
 * balanced load's currents sum to zero (no neutral current) and its total
 * power is constant, not pulsing like single phase.
 */
export function ThreePhaseSection({ state, setState }: Props): React.JSX.Element {
  const t = useMessages().ac.three;
  const conn = state.conn as Connection;
  const r = useMemo(
    () =>
      solveThreePhase({
        vPhase: state.vph,
        frequency: state.freq,
        r: state.rph,
        x: state.xph,
        unbalance: state.unb,
        connection: conn,
      }),
    [state.vph, state.freq, state.rph, state.xph, state.unb, conn]
  );
  const omega = 2 * Math.PI * state.freq;
  const period = 1 / state.freq;
  const balanced = Math.abs(state.unb - 1) < 1e-9;

  const panels = useMemo<StackPanel[]>(() => {
    const kv = (x: number): string =>
      Math.abs(x) >= 1000 ? `${(x / 1000).toFixed(1)}k` : `${Math.round(x)}`;
    const currentPanel: StackPanel = {
      title: `${t.panelI} [A]`,
      series: [
        ...PHASES.map((k) => ({
          f: (tt: number) => instant(r.iLine[k], omega, tt),
          color: PHASE_COLOR[k],
        })),
        ...(conn === 'wye'
          ? [{ f: (tt: number) => instant(r.iNeutral, omega, tt), color: 'structure' as const }]
          : []),
      ],
      format: (x) => (Math.abs(x) < 10 ? x.toFixed(1) : `${Math.round(x)}`),
    };
    return [
      {
        title: `${t.panelV} [V]`,
        series: PHASES.map((k) => ({
          f: (tt: number) => instant(r.vPhase[k], omega, tt),
          color: PHASE_COLOR[k],
        })),
        format: (x) => `${Math.round(x)}`,
      },
      currentPanel,
      {
        title: `${t.panelP} [W]`,
        series: [{ f: (tt: number) => totalPower(r, omega, tt), color: 'active', fill: true }],
        lines: [{ y: r.p, label: `P = ${formatWatts(r.p)}`, color: 'output' }],
        format: kv,
      },
    ];
  }, [r, omega, conn, t]);

  const pf = `${r.powerFactor.toFixed(3)}${r.q > 1e-9 ? ` ${t.lagging}` : ''}`;
  const liveText = useThrottledValue(
    t.live(formatVolts(r.vLine.a.mag), formatAmps(r.iLine.a.mag), formatWatts(r.p))
  );
  const set = <K extends keyof AcState>(key: K, value: AcState[K]): void =>
    setState((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-sm text-[var(--foreground)]/75">{t.intro}</p>

      <Field label={t.connLabel}>
        <SegmentedControl
          label={t.connLabel}
          value={conn}
          onChange={(v) => {
            logEvent('ac', 'connection_changed', { conn: v });
            set('conn', v);
          }}
          options={[
            { value: 'wye', label: t.conn.wye },
            { value: 'delta', label: t.conn.delta },
          ]}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-3">
        <figure className="flex flex-col gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] p-2">
          <figcaption className="text-xs text-[var(--foreground)]/70">{t.machineTitle}</figcaption>
          <ThreePhaseMachine ariaLabel={t.machineAria} />
        </figure>
        <figure className="flex flex-col gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] p-2">
          <figcaption className="text-xs text-[var(--foreground)]/70">{t.phasorTitle}</figcaption>
          <ThreePhasePhasors
            result={r}
            ariaLabel={t.phasorAria(
              formatVolts(r.vPhase.a.mag),
              formatVolts(r.vLine.a.mag),
              formatDegrees(r.phi)
            )}
          />
        </figure>
        <figure className="flex flex-col gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] p-2">
          <figcaption className="text-xs text-[var(--foreground)]/70">{t.connTitle}</figcaption>
          <ConnectionDiagram
            connection={conn}
            ariaLabel={t.connAria(t.conn[conn])}
            labels={{
              vPhase: `Vph ${formatVolts(r.vPhase.a.mag)}`,
              vLine: `VL ${formatVolts(r.vLine.a.mag)}`,
              iLine: `IL ${formatAmps(r.iLine.a.mag)}`,
              iPhase: `Iph ${formatAmps(r.iLoad.a.mag)}`,
              iNeutral: `In ${formatAmps(r.iNeutral.mag)}`,
              neutral: conn === 'wye' ? t.starPoint : t.noNeutral,
              load: t.loadCaption,
            }}
          />
        </figure>
      </div>

      <TimeStack
        panels={panels}
        period={period}
        ariaLabel={t.waveAria(formatVolts(r.vPhase.a.mag), formatWatts(r.p))}
      />

      <p className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--foreground)]/80">
        {conn === 'delta'
          ? t.insightDelta(formatAmps(r.iLoad.a.mag), formatAmps(r.iLine.a.mag))
          : balanced
            ? t.insightBalanced
            : t.insightUnbalanced(formatAmps(r.iNeutral.mag))}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t.statVph} value={formatVolts(r.vPhase.a.mag)} />
        <Stat label={t.statVl} value={formatVolts(r.vLine.a.mag)} />
        <Stat label={t.statIl} value={formatAmps(r.iLine.a.mag)} />
        <Stat label={t.statIph} value={formatAmps(r.iLoad.a.mag)} />
        <Stat label={t.statIn} value={conn === 'wye' ? formatAmps(r.iNeutral.mag) : '—'} />
        <Stat label={t.statP} value={formatWatts(r.p)} />
        <Stat label={t.statQ} value={formatVar(r.q)} />
        <Stat label={t.statPf} value={pf} />
        <Stat label={t.statS} value={formatVa(r.s)} />
        <Stat label={t.statFreq} value={formatHz(state.freq)} />
      </div>

      <div className="grid gap-x-6 gap-y-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 md:grid-cols-2">
        <Slider
          label={t.sliderV}
          value={state.vph}
          min={50}
          max={400}
          step={5}
          formatValue={(v) => `${v} V`}
          onChange={(v) => set('vph', v)}
        />
        <Slider
          label={t.sliderF}
          value={state.freq}
          min={1}
          max={200}
          step={1}
          formatValue={formatHz}
          onChange={(v) => set('freq', v)}
        />
        <Slider
          label={t.sliderR}
          value={state.rph}
          min={1}
          max={200}
          step={1}
          formatValue={(v) => `${v} Ω`}
          onChange={(v) => set('rph', v)}
        />
        <Slider
          label={t.sliderX}
          value={state.xph}
          min={0}
          max={200}
          step={1}
          formatValue={(v) => `${v} Ω`}
          onChange={(v) => set('xph', v)}
        />
        <Slider
          label={t.sliderUnb}
          value={state.unb}
          min={0.2}
          max={3}
          step={0.1}
          formatValue={(v) => `×${v.toFixed(1)}`}
          onChange={(v) => set('unb', Number(v.toFixed(1)))}
        />
        <div className="flex items-end">
          <button
            type="button"
            disabled={balanced}
            onClick={() => set('unb', 1)}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-2)] disabled:opacity-40"
          >
            {t.balance}
          </button>
        </div>
      </div>
      <LiveRegion text={liveText} />
    </div>
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
