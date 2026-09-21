import { test, expect } from '@playwright/test';

test.describe('landing page', () => {
  test('links to all four modules', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Convolution', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Fourier transform explorer' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'The convolution theorem' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'DC circuits' })).toBeVisible();
  });

  test('navigates into a module', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Convolution', exact: true }).click();
    await expect(page).toHaveURL(/\/convolution/);
  });
});
