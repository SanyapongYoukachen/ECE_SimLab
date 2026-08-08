import type { Metadata } from 'next';
import { ModuleShell } from '@/components/ui';
import ConvolutionModule from '@/components/modules/convolution/ConvolutionModuleClient';

export const metadata: Metadata = {
  title: 'Convolution — Signals Lab',
  description: 'Watch flip-and-slide convolution happen, sample by sample.',
};

export default function ConvolutionPage(): React.JSX.Element {
  return (
    <ModuleShell
      title="Convolution: flip, slide, multiply, sum"
      tagline="Drag the grey stems to edit the input. Scrub the shift to see the kernel flip and slide underneath it."
    >
      <ConvolutionModule />
    </ModuleShell>
  );
}
