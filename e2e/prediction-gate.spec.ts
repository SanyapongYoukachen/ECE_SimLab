import { test, expect } from '@playwright/test';

test.describe('circuits prediction gate (blocking)', () => {
  test('blocks the module until a prediction is made, then unlocks', async ({ page }) => {
    await page.goto('/circuits');

    const dialog = page.getByRole('dialog', { name: 'Predict before you explore' });
    await expect(dialog).toBeVisible();

    // aria-hidden removes it from the accessibility tree entirely, so a
    // role query finding nothing *is* the assertion that it's non-interactive.
    await expect(page.getByRole('slider')).toHaveCount(0);

    await dialog.getByRole('radio', { name: /cut in half/ }).click();
    await expect(dialog.getByText('correct')).toBeVisible();

    await dialog.getByRole('button', { name: 'Continue' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('slider').first()).toBeVisible();
  });

  test('?predict=off skips the gate entirely', async ({ page }) => {
    await page.goto('/circuits?predict=off');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('slider').first()).toBeVisible();
  });

  test('an answered prediction persists across reload', async ({ page }) => {
    await page.goto('/circuits');
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('radio').first().click();
    await dialog.getByRole('button', { name: 'Continue' }).click();
    await expect(dialog).not.toBeVisible();

    await page.reload();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});

test.describe('modules 1-3 prediction check (non-blocking)', () => {
  test('the module is interactive immediately, with no blocking dialog', async ({ page }) => {
    await page.goto('/convolution');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('application')).toBeVisible();
    await expect(page.getByRole('application')).not.toHaveAttribute('aria-hidden', 'true');
  });

  test('the check-your-understanding prompt appears after the content and does not lock it', async ({
    page,
  }) => {
    await page.goto('/fourier');

    const check = page.getByText('Check your understanding');
    await expect(check).toBeVisible();

    await page.getByRole('radio', { name: /Energy spreads across/ }).click();
    await expect(page.getByText('— correct')).toBeVisible();

    // Answering it never locked anything, so a slider is still directly usable.
    const slider = page.getByRole('slider', { name: 'Frequency 3' });
    await slider.focus();
    await slider.press('ArrowRight');
  });

  test('?predict=off hides the check-your-understanding prompt', async ({ page }) => {
    await page.goto('/theorem?predict=off');
    await expect(page.getByText('Check your understanding')).toHaveCount(0);
  });

  test('an answered check persists across reload', async ({ page }) => {
    await page.goto('/theorem');
    const checkGroup = page.getByRole('radiogroup', {
      name: /You double the signal length N/,
    });
    await checkGroup.getByRole('radio').first().click();
    await expect(page.getByText(/— correct|— not quite/)).toBeVisible();

    await page.reload();
    await expect(page.getByText(/— correct|— not quite/)).toBeVisible();
  });
});
