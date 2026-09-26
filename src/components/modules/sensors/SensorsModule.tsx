'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ADC_BITS,
  ADC_LEVELS,
  LIGHT_COLORS,
  NTC_ACTIVATION_EV,
  RANGES,
  R_FIXED,
  SUPPLY_V,
  WAVELENGTH_NM,
  isAbsorbed,
  photonEnergyEv,
  photonRate,
  readChain,
  scenarioQuantity,
  sweepChain,
  thermalEnergyEv,
  type LightColor,
  type TransducerId,
} from '@/lib/circuits/transducer';
import { NTC_BETA } from '@/lib/circuits/sensors';
import { SensorsStateSchema, type SensorsState } from '@/lib/state/schemas';
import { decodePredictFlag, decodeSensorsState, encodeSensorsState } from '@/lib/state/urlState';
import { useUrlFlag, useUrlSyncedState } from '@/lib/state/useUrlState';
import { logEvent } from '@/lib/state/telemetry';
import { useLocalizedQuestions, useMessages } from '@/lib/i18n';
import {
  Field,
  LiveRegion,
  ModuleTabs,
  PlayPauseButton,
  PredictionGate,
  SegmentedControl,
  Slider,
  usePracticeMode,
  usePracticeQuestion,
  useThrottledValue,
} from '@/components/ui';
import { MaterialView } from './MaterialView';
import { EnergyLevels } from './EnergyLevels';
import { DividerCircuit } from './DividerCircuit';
import { SignalTrace } from './SignalTrace';
import { TransferCurves } from './TransferCurves';
import { SignalChain, type ChainStage } from './SignalChain';
import {
  formatCelsius,
  formatLux,
  formatMicroamps,
  formatOhms,
  formatQuantity,
  formatRatio,
  formatResolution,
  formatScientific,
  formatVolts,
} from './format';
import { QUESTIONS } from './questions';

const DEFAULT_STATE = SensorsStateSchema.parse({});
const MODULE_ID = 'sensors';

export function SensorsModule(): React.JSX.Element {
  const predictEnabled = useUrlFlag(decodePredictFlag, true);
  const practiceMode = usePracticeMode();
  const questions = useLocalizedQuestions(QUESTIONS);
  const practiceQuestion = usePracticeQuestion(questions);
  const [state, setState] = useUrlSyncedState(
    decodeSensorsState,
    encodeSensorsState,
    DEFAULT_STATE
  );

  const content = <SensorLab state={state} setState={setState} />;

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

interface LabProps {
  readonly state: SensorsState;
  readonly setState: (updater: (prev: SensorsState) => SensorsState) => void;
}

function SensorLab({ state, setState }: LabProps): React.JSX.Element {
  const t = useMessages().sensors;
  const sensor = state.sensor as TransducerId;
  const color = state.color as LightColor;
  const range = RANGES[sensor];

  // The demo scenario drives the quantity locally (not through the URL, which
  // browsers rate-limit) and commits where it stopped when it ends.
  const [playing, setPlaying] = useState(false);
  const [live, setLive] = useState<number | null>(null);
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let lastSet = -Infinity;
    const start = performance.now();
    const frame = (now: number): void => {
      if (now - lastSet >= 50) {
        lastSet = now;
        setLive(scenarioQuantity(sensor, (now - start) / 1000));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing, sensor]);

  const stored = sensor === 'ldr' ? state.lux : state.temp;
  const quantity = live ?? stored;

  function setQuantity(q: number): void {
    setState((prev) =>
      prev.sensor === 'ldr'
        ? { ...prev, lux: Math.min(range.max, Math.max(range.min, Number(q.toPrecision(3)))) }
        : { ...prev, temp: Math.min(range.max, Math.max(range.min, Math.round(q))) }
    );
  }

  function stop(): void {
    if (live !== null) setQuantity(live);
    setPlaying(false);
    setLive(null);
  }

  function togglePlay(): void {
    if (playing) {
      logEvent(MODULE_ID, 'scenario_stopped', { sensor });
      stop();
    } else {
      logEvent(MODULE_ID, 'scenario_started', { sensor });
      setPlaying(true);
    }
  }

  const reading = useMemo(() => readChain({ sensor, quantity, color }), [sensor, quantity, color]);
  const sweep = useMemo(() => sweepChain(sensor, color), [sensor, color]);
  const maxCurrent = SUPPLY_V / (Math.min(...sweep.resistances) + R_FIXED);

  const celsius = sensor === 'ntc' ? quantity : 25;
  const absorbed = sensor === 'ntc' || isAbsorbed(color);
  const quantityText = formatQuantity(sensor, quantity);
  const binary = reading.code.toString(2).padStart(ADC_BITS, '0');
  const lsb = (SUPPLY_V / ADC_LEVELS) * 1000;
  const alpha = (NTC_BETA / (celsius + 273.15) ** 2) * 100;

  const stages: ChainStage[] = [
    {
      title: t.chain.physical,
      value: quantityText,
      sub:
        sensor === 'ldr'
          ? t.chain.photons(formatScientific(photonRate(quantity)))
          : t.chain.thermal(`${(thermalEnergyEv(quantity) * 1000).toFixed(1)} meV`),
      tone: 'active',
    },
    {
      title: t.chain.material,
      value: formatRatio(reading.carriers),
      sub: absorbed ? t.chain.carriers : t.chain.nothingFreed,
      tone: 'input',
    },
    {
      title: t.chain.resistance,
      value: formatOhms(reading.resistance),
      sub: t.chain.resistanceSub,
      tone: 'active',
    },
    {
      title: t.chain.circuit,
      value: `Vout ${formatVolts(reading.vout)}`,
      sub: `I = ${formatMicroamps(reading.current)}`,
      tone: 'output',
    },
    {
      title: t.chain.digital,
      value: `${reading.code} / ${ADC_LEVELS - 1}`,
      sub: t.chain.lsb(`${lsb.toFixed(2)} mV`),
      tone: 'output',
    },
    {
      title: t.chain.measured,
      value: formatQuantity(sensor, reading.measured),
      sub: t.chain.resolution(formatResolution(sensor, reading.resolution)),
      tone: 'active',
    },
  ];

  const liveText = useThrottledValue(
    t.live(quantityText, formatOhms(reading.resistance), formatVolts(reading.vout), reading.code)
  );

  const ev = photonEnergyEv(color);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Field label={t.sensorLabel}>
          <SegmentedControl
            label={t.sensorLabel}
            value={sensor}
            onChange={(v) => {
              logEvent(MODULE_ID, 'sensor_changed', { sensor: v });
              setPlaying(false);
              setLive(null);
              setState((prev) => ({ ...prev, sensor: v }));
            }}
            options={(['ldr', 'ntc'] as const).map((s) => ({ value: s, label: t.sensors[s] }))}
          />
        </Field>
        <p className="max-w-3xl text-sm text-[var(--foreground)]/75">{t.intro[sensor]}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        {range.log ? (
          <Slider
            id="sensor-quantity"
            label={t.lightLevel}
            value={Math.log10(quantity)}
            min={Math.log10(range.min)}
            max={Math.log10(range.max)}
            step={0.05}
            formatValue={(v) => formatLux(Math.pow(10, v))}
            onChange={(v) => {
              if (playing) stop();
              setQuantity(Math.pow(10, v));
            }}
          />
        ) : (
          <Slider
            id="sensor-quantity"
            label={t.temperature}
            value={quantity}
            min={range.min}
            max={range.max}
            step={1}
            formatValue={(v) => formatCelsius(v, 0)}
            onChange={(v) => {
              if (playing) stop();
              setQuantity(v);
            }}
          />
        )}
        {sensor === 'ldr' && (
          <Field label={t.colorLabel}>
            <SegmentedControl
              label={t.colorLabel}
              value={color}
              onChange={(v) => {
                logEvent(MODULE_ID, 'color_changed', { color: v });
                setState((prev) => ({ ...prev, color: v }));
              }}
              options={LIGHT_COLORS.map((c) => ({ value: c, label: t.colors[c] }))}
            />
          </Field>
        )}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2">
            <PlayPauseButton playing={playing} onToggle={togglePlay} />
            <span className="text-sm text-[var(--foreground)]/75">{t.scenario[sensor]}</span>
          </div>
          <Field label={t.flowLabel}>
            <SegmentedControl
              label={t.flowLabel}
              value={state.flow}
              onChange={(v) => setState((prev) => ({ ...prev, flow: v }))}
              options={[
                { value: 'electron', label: t.flows.electron },
                { value: 'conventional', label: t.flows.conventional },
              ]}
            />
          </Field>
        </div>
      </div>

      <SignalChain label={t.chainTitle} stages={stages} />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">{t.materialTitle}</h2>
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          <MaterialView
            sensor={sensor}
            quantity={quantity}
            color={color}
            carriers={reading.carriers}
            ariaLabel={t.materialAria[sensor](quantityText, formatRatio(reading.carriers))}
            labels={{
              carriers: t.canvas.carriers(formatRatio(reading.carriers)),
              drift: t.canvas.drift,
              conventional: t.canvas.conventional,
              photon: t.canvas.photon(WAVELENGTH_NM[color], ev.toFixed(2), isAbsorbed(color)),
              temperature: formatCelsius(celsius, 0),
            }}
          />
          <div className="flex flex-col gap-2">
            <div className="text-xs text-[var(--foreground)]/70">{t.energyTitle}</div>
            <EnergyLevels sensor={sensor} color={color} celsius={celsius} />
            <p className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--foreground)]/80">
              {sensor === 'ldr'
                ? t.colorInsight[color]
                : t.ntcInsight(
                    (thermalEnergyEv(celsius) * 1000).toFixed(1),
                    NTC_ACTIVATION_EV.toFixed(2),
                    alpha.toFixed(1)
                  )}
            </p>
          </div>
        </div>
        <p className="text-xs text-[var(--foreground)]/60">{t.materialNote}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">{t.circuitTitle}</h2>
        <p className="max-w-3xl text-sm text-[var(--foreground)]/75">{t.circuitNote}</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <DividerCircuit
            sensor={sensor}
            current={reading.current}
            maxCurrent={maxCurrent}
            flow={state.flow}
            ariaLabel={t.circuitAria(
              t.sensorShort[sensor],
              formatOhms(reading.resistance),
              formatVolts(reading.vout),
              reading.code
            )}
            labels={{
              sensorName: t.sensorShort[sensor],
              sensorValue: formatOhms(reading.resistance),
              fixedName: t.fixedName,
              fixedValue: formatOhms(R_FIXED),
              supply: `${SUPPLY_V} V`,
              vout: `Vout ${formatVolts(reading.vout)}`,
              adcTitle: t.adcTitle,
              adcCode: String(reading.code),
              adcBinary: binary,
              flow: state.flow === 'electron' ? t.canvas.electronFlow : t.canvas.conventionalFlow,
              current: t.canvas.current(
                formatMicroamps(reading.current),
                formatScientific(reading.electronsPerSecond)
              ),
            }}
          />
          <div className="flex flex-col gap-1">
            <SignalTrace
              sensor={sensor}
              quantity={quantity}
              vout={reading.vout}
              physicalTitle={t.trace.physical[sensor]}
              electricalTitle={t.trace.electrical}
              timeLabel={t.trace.time}
              ariaLabel={t.trace.aria(quantityText, formatVolts(reading.vout))}
            />
          </div>
        </div>
        <p className="text-xs text-[var(--foreground)]/60">{t.traceNote}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">{t.calibrationTitle}</h2>
        <TransferCurves
          sensor={sensor}
          sweep={sweep}
          quantity={quantity}
          resistance={reading.resistance}
          vout={reading.vout}
          resistanceTitle={t.curves.resistance[sensor]}
          voutTitle={t.curves.vout[sensor]}
          resistanceAria={t.curves.resistanceAria(quantityText, formatOhms(reading.resistance))}
          voutAria={t.curves.voutAria(quantityText, formatVolts(reading.vout))}
        />
        <p className="max-w-3xl text-sm text-[var(--foreground)]/75">{t.calibrationNote}</p>
      </section>

      <LiveRegion text={liveText} />
    </div>
  );
}
