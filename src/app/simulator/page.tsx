import type { Metadata } from 'next';
import { JsonLd, ModuleShell } from '@/components/ui';
import { moduleJsonLd, pageMetadata } from '@/lib/seo';
import SimulatorModule from '@/components/modules/simulator/SimulatorModuleClient';

export const metadata: Metadata = pageMetadata('simulator');

export default function SimulatorPage(): React.JSX.Element {
  return (
    <ModuleShell page="simulator">
      {moduleJsonLd('simulator').map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <SimulatorModule />
    </ModuleShell>
  );
}
