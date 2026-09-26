import type { Metadata } from 'next';
import { JsonLd, ModuleShell } from '@/components/ui';
import { moduleJsonLd, pageMetadata } from '@/lib/seo';
import ConvolutionModule from '@/components/modules/convolution/ConvolutionModuleClient';

export const metadata: Metadata = pageMetadata('convolution');

export default function ConvolutionPage(): React.JSX.Element {
  return (
    <ModuleShell page="convolution">
      <JsonLd data={moduleJsonLd('convolution')} />
      <ConvolutionModule />
    </ModuleShell>
  );
}
