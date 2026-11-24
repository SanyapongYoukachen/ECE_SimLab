import { describe, it, expect } from 'vitest';
import { moduleJsonLd, SEO, type SeoPage } from './seo';
import { allTopics } from './topics';
import { MESSAGES } from './i18n';

const MODULE_PAGES = (Object.keys(SEO) as SeoPage[]).filter(
  (p): p is Exclude<SeoPage, 'home'> => p !== 'home'
);

describe('page SEO', () => {
  it('fits search results: titles ≤ 60 characters, descriptions 120–170', () => {
    for (const page of Object.keys(SEO) as SeoPage[]) {
      const { title, description } = SEO[page];
      expect(title.length, title).toBeLessThanOrEqual(60);
      expect(description.length, description).toBeGreaterThanOrEqual(120);
      expect(description.length, description).toBeLessThanOrEqual(170);
    }
  });

  it('gives every page and topic its own title and description', () => {
    const all = [
      ...Object.values(SEO).map((s) => [s.title, s.description]),
      ...allTopics().map((t) => [t.seo.title, t.seo.description]),
    ];
    expect(new Set(all.map(([t]) => t)).size).toBe(all.length);
    expect(new Set(all.map(([, d]) => d)).size).toBe(all.length);
  });

  it('module pages carry a breadcrumb and the FAQ their About section shows', () => {
    for (const page of MODULE_PAGES) {
      const [resource, crumbs, faq] = moduleJsonLd(page);
      expect(resource['@type']).toContain('LearningResource');
      expect(crumbs['@type']).toBe('BreadcrumbList');
      expect(faq['@type']).toBe('FAQPage');
      const questions = faq.mainEntity as { name: string }[];
      expect(questions.map((q) => q.name)).toEqual(MESSAGES.en.about[page].faq.map((f) => f.q));
      expect(questions.length, page).toBeGreaterThan(0);
    }
  });
});
