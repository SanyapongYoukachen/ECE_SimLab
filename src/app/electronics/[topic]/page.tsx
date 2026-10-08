import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TopicPage } from '@/components/topics/TopicPage';
import ElectronicsModule from '@/components/modules/electronics/ElectronicsModuleClient';
import { topicMetadata } from '@/lib/seo';
import { ELECTRONICS_TOPICS, findTopic } from '@/lib/topics';
import type { ElectronicsState } from '@/lib/state/schemas';

interface Props {
  readonly params: Promise<{ topic: string }>;
}

// Only the known topics exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams(): { topic: string }[] {
  return ELECTRONICS_TOPICS.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topic = findTopic('electronics', (await params).topic);
  return topic ? topicMetadata(topic) : {};
}

export default async function Page({ params }: Props): Promise<React.JSX.Element> {
  const topic = findTopic('electronics', (await params).topic);
  if (!topic) notFound();
  return (
    <TopicPage topic={topic}>
      <ElectronicsModule topic={topic.mode as ElectronicsState['mode']} />
    </TopicPage>
  );
}
