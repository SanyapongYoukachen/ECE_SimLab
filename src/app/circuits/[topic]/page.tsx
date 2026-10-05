import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TopicPage } from '@/components/topics/TopicPage';
import CircuitsModule from '@/components/modules/circuits/CircuitsModuleClient';
import { topicMetadata } from '@/lib/seo';
import { CIRCUIT_TOPICS, findTopic } from '@/lib/topics';
import type { CircuitMode } from '@/lib/state/schemas';

interface Props {
  readonly params: Promise<{ topic: string }>;
}

// Only the known topics exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams(): { topic: string }[] {
  return CIRCUIT_TOPICS.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topic = findTopic('circuits', (await params).topic);
  return topic ? topicMetadata(topic) : {};
}

export default async function Page({ params }: Props): Promise<React.JSX.Element> {
  const topic = findTopic('circuits', (await params).topic);
  if (!topic) notFound();
  return (
    <TopicPage topic={topic}>
      <CircuitsModule topic={topic.mode as CircuitMode} />
    </TopicPage>
  );
}
