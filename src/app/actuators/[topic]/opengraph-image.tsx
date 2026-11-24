import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og/card';
import { findTopic } from '@/lib/topics';

export const alt = 'Actuators topic — ECE Labsim';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  readonly params: Promise<{ topic: string }>;
}): Promise<ReturnType<typeof ogCard>> {
  const topic = findTopic('actuators', (await params).topic);
  return ogCard({
    kicker: 'ECE Labsim · Actuators',
    title: topic?.text.en.h1 ?? 'Actuators',
    subtitle: topic?.text.en.card ?? '',
  });
}
