import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og/card';

export const alt = 'Convolution visualizer — Signals Lab';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image(): ReturnType<typeof ogCard> {
  return ogCard({
    kicker: 'Signals Lab · Module 1',
    title: 'Convolution visualizer',
    subtitle: 'Watch the kernel flip, slide, multiply and sum, one sample at a time.',
  });
}
