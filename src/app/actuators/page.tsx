import type { Metadata } from 'next';
import { JsonLd, ModuleShell } from '@/components/ui';
import { TopicHub } from '@/components/topics/TopicHub';
import { moduleJsonLd, pageMetadata } from '@/lib/seo';
import { ACTUATOR_TOPICS } from '@/lib/topics';

export const metadata: Metadata = pageMetadata('actuators');

/** The module's hub: one card per topic page; each topic opens the simulator. */
export default function Page(): React.JSX.Element {
  return (
    <ModuleShell page="actuators">
      {moduleJsonLd('actuators').map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <TopicHub topics={ACTUATOR_TOPICS} />
    </ModuleShell>
  );
}
