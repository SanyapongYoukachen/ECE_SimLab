import { test, expect } from '@playwright/test';

test.describe('landing page', () => {
  test('links to all five modules', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Convolution', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Fourier transform explorer' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'AC circuits' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'DC circuits' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Circuit simulator' })).toBeVisible();
  });

  test('navigates into a module', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Convolution', exact: true }).click();
    await expect(page).toHaveURL(/\/convolution/);
  });
});

test.describe('search engine surface', () => {
  test('robots.txt and sitemap.xml list every module', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Sitemap: ');
    const sitemap = await (await request.get('/sitemap.xml')).text();
    for (const path of ['/convolution', '/fourier', '/ac', '/circuits', '/simulator']) {
      expect(sitemap).toContain(`${path}</loc>`);
    }
  });

  test('module pages carry a canonical URL, structured data and crawlable About text', async ({
    page,
  }) => {
    await page.goto('/simulator');
    await expect(page).toHaveTitle(/Wheatstone Bridge Simulator/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/simulator$/);
    const ld = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? '{}'
    );
    expect(ld['@type']).toContain('LearningResource');
    await expect(
      page.getByRole('heading', { level: 2, name: 'About this simulator' })
    ).toBeVisible();
    await expect(page.getByText('When is a Wheatstone bridge balanced?')).toBeVisible();
  });
});
