import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og/card';

export const alt = 'AC circuits: generator, RMS, power factor & three phase — ECE Labsim';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image(): ReturnType<typeof ogCard> {
  return ogCard({
    kicker: 'ECE Labsim · Module 3',
    title: 'AC circuits: from generator to three phase',
    subtitle: 'A turning coil makes a sine wave; then RMS, power factor, and star and delta.',
  });
}
