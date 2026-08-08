import { test, expect } from '@playwright/test';

test.describe('prediction gate', () => {
  test('blocks the module until a prediction is made, then unlocks', async ({ page }) => {
    await page.goto('/convolution');

    const dialog = page.getByRole('dialog', { name: 'Predict before you explore' });
    await expect(dialog).toBeVisible();

    // aria-hidden removes it from the accessibility tree entirely, so a
    // role query finding nothing *is* the assertion that it's non-interactive.
    await expect(page.getByRole('application')).toHaveCount(0);

    await dialog.getByRole('radio', { name: /output is N \+ M − 1/ }).click();
    await expect(dialog.getByText('correct')).toBeVisible();

    await dialog.getByRole('button', { name: 'Continue' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('application')).toHaveCount(1);
  });

  test('?predict=off skips the gate entirely', async ({ page }) => {
    await page.goto('/convolution?predict=off');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('application')).not.toHaveAttribute('aria-hidden', 'true');
  });

  test('an answered prediction persists across reload', async ({ page }) => {
    await page.goto('/fourier');
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('radio').first().click();
    await dialog.getByRole('button', { name: 'Continue' }).click();
    await expect(dialog).not.toBeVisible();

    await page.reload();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});
