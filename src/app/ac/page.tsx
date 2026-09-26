import type { Metadata } from 'next';
import { JsonLd, ModuleShell } from '@/components/ui';
import { moduleJsonLd, pageMetadata } from '@/lib/seo';
import AcModule from '@/components/modules/ac/AcModuleClient';

export const metadata: Metadata = pageMetadata('ac');

export default function AcPage(): React.JSX.Element {
  return (
    <ModuleShell page="ac">
      <JsonLd data={moduleJsonLd('ac')} />
      <AcModule />
    </ModuleShell>
  );
}
