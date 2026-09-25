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

  test('a configured circuits link reproduces voltage and resistance', async ({ page }) => {
    await page.goto('/circuits?predict=off&mode=ohm&voltage=12&r1=100');
    await expect(page.getByText(/^I = V \/ R = 12\.00 V \/ 100 Ω/).first()).toBeVisible();
  });

  test('malformed circuits URL state falls back to defaults instead of breaking', async ({
    page,
  }) => {
    await page.goto('/circuits?predict=off&mode=not-a-real-mode&voltage=-999');
    await expect(page.getByRole('radio', { name: "Ohm's law" })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(page.getByText(/^I = V \/ R = 9\.00 V/).first()).toBeVisible();
  });

  test('a configured Wheatstone bridge link reproduces its resistor values', async ({ page }) => {
    await page.goto('/simulator?predict=off&r1=200&r2=200&r3=200&r4=200');
    await expect(
      page.getByText(/^R1·R4 = 40\.00 kΩ\s+=\s+R2·R3 = 40\.00 kΩ/).first()
    ).toBeVisible();
    await expect(page.getByText('Balanced?').locator('..').getByText('Yes')).toBeVisible();
  });

  test('malformed simulator URL state falls back to defaults instead of breaking', async ({
    page,
  }) => {
    await page.goto('/simulator?predict=off&tab=not-a-real-tab&r1=-999');
    await expect(page.getByRole('radio', { name: 'Wheatstone bridge' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(page.getByRole('img', { name: /Wheatstone bridge schematic/ })).toBeVisible();
  });
});
