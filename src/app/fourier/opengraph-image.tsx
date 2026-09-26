import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og/card';

export const alt = 'Fourier transform & FFT explorer — Signals Lab';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image(): ReturnType<typeof ogCard> {
  return ogCard({
    kicker: 'Signals Lab · Module 2',
    title: 'Fourier transform & FFT explorer',
    subtitle: 'A signal graph and its spectrum side by side: leakage, bins and windows.',
  });
}
