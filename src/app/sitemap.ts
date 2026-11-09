import type { MetadataRoute } from 'next';
import { SEO, SITE_URL } from '@/lib/seo';
import { allTopics, topicPath } from '@/lib/topics';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = Object.values(SEO).map((page) => ({
    url: `${SITE_URL}${page.path === '/' ? '' : page.path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: page.priority,
  }));
  // Topic pages are the ones most searches should land on.
  const topics: MetadataRoute.Sitemap = allTopics().map((topic) => ({
    url: `${SITE_URL}${topicPath(topic)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.9,
  }));
  return [...pages, ...topics];
}
