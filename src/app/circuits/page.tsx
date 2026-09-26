import type { Metadata } from 'next';
import { JsonLd, ModuleShell } from '@/components/ui';
import { moduleJsonLd, pageMetadata } from '@/lib/seo';
import CircuitsModule from '@/components/modules/circuits/CircuitsModuleClient';

export const metadata: Metadata = pageMetadata('circuits');

export default function CircuitsPage(): React.JSX.Element {
  return (
    <ModuleShell page="circuits">
      <JsonLd data={moduleJsonLd('circuits')} />
      <CircuitsModule />
    </ModuleShell>
  );
}
