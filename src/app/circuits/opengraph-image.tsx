import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og/card';

export const alt = "DC circuits: Ohm's law & voltage divider — Signals Lab";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image(): ReturnType<typeof ogCard> {
  return ogCard({
    kicker: 'Signals Lab · Module 4',
    title: "DC circuits: Ohm's law & voltage divider",
    subtitle: 'Drag V and R; the schematic, I-V graph and power respond together.',
  });
}
