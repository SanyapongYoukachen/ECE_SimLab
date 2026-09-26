import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og/card';

export const alt = 'AC circuits: RMS, phasors & power factor — Signals Lab';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image(): ReturnType<typeof ogCard> {
  return ogCard({
    kicker: 'Signals Lab · Module 3',
    title: 'AC circuits: RMS, phasors & power factor',
    subtitle: 'Sine waves and RMS, then RL, RC and RLC loads: leading and lagging current.',
  });
}
