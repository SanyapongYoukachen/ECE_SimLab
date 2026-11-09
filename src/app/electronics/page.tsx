import type { Metadata } from 'next';
import { JsonLd, ModuleShell } from '@/components/ui';
import { TopicHub } from '@/components/topics/TopicHub';
import { moduleJsonLd, pageMetadata } from '@/lib/seo';
import { ELECTRONICS_TOPICS } from '@/lib/topics';

export const metadata: Metadata = pageMetadata('electronics');

/** The module's hub: one card per topic page; each topic opens the simulator. */
export default function Page(): React.JSX.Element {
  return (
    <ModuleShell page="electronics">
      <JsonLd data={moduleJsonLd('electronics')} />
      <TopicHub topics={ELECTRONICS_TOPICS} />
    </ModuleShell>
  );
}
