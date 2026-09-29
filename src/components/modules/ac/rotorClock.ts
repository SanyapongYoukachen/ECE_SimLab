'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TURN_SECONDS } from './clock';

/**
 * The generator's own clock: unlike the rest of the AC module it can be
 * paused and scrubbed (drag the rotor), so every canvas reads the electrical
 * angle from this one object instead of from performance.now() directly.
 * It stays a pure function of time — angle = base + ω·(now − t0) while
 * playing — so any number of canvases can read it without drifting apart.
 */
interface ClockState {
  base: number;
  t0: number;
  /** Advancing right now: playing, turning (rpm > 0) and motion allowed. */
  running: boolean;
}

export interface RotorClock {
  /** Electrical angle θe (radians, unbounded) right now. */
  readonly angle: () => number;
  readonly playing: boolean;
  readonly toggle: () => void;
  /** Jump to an angle (pauses). */
  readonly setAngle: (theta: number) => void;
  readonly step: (delta: number) => void;
  /** Bumps on every manual move, so still (reduced-motion) frames know to redraw. */
  readonly version: number;
}

/** One electrical turn per TURN_SECONDS, like the other AC animations; frozen when `moving` is false. */
export function useRotorClock(moving: boolean, reducedMotion: boolean): RotorClock {
  const state = useRef<ClockState>({ base: (136 * Math.PI) / 180, t0: 0, running: false });
  const [playing, setPlaying] = useState(true);
  const [version, setVersion] = useState(0);
  const rate = (2 * Math.PI) / TURN_SECONDS;
  const running = playing && moving && !reducedMotion;

  const angle = useCallback((): number => {
    const s = state.current;
    return s.running ? s.base + ((performance.now() - s.t0) / 1000) * rate : s.base;
  }, [rate]);

  // Re-anchor whenever it starts or stops, so the angle carries on from where it was.
  useEffect(() => {
    const s = state.current;
    s.base = angle();
    s.t0 = performance.now();
    s.running = running;
  }, [running, angle]);

  const toggle = useCallback((): void => setPlaying((p) => !p), []);

  const setAngle = useCallback((theta: number): void => {
    const s = state.current;
    s.base = theta;
    s.t0 = performance.now();
    s.running = false;
    setPlaying(false);
    setVersion((v) => v + 1);
  }, []);

  const step = useCallback(
    (delta: number): void => {
      setAngle(angle() + delta);
    },
    [angle, setAngle]
  );

  return { angle, playing, toggle, setAngle, step, version };
}
