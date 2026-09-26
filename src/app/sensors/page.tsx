import type { Metadata } from 'next';
import { JsonLd, ModuleShell } from '@/components/ui';
import { moduleJsonLd, pageMetadata } from '@/lib/seo';
import SensorsModule from '@/components/modules/sensors/SensorsModuleClient';

export const metadata: Metadata = pageMetadata('sensors');

export default function SensorsPage(): React.JSX.Element {
  return (
    <ModuleShell page="sensors">
      <JsonLd data={moduleJsonLd('sensors')} />
      <SensorsModule />
    </ModuleShell>
  );
}
