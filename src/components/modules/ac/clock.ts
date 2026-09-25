/**
 * One visual clock for every AC canvas. Each AnimatedCanvas runs its own
 * requestAnimationFrame loop with its own start time, so reading the shared
 * performance.now() (not each loop's `phase`) keeps the rotating phasor and
 * the time plots' cursor in step. Real mains turns 50 times a second; the
 * animation turns once every TURN_SECONDS, whatever the frequency.
 */
export const TURN_SECONDS = 2;

/** The phasor angle (radians) right now; a fixed, readable still under reduced motion. */
export function animationAngle(reducedMotion: boolean): number {
  if (reducedMotion) return Math.PI / 3;
  return ((performance.now() / 1000) * 2 * Math.PI) / TURN_SECONDS;
}

/** The time plots show two periods; the cursor sweeps them once per two turns. */
export function cursorTime(angle: number, period: number): number {
  const turns = angle / (2 * Math.PI);
  return (turns - 2 * Math.floor(turns / 2)) * period;
}
