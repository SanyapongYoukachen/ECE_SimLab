import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og/card';

export const alt = 'AC circuits: RMS, phasors & power factor — ECE Labsim';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image(): ReturnType<typeof ogCard> {
  return ogCard({
    kicker: 'ECE Labsim · Module 3',
    title: 'AC circuits: RMS, phasors & power factor',
    subtitle: 'Sine waves and RMS, then RL, RC and RLC loads: leading and lagging current.',
  });
}
