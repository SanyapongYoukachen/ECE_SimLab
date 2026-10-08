import type { NextConfig } from 'next';

/**
 * Module sections used to be `?mode=` on the module page; each now has its
 * own topic page (src/lib/topics). Old links and bookmarks redirect there.
 * Kept in step with the topic registry by e2e/topics.spec.ts.
 */
const SECTION_PAGES: readonly { module: string; mode: string; slug: string }[] = [
  { module: 'ac', mode: 'generator', slug: 'generator' },
  { module: 'ac', mode: 'sine', slug: 'sine-wave-rms' },
  { module: 'ac', mode: 'load', slug: 'rlc-power-factor' },
  { module: 'ac', mode: 'threephase', slug: 'three-phase' },
  { module: 'circuits', mode: 'ohm', slug: 'ohms-law' },
  { module: 'circuits', mode: 'network', slug: 'series-parallel' },
  { module: 'circuits', mode: 'divider', slug: 'voltage-divider' },
  { module: 'circuits', mode: 'thevenin', slug: 'thevenin-norton' },
  { module: 'circuits', mode: 'mesh', slug: 'mesh-nodal-analysis' },
  { module: 'electronics', mode: 'pn', slug: 'pn-junction' },
  { module: 'electronics', mode: 'diode', slug: 'diode' },
  { module: 'electronics', mode: 'bjt', slug: 'bjt' },
  { module: 'electronics', mode: 'amp', slug: 'amplifier' },
];

const nextConfig: NextConfig = {
  redirects() {
    return [
      // Module 3 was the convolution theorem until it became AC circuits;
      // keep old bookmarks and shared links working.
      { source: '/theorem', destination: '/ac', permanent: true },
      ...SECTION_PAGES.map(({ module, mode, slug }) => ({
        source: `/${module}`,
        has: [{ type: 'query' as const, key: 'mode', value: mode }],
        destination: `/${module}/${slug}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
