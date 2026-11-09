import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og/card';

export const alt = 'Electronics: P-N junction, diode, transistor and amplifier — ECE Labsim';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image(): ReturnType<typeof ogCard> {
  return ogCard({
    kicker: 'ECE Labsim · Module 7',
    title: 'Electronics: from P-N junction to amplifier',
    subtitle:
      'Depletion regions, diode curves and LEDs, transistor regions, and a working amplifier.',
  });
}
