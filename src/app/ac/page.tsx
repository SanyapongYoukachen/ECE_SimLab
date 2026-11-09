import type { Metadata } from 'next';
import { JsonLd, ModuleShell } from '@/components/ui';
import { TopicHub } from '@/components/topics/TopicHub';
import { moduleJsonLd, pageMetadata } from '@/lib/seo';
import { AC_TOPICS } from '@/lib/topics';

export const metadata: Metadata = pageMetadata('ac');

/** The module's hub: one card per topic page; each topic opens the simulator. */
export default function Page(): React.JSX.Element {
  return (
    <ModuleShell page="ac">
      <JsonLd data={moduleJsonLd('ac')} />
      <TopicHub topics={AC_TOPICS} />
    </ModuleShell>
  );
}
