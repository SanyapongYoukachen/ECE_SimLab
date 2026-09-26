import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og/card';

export const alt = 'Circuit simulators & signal graphs — Signals Lab';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image(): ReturnType<typeof ogCard> {
  return ogCard({
    kicker: 'Signals Lab',
    title: 'Circuit simulators & signal graphs',
    subtitle:
      'Convolution, Fourier transform, AC and DC circuits, and a Wheatstone bridge sensor lab.',
  });
}
