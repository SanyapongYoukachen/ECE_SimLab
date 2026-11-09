import type { Metadata } from 'next';
import { JsonLd, ModuleShell } from '@/components/ui';
import { moduleJsonLd, pageMetadata } from '@/lib/seo';
import ActuatorsModule from '@/components/modules/actuators/ActuatorsModuleClient';

export const metadata: Metadata = pageMetadata('actuators');

export default function ActuatorsPage(): React.JSX.Element {
  return (
    <ModuleShell page="actuators">
      <JsonLd data={moduleJsonLd('actuators')} />
      <ActuatorsModule />
    </ModuleShell>
  );
}
