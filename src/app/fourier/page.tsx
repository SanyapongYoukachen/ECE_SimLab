import type { Metadata } from 'next';
import { JsonLd, ModuleShell } from '@/components/ui';
import { moduleJsonLd, pageMetadata } from '@/lib/seo';
import FourierModule from '@/components/modules/fourier/FourierModuleClient';

export const metadata: Metadata = pageMetadata('fourier');

export default function FourierPage(): React.JSX.Element {
  return (
    <ModuleShell page="fourier">
      {moduleJsonLd('fourier').map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <FourierModule />
    </ModuleShell>
  );
}
