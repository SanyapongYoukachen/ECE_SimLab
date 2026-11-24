import { test, expect } from '@playwright/test';
import { allTopics, topicPath } from '../src/lib/topics';

/** How React escapes text in server HTML. */
const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/'/g, '&#x27;');

test.describe('topic pages', () => {
  for (const topic of allTopics()) {
    const path = topicPath(topic);

    test(`${path}: own title, canonical, breadcrumb data and article`, async ({ request }) => {
      const html = await (await request.get(path)).text();
      expect(html).toContain(`<link rel="canonical" href="`);
      expect(html).toMatch(new RegExp(`rel="canonical" href="[^"]*${path}"`));
      expect(html).toContain(`<title>${esc(topic.seo.title)} | ECE Labsim</title>`);
      expect(html).toContain('"@type":"BreadcrumbList"');
      expect(html).toContain('"@type":"FAQPage"');
      // The article is in the server HTML, not only drawn by the client.
      expect(html).toContain(esc(topic.text.en.sections[0].heading));
      expect(html).toContain(topic.text.th.h1);
    });

    // Actuator sections were `?tab=`; every other module's were `?mode=`.
    const key = topic.module === 'actuators' ? 'tab' : 'mode';
    test(`/${topic.module}?${key}=${topic.mode} redirects to ${path}`, async ({ request }) => {
      const res = await request.get(`/${topic.module}?${key}=${topic.mode}`, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers()['location']).toContain(path);
    });
  }

  test('hub pages link to every topic, and unknown topics are 404', async ({ request }) => {
    for (const hub of ['ac', 'circuits', 'electronics', 'actuators'] as const) {
      const html = await (await request.get(`/${hub}`)).text();
      for (const t of allTopics().filter((x) => x.module === hub)) {
        expect(html).toContain(`href="${topicPath(t)}"`);
      }
    }
    expect((await request.get('/ac/not-a-topic')).status()).toBe(404);
    expect((await request.get('/actuators/not-a-topic')).status()).toBe(404);
  });

  for (const path of [
    '/convolution',
    '/fourier',
    '/ac',
    '/circuits',
    '/sensors',
    '/simulator',
    '/electronics',
    '/actuators',
  ]) {
    test(`${path}: canonical, breadcrumb and FAQ data in the server HTML`, async ({ request }) => {
      const html = await (await request.get(path)).text();
      expect(html).toMatch(new RegExp(`rel="canonical" href="[^"]*${path}"`));
      expect(html).toContain('"@type":["LearningResource","WebApplication"]');
      expect(html).toContain('"@type":"BreadcrumbList"');
      expect(html).toContain('"@type":"FAQPage"');
      expect(html).toMatch(/<meta property="og:image"/);
    });
  }
});
