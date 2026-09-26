'use client';

import {
  LDR_BANDGAP_EV,
  NTC_ACTIVATION_EV,
  RANGES,
  isAbsorbed,
  photonEnergyEv,
  thermalEnergyEv,
  type LightColor,
  type TransducerId,
} from '@/lib/circuits/transducer';
import { useMessages } from '@/lib/i18n';
import { heatColor, PHOTON_COLOR } from './colors';

interface Props {
  readonly sensor: TransducerId;
  readonly color: LightColor;
  readonly celsius: number;
}

const W = 260;
const H = 226;
const BAND_X = 20;
const BAND_W = 150;

/**
 * The energy picture behind the animation. LDR: a photon lifts an electron
 * across the band gap only if hν ≥ Eg. Thermistor: electrons sit Ea below
 * the conduction band, and the thermal energy kT that could lift them is a
 * small fraction of that gap — hence the exponential.
 */
export function EnergyLevels({ sensor, color, celsius }: Props): React.JSX.Element {
  const t = useMessages().sensors.energy;
  const cbBottom = 52;

  if (sensor === 'ldr') {
    // Scale: the 1.8 eV gap spans 100 px.
    const pxPerEv = 100 / LDR_BANDGAP_EV;
    const vbTop = cbBottom + LDR_BANDGAP_EV * pxPerEv;
    const ev = photonEnergyEv(color);
    const ok = isAbsorbed(color);
    const arrowTop = vbTop - ev * pxPerEv;
    const ax = BAND_X + BAND_W * 0.55;
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[300px]"
        role="img"
        aria-label={t.ldrAria(ev.toFixed(2), ok)}
      >
        <rect
          x={BAND_X}
          y={14}
          width={BAND_W}
          height={cbBottom - 14}
          fill="var(--plot-input)"
          opacity={0.14}
        />
        <text x={BAND_X + 6} y={28} fontSize={11} fill="var(--plot-text)">
          {t.cb}
        </text>
        <rect
          x={BAND_X}
          y={vbTop}
          width={BAND_W}
          height={40}
          fill="var(--plot-structure)"
          opacity={0.25}
        />
        <text x={BAND_X + 6} y={vbTop + 30} fontSize={11} fill="var(--plot-text)">
          {t.vb}
        </text>
        {/* gap bracket */}
        <line
          x1={BAND_X + BAND_W + 10}
          y1={cbBottom}
          x2={BAND_X + BAND_W + 10}
          y2={vbTop}
          stroke="var(--plot-structure)"
        />
        <text
          x={BAND_X + BAND_W + 16}
          y={(cbBottom + vbTop) / 2 + 4}
          fontSize={11}
          fill="var(--plot-text)"
        >
          Eg {LDR_BANDGAP_EV} eV
        </text>
        {/* photon energy arrow from the valence band */}
        <line
          x1={ax}
          y1={vbTop}
          x2={ax}
          y2={arrowTop + 6}
          stroke={PHOTON_COLOR[color]}
          strokeWidth={3}
          strokeDasharray={color === 'ir' ? '4 3' : undefined}
        />
        <polygon
          points={`${ax},${arrowTop} ${ax - 6},${arrowTop + 9} ${ax + 6},${arrowTop + 9}`}
          fill={PHOTON_COLOR[color]}
        />
        <text
          x={ax - 8}
          y={(vbTop + arrowTop) / 2 + 4}
          fontSize={11}
          textAnchor="end"
          fill={PHOTON_COLOR[color]}
        >
          hν {ev.toFixed(2)} eV
        </text>
        {ok ? (
          <>
            <circle cx={ax + 18} cy={cbBottom - 12} r={5} fill="var(--plot-input)" />
            <text x={ax + 28} y={cbBottom - 8} fontSize={11} fill="var(--plot-input)">
              e⁻
            </text>
            <circle
              cx={ax + 18}
              cy={vbTop + 8}
              r={5}
              fill="none"
              stroke="var(--plot-danger)"
              strokeWidth={1.5}
            />
            <text x={ax + 28} y={vbTop + 12} fontSize={11} fill="var(--plot-danger)">
              {t.hole}
            </text>
          </>
        ) : (
          <text x={ax + 12} y={arrowTop + 4} fontSize={13} fill="var(--plot-danger)">
            ✗
          </text>
        )}
        <text x={BAND_X} y={H - 8} fontSize={11} fill="var(--plot-text)">
          {ok ? t.absorbed : t.notAbsorbed}
        </text>
      </svg>
    );
  }

  // Thermistor: Ea = 0.34 eV spans 110 px; kT is drawn to the same scale.
  const pxPerEv = 110 / NTC_ACTIVATION_EV;
  const levelY = cbBottom + NTC_ACTIVATION_EV * pxPerEv;
  const kt = thermalEnergyEv(celsius);
  const frac = (celsius - RANGES.ntc.min) / (RANGES.ntc.max - RANGES.ntc.min);
  const ax = BAND_X + BAND_W * 0.5;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full max-w-[300px]"
      role="img"
      aria-label={t.ntcAria((kt * 1000).toFixed(1), NTC_ACTIVATION_EV.toFixed(2))}
    >
      <rect
        x={BAND_X}
        y={14}
        width={BAND_W}
        height={cbBottom - 14}
        fill="var(--plot-input)"
        opacity={0.14}
      />
      <text x={BAND_X + 6} y={28} fontSize={11} fill="var(--plot-text)">
        {t.cb}
      </text>
      <line
        x1={BAND_X}
        y1={levelY}
        x2={BAND_X + BAND_W}
        y2={levelY}
        stroke="var(--plot-structure)"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
      {[0.12, 0.3, 0.7, 0.88].map((f) => (
        <circle
          key={f}
          cx={BAND_X + BAND_W * f}
          cy={levelY - 6}
          r={4.5}
          fill="var(--plot-input)"
          opacity={0.8}
        />
      ))}
      <text x={BAND_X + 6} y={levelY + 18} fontSize={11} fill="var(--plot-text)">
        {t.bound}
      </text>
      <line
        x1={BAND_X + BAND_W + 10}
        y1={cbBottom}
        x2={BAND_X + BAND_W + 10}
        y2={levelY}
        stroke="var(--plot-structure)"
      />
      <text
        x={BAND_X + BAND_W + 16}
        y={(cbBottom + levelY) / 2 + 4}
        fontSize={11}
        fill="var(--plot-text)"
      >
        Ea {NTC_ACTIVATION_EV.toFixed(2)} eV
      </text>
      {/* kT: the typical thermal kick, to scale */}
      <rect
        x={ax - 5}
        y={levelY - kt * pxPerEv}
        width={10}
        height={kt * pxPerEv}
        fill={heatColor(frac)}
      />
      <text x={ax + 10} y={levelY - kt * pxPerEv - 4} fontSize={11} fill="var(--plot-text)">
        kT {(kt * 1000).toFixed(1)} meV
      </text>
      <text x={BAND_X} y={H - 28} fontSize={11} fill="var(--plot-text)">
        {t.ratio((NTC_ACTIVATION_EV / kt).toFixed(1))}
      </text>
      <text x={BAND_X} y={H - 12} fontSize={11} fill="var(--plot-text)">
        {t.tail}
      </text>
    </svg>
  );
}
