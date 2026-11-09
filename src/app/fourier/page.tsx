import type { Metadata } from 'next';
import { JsonLd, ModuleShell } from '@/components/ui';
import { moduleJsonLd, pageMetadata } from '@/lib/seo';
import FourierModule from '@/components/modules/fourier/FourierModuleClient';

export const metadata: Metadata = pageMetadata('fourier');

export default function FourierPage(): React.JSX.Element {
  return (
    <ModuleShell page="fourier">
      <JsonLd data={moduleJsonLd('fourier')} />
      <FourierModule />
    </ModuleShell>
  );
}
