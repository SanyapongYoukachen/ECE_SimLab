import { test, expect } from '@playwright/test';

test.describe('URL state', () => {
  test('a configured convolution link reproduces the same kernel on load', async ({ page }) => {
    await page.goto('/convolution?predict=off&kernel=diff');
    await expect(page.getByRole('radio', { name: 'Difference [1, −1]' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  test('a configured fourier link reproduces window choice and frequency', async ({ page }) => {
    await page.goto('/fourier?predict=off&window=blackman&freq3=340');
    await expect(page.getByRole('radio', { name: 'Blackman' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(page.getByText('340.0 Hz').first()).toBeVisible();
  });

  test('malformed URL state falls back to defaults instead of breaking', async ({ page }) => {
    await page.goto('/convolution?predict=off&kernel=not-a-real-kernel&n=-999');
    await expect(page.getByRole('radio', { name: 'Rectangular' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(page.getByRole('application')).toBeVisible();
  });

  test('interacting with a control updates the URL so the link stays shareable', async ({
    page,
  }) => {
    await page.goto('/convolution?predict=off');
    await page.getByRole('radio', { name: 'Exponential decay' }).click();
    await expect(page).toHaveURL(/kernel=expo/);
  });
});
