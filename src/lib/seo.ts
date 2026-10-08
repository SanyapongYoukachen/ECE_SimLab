import type { Metadata } from 'next';
import { topicPath, type Topic } from '@/lib/topics';
import { MESSAGES } from '@/lib/i18n/messages';

/**
 * Search metadata for every page, in one place. Titles and descriptions
 * target the specific queries students type for coursework ("Wheatstone
 * bridge simulator", "convolution visualizer", "power factor phasor") rather
 * than only head terms like "circuit simulator", where established tools
 * (CircuitLab, EveryCircuit, PhET, Falstad) dominate.
 *
 * The site URL comes from NEXT_PUBLIC_SITE_URL so a custom domain needs no
 * code change; the default is the production Vercel deployment.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ece-sim-lab.vercel.app'
).replace(/\/$/, '');
export const SITE_NAME = 'ECE Labsim';

export type SeoPage =
  'home' | 'convolution' | 'fourier' | 'ac' | 'circuits' | 'sensors' | 'simulator';

interface PageSeo {
  readonly path: string;
  /** ≤ ~60 characters with the " | ECE Labsim" suffix where possible. */
  readonly title: string;
  /** ~150–160 characters: what a student gets, in the words they search with. */
  readonly description: string;
  readonly keywords: readonly string[];
  /** Concepts for schema.org `teaches`. */
  readonly teaches: readonly string[];
  /** Priority hint for the sitemap. */
  readonly priority: number;
}

export const SEO: Readonly<Record<SeoPage, PageSeo>> = {
  home: {
    path: '/',
    title: 'ECE Labsim — Interactive Circuit Simulator & Signal Graphs',
    description:
      'Free interactive circuit simulator and signal graphs for engineering students: convolution, Fourier transform, AC and DC circuits, sensors, and a Wheatstone bridge lab.',
    keywords: [
      'circuit simulator',
      'online circuit simulator',
      'signal graph',
      'signals and systems',
      'interactive simulation',
      'sensor simulator',
      'electrical engineering',
      'ECE',
      'จำลองวงจร',
      'จำลองวงจรไฟฟ้า ออนไลน์',
      'สัญญาณและระบบ',
    ],
    teaches: [
      'Convolution',
      'Fourier transform',
      'AC circuits',
      'DC circuits',
      'Sensors',
      'Wheatstone bridge',
    ],
    priority: 1,
  },
  convolution: {
    path: '/convolution',
    title: 'Convolution Visualizer — Flip, Slide, Multiply, Sum',
    description:
      'Interactive discrete convolution: watch the kernel flip and slide across the signal step by step, with y[n] = Σ x[k]·h[n−k] computed live on the graph.',
    keywords: [
      'convolution visualizer',
      'discrete convolution',
      'graphical convolution',
      'convolution animation',
      'signals and systems',
      'impulse response',
      'คอนโวลูชัน',
    ],
    teaches: ['Discrete-time convolution', 'Impulse response', 'Moving-average filter'],
    priority: 0.9,
  },
  fourier: {
    path: '/fourier',
    title: 'Fourier Transform & FFT Spectrum Explorer',
    description:
      'Graph a signal in time and its FFT magnitude spectrum side by side. Explore spectral leakage, FFT bins and window functions (Hann, Hamming, Blackman), and hear the tones.',
    keywords: [
      'Fourier transform',
      'FFT',
      'frequency spectrum',
      'spectral leakage',
      'window function',
      'signal graph',
      'การแปลงฟูริเยร์',
    ],
    teaches: [
      'Discrete Fourier transform',
      'Spectral leakage',
      'Window functions',
      'Nyquist frequency',
    ],
    priority: 0.9,
  },
  ac: {
    path: '/ac',
    title: 'AC Circuit Simulator — Generator, RMS, Power Factor & 3-Phase',
    description:
      'Interactive AC circuits: see a generator make a sine wave, then RMS and phasors, R, L and C loads with leading and lagging current and power factor, and three-phase star and delta.',
    keywords: [
      'AC circuit simulator',
      'AC generator simulation',
      'three phase',
      'star delta connection',
      'RMS voltage',
      'phasor diagram',
      'power factor',
      'leading and lagging current',
      'RLC circuit',
      'power triangle',
      'วงจรไฟฟ้ากระแสสลับ',
      'ตัวประกอบกำลัง',
    ],
    teaches: [
      'AC generator',
      'Three-phase power',
      'RMS value',
      'Phasors',
      'Impedance',
      'Power factor',
      'Series resonance',
    ],
    priority: 0.9,
  },
  circuits: {
    path: '/circuits',
    title: 'DC Circuit Simulator — Thévenin, Norton, Mesh & Nodal',
    description:
      "Interactive DC circuit analysis: Ohm's law, series-parallel and voltage dividers, Thévenin and Norton equivalents, maximum power transfer, and mesh and nodal analysis step by step.",
    keywords: [
      'DC circuit simulator',
      "Ohm's law",
      'voltage divider',
      'series and parallel resistors',
      'I-V graph',
      'Thevenin equivalent',
      'Norton equivalent',
      'maximum power transfer',
      'mesh analysis',
      'nodal analysis',
      'วงจรสมมูลเทวินิน',
      'การวิเคราะห์เมช',
      'วงจรไฟฟ้ากระแสตรง',
      'กฎของโอห์ม',
    ],
    teaches: [
      "Ohm's law",
      'Series and parallel resistance',
      'Voltage divider',
      'Thévenin and Norton equivalents',
      'Maximum power transfer',
      'Mesh and nodal analysis',
    ],
    priority: 0.9,
  },
  sensors: {
    path: '/sensors',
    title: 'How Sensors Work — LDR & Thermistor Simulator',
    description:
      'See a sensor as a physical measurement: photons and heat free electrons in an LDR and an NTC thermistor, then a voltage divider and a 10-bit ADC turn that into a number.',
    keywords: [
      'sensor simulator',
      'how sensors work',
      'LDR',
      'light dependent resistor',
      'photoresistor',
      'NTC thermistor',
      'thermistor simulator',
      'voltage divider sensor',
      'ADC',
      'เซนเซอร์',
      'ตัวต้านทานไวแสง',
      'เทอร์มิสเตอร์',
    ],
    teaches: [
      'Photoconductivity',
      'Band gap',
      'NTC thermistor',
      'Voltage divider',
      'Analog-to-digital conversion',
    ],
    priority: 0.9,
  },
  simulator: {
    path: '/simulator',
    title: 'Wheatstone Bridge Simulator — Sensors & Strain Gauges',
    description:
      'Animated Wheatstone bridge circuit simulator with current flow, galvanometer and Vo; quarter, half and full bridges with LDR, thermistor, RTD and strain gauge sensors.',
    keywords: [
      'Wheatstone bridge simulator',
      'circuit simulator',
      'strain gauge bridge',
      'quarter half full bridge',
      'thermistor',
      'LDR',
      'RTD Pt100',
      'บริดจ์วีตสโตน',
      'จำลองวงจร',
    ],
    teaches: ['Wheatstone bridge', 'Bridge balance', 'Resistive sensors', 'Strain gauge bridges'],
    priority: 0.9,
  },
};

/** Page metadata: title, description, canonical URL and social previews. */
export function pageMetadata(page: SeoPage): Metadata {
  const seo = SEO[page];
  return {
    title: page === 'home' ? { absolute: seo.title } : seo.title,
    description: seo.description,
    keywords: [...seo.keywords],
    alternates: { canonical: seo.path },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      url: seo.path,
      title: seo.title,
      description: seo.description,
      locale: 'en_US',
      alternateLocale: ['th_TH'],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
  };
}

/**
 * schema.org structured data for a module: a free, browser-based learning
 * resource for undergraduates. Rendered as JSON-LD by <JsonLd>.
 */
export function moduleJsonLd(page: Exclude<SeoPage, 'home'>): Record<string, unknown> {
  const seo = SEO[page];
  return {
    '@context': 'https://schema.org',
    '@type': ['LearningResource', 'WebApplication'],
    name: seo.title,
    description: seo.description,
    url: `${SITE_URL}${seo.path}`,
    inLanguage: ['en', 'th'],
    isAccessibleForFree: true,
    learningResourceType: 'Interactive simulation',
    educationalLevel: 'Undergraduate',
    audience: { '@type': 'EducationalAudience', educationalRole: 'student' },
    teaches: [...seo.teaches],
    keywords: seo.keywords.join(', '),
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any (runs in a web browser)',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  };
}

/** The landing page: the site itself plus the list of modules. */
export function siteJsonLd(): Record<string, unknown>[] {
  const modules = (
    ['convolution', 'fourier', 'ac', 'circuits', 'sensors', 'simulator'] as const
  ).map((page, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `${SITE_URL}${SEO[page].path}`,
    name: SEO[page].title,
  }));
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: SEO.home.description,
      inLanguage: ['en', 'th'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${SITE_NAME} modules`,
      itemListElement: modules,
    },
  ];
}

// ---------------------------------------------------------------------------
// Topic pages (/ac/three-phase, /circuits/thevenin-norton, …)
// ---------------------------------------------------------------------------

/** Metadata for a topic page: its own title, description and canonical URL. */
export function topicMetadata(topic: Topic): Metadata {
  const path = topicPath(topic);
  return {
    title: topic.seo.title,
    description: topic.seo.description,
    keywords: [...topic.seo.keywords],
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      url: path,
      title: topic.seo.title,
      description: topic.seo.description,
      locale: 'en_US',
      alternateLocale: ['th_TH'],
    },
    twitter: {
      card: 'summary_large_image',
      title: topic.seo.title,
      description: topic.seo.description,
    },
  };
}

/**
 * Structured data for a topic page: the learning resource itself, its
 * breadcrumb trail (Home › module › topic) and its FAQ, all describing
 * text that is visible on the page.
 */
export function topicJsonLd(topic: Topic): Record<string, unknown>[] {
  const url = `${SITE_URL}${topicPath(topic)}`;
  const hub = SEO[topic.module];
  const en = topic.text.en;
  return [
    {
      '@context': 'https://schema.org',
      '@type': ['LearningResource', 'WebApplication'],
      name: en.h1,
      headline: en.h1,
      description: topic.seo.description,
      url,
      inLanguage: ['en', 'th'],
      isAccessibleForFree: true,
      learningResourceType: ['Interactive simulation', 'Worked example'],
      educationalLevel: 'Undergraduate',
      audience: { '@type': 'EducationalAudience', educationalRole: 'student' },
      teaches: [...topic.seo.teaches],
      keywords: topic.seo.keywords.join(', '),
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any (runs in a web browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
        {
          '@type': 'ListItem',
          position: 2,
          name: MESSAGES.en.landing.modules[topic.module].title,
          item: `${SITE_URL}${hub.path}`,
        },
        { '@type': 'ListItem', position: 3, name: en.nav, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: en.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];
}
