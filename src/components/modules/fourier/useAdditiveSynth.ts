'use client';

import { useEffect, useRef } from 'react';

export interface ToneComponent {
  readonly amp: number;
  readonly freq: number;
}

/**
 * Live additive synthesis: one oscillator + gain per component, connected to
 * a master gain. Frequencies/amplitudes are updated in place via the Web
 * Audio API's own scheduling (setTargetAtTime) so dragging a slider retunes
 * the tone smoothly instead of restarting playback.
 */
export function useAdditiveSynth(components: readonly ToneComponent[], playing: boolean): void {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscsRef = useRef<OscillatorNode[]>([]);
  const gainsRef = useRef<GainNode[]>([]);

  useEffect(() => {
    if (!playing) return;

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);
    master.gain.setTargetAtTime(0.2, ctx.currentTime, 0.02);

    const oscs: OscillatorNode[] = [];
    const gains: GainNode[] = [];
    for (const c of components) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = Math.max(1, c.freq);
      const gain = ctx.createGain();
      gain.gain.value = c.amp;
      osc.connect(gain).connect(master);
      osc.start();
      oscs.push(osc);
      gains.push(gain);
    }
    oscsRef.current = oscs;
    gainsRef.current = gains;

    return () => {
      const stopTime = ctx.currentTime;
      master.gain.setTargetAtTime(0, stopTime, 0.02);
      window.setTimeout(() => {
        for (const osc of oscs) {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // already stopped
          }
        }
        for (const gain of gains) gain.disconnect();
        master.disconnect();
        void ctx.close();
      }, 100);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx || !playing) return;
    components.forEach((c, i) => {
      oscsRef.current[i]?.frequency.setTargetAtTime(Math.max(1, c.freq), ctx.currentTime, 0.015);
      gainsRef.current[i]?.gain.setTargetAtTime(c.amp, ctx.currentTime, 0.015);
    });
  }, [components, playing]);
}
