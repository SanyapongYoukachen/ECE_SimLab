'use client';

import { useMemo } from 'react';
import { balancingR4, solveWheatstoneBridge } from '@/lib/circuits/wheatstone';
import {
  BRIDGE_ARMS,
  SENSORS,
  SENSOR_IDS,
  bridgeSweep,
  quarterBridgeArms,
  referenceResistance,
  type BridgeArm,
  type SensorId,
} from '@/lib/circuits/sensors';
import { WheatstoneStateSchema, type WheatstoneState } from '@/lib/state/schemas';
import {
  decodeWheatstoneState,
  encodeWheatstoneState,
  decodePredictFlag,
} from '@/lib/state/urlState';
import { useUrlSyncedState, useUrlFlag } from '@/lib/state/useUrlState';
import { logEvent } from '@/lib/state/telemetry';
import { useLocalizedQuestions, useMessages } from '@/lib/i18n';
import {
  PredictionCheck,
  PredictionGate,
  SegmentedControl,
  Slider,
  ExpressionReadout,
  LiveRegion,
  usePracticeMode,
  usePracticeQuestion,
  useThrottledValue,
} from '@/components/ui';
import { WheatstoneSchematic } from './WheatstoneSchematic';
import { SensorIllustration } from './SensorIllustration';
import { SensorResponse } from './SensorResponse';
import {
  formatBridgeVoltage,
  formatCurrent,
  formatQuantity,
  formatResistance,
  formatSensorResistance,
  formatVoltage,
} from './format';
import { QUESTIONS } from './questions';

const DEFAULT_STATE = WheatstoneStateSchema.parse({});
const MIN_R = 10;
const MAX_R = 2200;
/** Free mode's fixed needle scale (see galvanometerDeflection). */
const FREE_NEEDLE_SENSITIVITY = 2e-3;

type ResistorField = 'r1' | 'r2' | 'r3' | 'r4' | 'rg';
type BridgeMode = WheatstoneState['mode'];

/** Which URL/state field holds each sensor's own reading. */
const QUANTITY_FIELD = {
  ldr: 'lux',
  ntc: 'ntc',
  rtd: 'rtd',
  strain: 'strain',
  pot: 'pot',
} as const satisfies Record<SensorId, keyof WheatstoneState>;

export function WheatstoneBridge(): React.JSX.Element {
  const predictEnabled = useUrlFlag(decodePredictFlag, true);
  const practiceMode = usePracticeMode();
  const common = useMessages().common;
  const t = useMessages().simulator.wheatstone;
  const questions = useLocalizedQuestions(QUESTIONS);
  const practiceQuestion = usePracticeQuestion(questions);
  const [state, setState] = useUrlSyncedState(
    decodeWheatstoneState,
    encodeWheatstoneState,
    DEFAULT_STATE
  );

  const sensing = state.mode === 'sensing';
  const sensor = SENSORS[state.sensor];
  const quantity = state[QUANTITY_FIELD[state.sensor]];

  // Sensing mode is a quarter bridge: the chosen arm follows the sensor, the
  // other three are pinned to its reference resistance. Free mode uses the sliders.
  const arms = useMemo(
    () =>
      sensing
        ? quarterBridgeArms(sensor, state.arm, quantity)
        : { r1: state.r1, r2: state.r2, r3: state.r3, r4: state.r4 },
    [sensing, sensor, state.arm, quantity, state.r1, state.r2, state.r3, state.r4]
  );

  const result = useMemo(
    () => solveWheatstoneBridge(state.voltage, arms.r1, arms.r2, arms.r3, arms.r4, state.rg),
    [state.voltage, arms, state.rg]
  );

  const sweep = useMemo(
    () => (sensing ? bridgeSweep(sensor, state.arm, state.voltage, state.rg) : null),
    [sensing, sensor, state.arm, state.voltage, state.rg]
  );
  // Auto-ranged meter: the needle nearly pins at the sensor's range extremes,
  // so a strain gauge's microamps swing it as visibly as an LDR's milliamps.
  const needleSensitivity =
    sweep && sweep.maxCurrent > 0 ? sweep.maxCurrent / 2.5 : FREE_NEEDLE_SENSITIVITY;

  function setResistor(field: ResistorField, value: number): void {
    setState((prev) => ({ ...prev, [field]: value }));
  }

  function setMode(mode: BridgeMode): void {
    logEvent('simulator-wheatstone', 'mode_changed', { mode });
    setState((prev) => ({ ...prev, mode }));
  }

  function setSensor(next: SensorId): void {
    logEvent('simulator-wheatstone', 'sensor_changed', { sensor: next });
    setState((prev) => ({ ...prev, sensor: next }));
  }

  function setArm(arm: BridgeArm): void {
    logEvent('simulator-wheatstone', 'sensor_arm_changed', { arm });
    setState((prev) => ({ ...prev, arm }));
  }

  function setQuantity(value: number): void {
    setState((prev) => ({ ...prev, [QUANTITY_FIELD[prev.sensor]]: value }));
  }

  const targetR4 = balancingR4(state.r1, state.r2, state.r3);
  const balanceReachable = targetR4 >= MIN_R && targetR4 <= MAX_R;

  function balanceBridge(): void {
    if (!balanceReachable) return;
    logEvent('simulator-wheatstone', 'balance_clicked', { r4: targetR4 });
    setState((prev) => ({ ...prev, r4: targetR4 }));
  }

  const balanceSign = result.balanced ? '=' : '≠';
  // Sensing compares ratios: the products of a 10 kΩ bridge are 10⁸ Ω², and
  // a strain gauge's 0.2 % change needs the extra digits a ratio gives.
  const expression = sensing
    ? `R1/R2 = ${(result.r1 / result.r2).toFixed(4)}  ${balanceSign}  R3/R4 = ${(
        result.r3 / result.r4
      ).toFixed(4)}`
    : `R1·R4 = ${formatResistance(result.r1 * result.r4)}  ${balanceSign}  R2·R3 = ${formatResistance(
        result.r2 * result.r3
      )}`;
  const liveText = useThrottledValue(t.liveText(result.balanced, formatCurrent(result.ig)));
  const reference = formatQuantity(state.sensor, sensor.reference);

  const content = (
    <div className="flex flex-col gap-4">
      <Field label={t.modeLabel}>
        <SegmentedControl
          label={t.modeLabel}
          value={state.mode}
          onChange={setMode}
          options={[
            { value: 'free', label: t.modes.free },
            { value: 'sensing', label: t.modes.sensing },
          ]}
        />
      </Field>

      {sensing && (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
          <Field label={t.sensorLabel}>
            <SegmentedControl
              label={t.sensorLabel}
              value={state.sensor}
              onChange={setSensor}
              options={SENSOR_IDS.map((id) => ({ value: id, label: t.sensors[id].name }))}
            />
          </Field>
          <Field label={t.armLabel}>
            <SegmentedControl
              label={t.armLabel}
              value={state.arm}
              onChange={setArm}
              options={BRIDGE_ARMS.map((arm) => ({ value: arm, label: arm.toUpperCase() }))}
            />
          </Field>
        </div>
      )}

      <WheatstoneSchematic
        result={result}
        sensing={sensing ? { arm: state.arm, sensor: state.sensor } : undefined}
        needleSensitivity={needleSensitivity}
      />

      {sensing && sweep && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <SensorIllustration sensor={state.sensor} quantity={quantity} />
            <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
              {sensor.logQuantity ? (
                <Slider
                  id="wheatstone-sensor-quantity"
                  label={t.sensors[state.sensor].quantity}
                  value={Math.log10(quantity)}
                  min={Math.log10(sensor.min)}
                  max={Math.log10(sensor.max)}
                  step={sensor.step}
                  formatValue={(v) => formatQuantity(state.sensor, Math.pow(10, v))}
                  onChange={(v) => setQuantity(Number(Math.pow(10, v).toPrecision(3)))}
                />
              ) : (
                <Slider
                  id="wheatstone-sensor-quantity"
                  label={t.sensors[state.sensor].quantity}
                  value={quantity}
                  min={sensor.min}
                  max={sensor.max}
                  step={sensor.step}
                  formatValue={(v) => formatQuantity(state.sensor, v)}
                  onChange={setQuantity}
                />
              )}
              <div>
                <button
                  type="button"
                  onClick={() => setQuantity(sensor.reference)}
                  disabled={quantity === sensor.reference}
                  className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  {t.resetReference(reference)}
                </button>
              </div>
            </div>
          </div>
          <SensorResponse
            sensor={state.sensor}
            quantity={quantity}
            resistance={sensor.resistance(quantity)}
            output={result.vb - result.vc}
            sweep={sweep}
          />
        </div>
      )}

      <ExpressionReadout label={sensing ? t.balanceRatio : t.balanceCondition}>
        {expression}
      </ExpressionReadout>

      {sensing && sweep ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label={t.sensorR} value={formatSensorResistance(sensor.resistance(quantity))} />
          <Stat label={t.fixedR} value={formatSensorResistance(referenceResistance(sensor))} />
          <Stat label={t.bridgeOut} value={formatBridgeVoltage(result.vb - result.vc)} />
          <Stat label={t.ig} value={formatCurrent(result.ig)} />
          <Stat label={t.meterRange} value={`±${formatCurrent(sweep.maxCurrent)}`} />
          <Stat label={t.balancedQ} value={result.balanced ? common.yes : common.no} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label={t.ig} value={formatCurrent(result.ig)} />
          <Stat label={t.vb} value={formatVoltage(result.vb)} />
          <Stat label={t.vc} value={formatVoltage(result.vc)} />
          <Stat label={t.vbc} value={formatVoltage(result.vb - result.vc)} />
          <Stat label={t.r4Balance} value={formatResistance(targetR4)} />
          <Stat label={t.balancedQ} value={result.balanced ? common.yes : common.no} />
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        <Slider
          label={t.sourceVoltage}
          value={state.voltage}
          min={0}
          max={24}
          step={0.5}
          formatValue={(v) => `${v.toFixed(1)} V`}
          onChange={(voltage) => setState((prev) => ({ ...prev, voltage }))}
        />
        {!sensing && (
          <>
            <Slider
              label="R1"
              value={state.r1}
              min={MIN_R}
              max={MAX_R}
              step={10}
              formatValue={formatResistance}
              onChange={(v) => setResistor('r1', v)}
            />
            <Slider
              label="R2"
              value={state.r2}
              min={MIN_R}
              max={MAX_R}
              step={10}
              formatValue={formatResistance}
              onChange={(v) => setResistor('r2', v)}
            />
            <Slider
              label="R3"
              value={state.r3}
              min={MIN_R}
              max={MAX_R}
              step={10}
              formatValue={formatResistance}
              onChange={(v) => setResistor('r3', v)}
            />
            <Slider
              label={t.r4}
              value={state.r4}
              min={MIN_R}
              max={MAX_R}
              step={10}
              formatValue={formatResistance}
              onChange={(v) => setResistor('r4', v)}
            />
          </>
        )}
        <Slider
          label={t.rg}
          value={state.rg}
          min={MIN_R}
          max={MAX_R}
          step={10}
          formatValue={formatResistance}
          onChange={(v) => setResistor('rg', v)}
        />
        {sensing ? (
          <div className="flex flex-col gap-1 text-xs text-[var(--foreground)]/70">
            <p>{t.referenceNote(reference, formatSensorResistance(referenceResistance(sensor)))}</p>
            <p>{t.armNote}</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={balanceBridge}
              disabled={!balanceReachable}
              aria-describedby={balanceReachable ? undefined : 'wheatstone-balance-hint'}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
            >
              {t.balanceButton}
            </button>
            {!balanceReachable && (
              <p id="wheatstone-balance-hint" className="text-xs text-[var(--foreground)]/70">
                {t.balanceHint(
                  formatResistance(targetR4),
                  formatResistance(MIN_R),
                  formatResistance(MAX_R)
                )}
              </p>
            )}
          </div>
        )}
      </div>

      {sensing && (
        <p className="text-sm text-[var(--foreground)]/70">{t.sensors[state.sensor].how}</p>
      )}

      {!practiceMode && (
        <PredictionCheck
          moduleId="simulator-wheatstone"
          disabled={!predictEnabled}
          questions={questions}
        />
      )}

      <LiveRegion text={liveText} />
    </div>
  );

  if (!practiceMode) return content;

  return (
    <PredictionGate
      moduleId="simulator-wheatstone"
      disabled={!predictEnabled}
      question={practiceQuestion.question}
      options={practiceQuestion.options}
      persist={false}
    >
      {content}
    </PredictionGate>
  );
}

function Field({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[var(--foreground)]/60" aria-hidden="true">
        {label}
      </span>
      {children}
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
