import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og/card';

export const alt = 'Wheatstone bridge circuit simulator — Signals Lab';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image(): ReturnType<typeof ogCard> {
  return ogCard({
    kicker: 'Signals Lab · Module 6',
    title: 'Wheatstone bridge circuit simulator',
    subtitle: 'Animated current flow; quarter, half and full bridges with real sensors.',
  });
}
