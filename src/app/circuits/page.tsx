import type { Metadata } from 'next';
import { JsonLd, ModuleShell } from '@/components/ui';
import { TopicHub } from '@/components/topics/TopicHub';
import { moduleJsonLd, pageMetadata } from '@/lib/seo';
import { CIRCUIT_TOPICS } from '@/lib/topics';

export const metadata: Metadata = pageMetadata('circuits');

/** The module's hub: one card per topic page; each topic opens the simulator. */
export default function Page(): React.JSX.Element {
  return (
    <ModuleShell page="circuits">
      <JsonLd data={moduleJsonLd('circuits')} />
      <TopicHub topics={CIRCUIT_TOPICS} />
    </ModuleShell>
  );
}
