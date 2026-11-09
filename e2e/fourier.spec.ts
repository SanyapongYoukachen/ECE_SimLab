import { test, expect } from '@playwright/test';

test.describe('fourier module', () => {
  test('starts on-bin by default and flags leakage once moved off-bin', async ({ page }) => {
    await page.goto('/fourier?predict=off');

    await expect(page.getByText(/sits exactly on a bin/)).toBeVisible();

    const freqSlider = page.getByRole('slider', { name: 'Frequency 3' });
    await freqSlider.focus();
    for (let i = 0; i < 5; i++) await freqSlider.press('ArrowRight');

    await expect(page.getByText(/Component 3 sits between bins .* spectral leakage/)).toBeVisible();
  });

  test('snap-to-bin button returns component 3 to a clean bin', async ({ page }) => {
    await page.goto('/fourier?predict=off&freq3=340');
    await expect(page.getByText(/between bins/).first()).toBeVisible();

    await page.getByRole('button', { name: 'Snap to nearest bin' }).click();

    await expect(page.getByText(/sits exactly on a bin/)).toBeVisible();
  });

  test('window selector switches and shows the rectangular reference overlay', async ({ page }) => {
    await page.goto('/fourier?predict=off');
    await page.getByRole('radio', { name: 'Hann' }).click();
    await expect(page.getByText('rectangular-window reference')).toBeVisible();
  });
});
