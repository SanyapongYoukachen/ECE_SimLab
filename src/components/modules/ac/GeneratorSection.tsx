'use client';

import { useMemo, useState } from 'react';
import { solveGenerator } from '@/lib/circuits/generator';
import type { AcState } from '@/lib/state/schemas';
import { logEvent } from '@/lib/state/telemetry';
import { useMessages } from '@/lib/i18n';
import {
  LiveRegion,
  PlayPauseButton,
  Slider,
  usePrefersReducedMotion,
  useThrottledValue,
} from '@/components/ui';
import { useRotorClock } from './rotorClock';
import { GeneratorMachine } from './GeneratorMachine';
import { GeneratorWave } from './GeneratorWave';
import { TURN_SECONDS } from './clock';
import { formatAmps, formatHz, formatMs, formatVolts, formatWatts } from './format';

type GenKey = 'turns' | 'flux' | 'area' | 'rpm' | 'poles' | 'rload' | 'ra';
type GenValues = Pick<AcState, GenKey>;

const PRESETS: Readonly<Record<string, GenValues>> = {
  grid50: { poles: 2, rpm: 3000, turns: 100, flux: 0.5, area: 0.01, rload: 100, ra: 1 },
  grid60: { poles: 2, rpm: 3600, turns: 100, flux: 0.5, area: 0.01, rload: 100, ra: 1 },
  four: { poles: 4, rpm: 1500, turns: 100, flux: 0.5, area: 0.01, rload: 100, ra: 1 },
  hydro: { poles: 12, rpm: 500, turns: 100, flux: 0.5, area: 0.01, rload: 100, ra: 1 },
  crank: { poles: 2, rpm: 120, turns: 500, flux: 1, area: 0.01, rload: 100, ra: 5 },
};
const PRESET_ORDER = ['grid50', 'grid60', 'four', 'hydro', 'crank'] as const;
const POLE_OPTIONS = [2, 4, 6, 8, 10, 12];
const KEYS: readonly GenKey[] = ['turns', 'flux', 'area', 'rpm', 'poles', 'rload', 'ra'];

interface Props {
  readonly state: AcState;
  readonly setState: (updater: (prev: AcState) => AcState) => void;
}

const selectClass =
  'rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm text-[var(--foreground)]';

/**
 * Where AC comes from: a coil turning in a magnetic field. The machine,
 * its output waveform and the circuit it drives all read one rotor clock,
 * so pausing or dragging the rotor moves every view together.
 */
export function GeneratorSection({ state, setState }: Props): React.JSX.Element {
  const t = useMessages().ac.gen;
  const reducedMotion = usePrefersReducedMotion();
  const [showCalc, setShowCalc] = useState(false);
  const g = useMemo(
    () =>
      solveGenerator({
        turns: state.turns,
        flux: state.flux,
        area: state.area,
        rpm: state.rpm,
        poles: state.poles,
        rLoad: state.rload,
        ra: state.ra,
      }),
    [state.turns, state.flux, state.area, state.rpm, state.poles, state.rload, state.ra]
  );
  const clock = useRotorClock(state.rpm > 0, reducedMotion);
  const pairs = state.poles / 2;

  const preset =
    PRESET_ORDER.find((id) => KEYS.every((k) => Math.abs(PRESETS[id][k] - state[k]) < 1e-9)) ??
    'custom';
  const slowMotion = g.frequency * TURN_SECONDS;

  function set<K extends GenKey>(key: K, value: AcState[K]): void {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  const liveText = useThrottledValue(
    t.live(formatVolts(g.eRms), formatHz(g.frequency), formatWatts(g.pLoad))
  );

  const calc = [
    `ωm = 2π·n/60 = 2π·${state.rpm}/60 = ${g.omegaM.toFixed(1)} rad/s`,
    `ωe = (P/2)·ωm = ${pairs}·${g.omegaM.toFixed(1)} = ${g.omegaE.toFixed(1)} rad/s`,
    `f = P·n/120 = ${state.poles}·${state.rpm}/120 = ${g.frequency.toFixed(2)} Hz,  T = ${formatMs(g.period)}`,
    `λ = N·B·A = ${state.turns}·${state.flux.toFixed(2)}·${state.area.toFixed(3)} = ${g.linkage.toFixed(3)} Wb-turns`,
    `e(t) = λ·ωe·sin(ωe·t)  →  Emax = ${g.linkage.toFixed(3)}·${g.omegaE.toFixed(1)} = ${g.ePeak.toFixed(1)} V`,
    `Erms = Emax/√2 = ${g.eRms.toFixed(1)} V`,
    `I = Erms/(R + Ra) = ${g.eRms.toFixed(1)}/${(state.rload + state.ra).toFixed(1)} = ${g.iRms.toFixed(3)} A rms`,
    `V = I·R = ${g.vRms.toFixed(1)} V rms   (lost in Ra: ${(g.iRms * state.ra).toFixed(2)} V)`,
    `P = V·I = ${g.pLoad.toFixed(1)} W,  Ra loss = I²·Ra = ${(g.iRms ** 2 * state.ra).toFixed(2)} W,  η = ${(g.efficiency * 100).toFixed(1)} %`,
    `Torque = P_gen/ωm = ${g.pGen.toFixed(1)}/${g.omegaM.toFixed(1)} = ${g.torque.toFixed(3)} N·m`,
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-sm text-[var(--foreground)]/75">{t.intro}</p>

      <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="text-center text-sm font-semibold text-[var(--foreground)]">
            {t.machineTitle(state.poles)}
          </div>
          <div className="text-center font-mono text-xs text-[var(--foreground)]/60">
            {t.machineSub(state.flux.toFixed(2))}
          </div>
          <GeneratorMachine
            result={g}
            poles={state.poles}
            rLoad={state.rload}
            ra={state.ra}
            clock={clock}
            labels={{
              angle: (e, m) =>
                pairs === 1
                  ? `θe = θm = ${Math.round((e * 180) / Math.PI)}°`
                  : `θe = ${pairs}·θm = ${Math.round((e * 180) / Math.PI)}°  (θm = ${Math.round((m * 180) / Math.PI)}°)`,
              drag: t.drag,
              circuit: t.circuitLabel,
            }}
            ariaLabel={t.machineAria(state.poles, formatVolts(g.ePeak))}
            circuitAria={t.circuitAria(state.ra, state.rload)}
          />
          <div className="text-center font-mono text-xs text-[var(--foreground)]/70">
            f = P·n/120 = {state.poles}×{state.rpm}/120 = {formatHz(g.frequency)}
          </div>
          <div className="text-center font-mono text-xs text-[var(--foreground)]/55">
            {state.rpm > 0 ? t.slowMotion(slowMotion.toFixed(0)) : t.stopped}
          </div>
        </div>

        <div className="flex flex-col gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="text-sm font-semibold text-[var(--foreground)]">{t.waveTitle}</div>
            <div className="font-mono text-xs text-[var(--foreground)]/60">
              f = {formatHz(g.frequency)} · T = {formatMs(g.period)}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-[var(--foreground)]/75">
            <Legend color="var(--plot-active)" dashed label={t.legendE} />
            <Legend color="var(--plot-input)" label={t.legendV} />
            <Legend color="var(--plot-output)" label={t.legendI} />
          </div>
          <GeneratorWave
            result={g}
            clock={clock}
            axisLabel={t.waveAxis}
            ariaLabel={t.waveAria(
              formatVolts(g.ePeak),
              formatVolts(g.vRms),
              formatAmps(g.iRms),
              formatHz(g.frequency)
            )}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        <PlayPauseButton playing={clock.playing} onToggle={clock.toggle} />
        {!clock.playing && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => clock.step((-15 * Math.PI) / 180)}
              className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-sm hover:bg-[var(--surface-2)]"
            >
              {t.stepBack}
            </button>
            <button
              type="button"
              onClick={() => clock.step((15 * Math.PI) / 180)}
              className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-sm hover:bg-[var(--surface-2)]"
            >
              {t.stepForward}
            </button>
          </div>
        )}
        <label className="flex flex-col gap-1 text-xs text-[var(--foreground)]/60">
          {t.polesLabel}
          <select
            className={selectClass}
            value={state.poles}
            onChange={(e) => {
              logEvent('ac', 'poles_changed', { poles: Number(e.target.value) });
              set('poles', Number(e.target.value));
            }}
          >
            {POLE_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {t.polesOption(p)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-[var(--foreground)]/60">
          {t.presetLabel}
          <select
            className={selectClass}
            value={preset}
            onChange={(e) => {
              const id = e.target.value;
              if (id === 'custom') return;
              logEvent('ac', 'generator_preset', { preset: id });
              setState((prev) => ({ ...prev, ...PRESETS[id] }));
            }}
          >
            <option value="custom" disabled={preset !== 'custom'}>
              {t.presets.custom}
            </option>
            {PRESET_ORDER.map((id) => (
              <option key={id} value={id}>
                {t.presets[id]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          aria-expanded={showCalc}
          onClick={() => setShowCalc((v) => !v)}
          className="rounded-md bg-[var(--plot-active)] px-3 py-1.5 text-sm font-medium text-white"
        >
          {showCalc ? t.hideCalc : t.showCalc}
        </button>
      </div>

      {showCalc && (
        <pre className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 font-mono text-[12.5px] leading-relaxed text-[var(--foreground)]">
          {calc.join('\n')}
        </pre>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <BigStat label={t.statPeak} value={formatVolts(g.ePeak)} color="var(--plot-active)" />
        <BigStat label={t.statRmsEmf} value={formatVolts(g.eRms)} color="var(--plot-active)" />
        <BigStat label={t.statTerminal} value={formatVolts(g.vRms)} color="var(--plot-input)" />
        <BigStat label={t.statFreq} value={formatHz(g.frequency)} color="var(--foreground)" />
        <BigStat label={t.statCurrent} value={formatAmps(g.iRms)} color="var(--plot-output)" />
        <BigStat label={t.statPower} value={formatWatts(g.pLoad)} color="var(--plot-output)" />
        <BigStat label={t.statPeriod} value={formatMs(g.period)} color="var(--foreground)" />
        <BigStat
          label={t.statTorque}
          value={`${g.torque.toFixed(3)} N·m`}
          color="var(--foreground)"
        />
      </div>

      <div className="grid gap-x-6 gap-y-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 md:grid-cols-2">
        <Slider
          label={t.turns}
          value={state.turns}
          min={1}
          max={500}
          step={1}
          onChange={(v) => set('turns', v)}
        />
        <Slider
          label={t.flux}
          value={state.flux}
          min={0.05}
          max={1.5}
          step={0.05}
          formatValue={(v) => `${v.toFixed(2)} T`}
          onChange={(v) => set('flux', Number(v.toFixed(2)))}
        />
        <Slider
          label={t.area}
          value={state.area}
          min={0.001}
          max={0.05}
          step={0.001}
          formatValue={(v) => `${v.toFixed(3)} m²`}
          onChange={(v) => set('area', Number(v.toFixed(3)))}
        />
        <Slider
          label={t.speed}
          value={state.rpm}
          min={0}
          max={3600}
          step={10}
          formatValue={(v) => `${v} rpm`}
          onChange={(v) => set('rpm', v)}
        />
        <Slider
          label={t.load}
          value={state.rload}
          min={1}
          max={1000}
          step={1}
          formatValue={(v) => `${v} Ω`}
          onChange={(v) => set('rload', v)}
        />
        <Slider
          label={t.armature}
          value={state.ra}
          min={0.1}
          max={20}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)} Ω`}
          onChange={(v) => set('ra', Number(v.toFixed(1)))}
        />
      </div>

      <p className="max-w-3xl text-sm text-[var(--foreground)]/75">{t.explain}</p>
      <LiveRegion text={liveText} />
    </div>
  );
}

function Legend({
  color,
  label,
  dashed = false,
}: {
  readonly color: string;
  readonly label: string;
  readonly dashed?: boolean;
}): React.JSX.Element {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="inline-block w-4"
        style={{ borderTop: `2px ${dashed ? 'dashed' : 'solid'} ${color}` }}
      />
      {label}
    </span>
  );
}

function BigStat({
  label,
  value,
  color,
}: {
  readonly label: string;
  readonly value: string;
  readonly color: string;
}): React.JSX.Element {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center">
      <div className="text-[11px] uppercase tracking-wide text-[var(--foreground)]/60">{label}</div>
      <div className="font-mono text-lg font-semibold tabular-nums" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
