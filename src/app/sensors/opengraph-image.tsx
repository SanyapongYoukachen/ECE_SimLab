import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og/card';

export const alt = 'How sensors work: LDR and thermistor, from physics to signal — Signals Lab';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image(): ReturnType<typeof ogCard> {
  return ogCard({
    kicker: 'Signals Lab · Module 5',
    title: 'Sensors: from physics to signal',
    subtitle: 'Photons and heat free electrons; a divider and an ADC turn that into a measurement.',
  });
}
