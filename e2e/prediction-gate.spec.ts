import { test, expect } from '@playwright/test';

// Each test gets a fresh, isolated browser context (see playwright.config.ts),
// so localStorage — and with it the practice-mode preference — starts empty
// every time; no explicit reset needed.

test.describe('default: non-blocking check-your-understanding (all modules)', () => {
  test('convolution opens unlocked, with its question bank one tab away', async ({ page }) => {
    await page.goto('/convolution');

    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('application')).toBeVisible();
    await expect(page.getByRole('application')).not.toHaveAttribute('aria-hidden', 'true');

    await expect(page.getByRole('tab', { name: /Check your understanding/ })).toBeVisible();
    // Explore first: the questions stay out of the way until asked for.
    await expect(page.getByText(/x has 5 samples and h has 3 samples/)).toHaveCount(0);

    await page.getByRole('tab', { name: /Check your understanding/ }).click();
    await expect(page.getByText(/x has 5 samples and h has 3 samples/)).toBeVisible();
    await expect(page.getByText(/Does it matter which signal you call x/)).toBeVisible();
  });

  test('the check-your-understanding tab never locks the content', async ({ page }) => {
    await page.goto('/fourier');

    await page.getByRole('tab', { name: /Check your understanding/ }).click();
    await page.getByRole('radio', { name: /Energy spreads across/ }).click();
    await expect(page.getByText('— correct')).toBeVisible();

    // Answering it never locked anything, so a slider is still directly usable.
    await page.getByRole('tab', { name: 'Explore' }).click();
    const slider = page.getByRole('slider', { name: 'Frequency 3' });
    await slider.focus();
    await slider.press('ArrowRight');
  });

  test('?predict=off hides the check-your-understanding prompt', async ({ page }) => {
    await page.goto('/theorem?predict=off');
    await expect(page.getByRole('tab', { name: /Check your understanding/ })).toHaveCount(0);
  });

  test('an answered check persists across reload', async ({ page }) => {
    await page.goto('/theorem');
    await page.getByRole('tab', { name: /Check your understanding/ }).click();
    const checkGroup = page.getByRole('radiogroup', {
      name: /You double the signal length N/,
    });
    await checkGroup.getByRole('radio').first().click();
    await expect(page.getByText(/— correct|— not quite/)).toBeVisible();

    await page.reload();
    await expect(page.getByText(/— correct|— not quite/)).toBeVisible();
  });

  test('circuits also defaults to the non-blocking check, not a gate', async ({ page }) => {
    await page.goto('/circuits');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('slider').first()).toBeVisible();
    await expect(page.getByRole('tab', { name: /Check your understanding/ })).toBeVisible();
  });
});

test.describe('practice mode ("Predict first"), opt-in via the module header toggle', () => {
  test('off by default', async ({ page }) => {
    await page.goto('/circuits');
    await expect(page.getByRole('button', { name: 'Predict first: off' })).toBeVisible();
  });

  test('turning it on gates the module behind one random question; turning it off restores the check list', async ({
    page,
  }) => {
    await page.goto('/circuits');

    await page.getByRole('button', { name: 'Predict first: off' }).click();
    await expect(page.getByRole('button', { name: 'Predict first: on' })).toBeVisible();

    const dialog = page.getByRole('dialog', { name: 'Predict before you explore' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('tab', { name: /Check your understanding/ })).toHaveCount(0);
    await expect(page.getByRole('slider')).toHaveCount(0);

    await dialog.getByRole('radio').first().click();
    await expect(dialog.getByText(/— correct|— not quite/)).toBeVisible();
    await dialog.getByRole('button', { name: 'Continue' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('slider').first()).toBeVisible();

    await page.getByRole('button', { name: 'Predict first: on' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('tab', { name: /Check your understanding/ })).toBeVisible();
  });

  test('re-gates on every visit instead of unlocking permanently', async ({ page }) => {
    await page.goto('/circuits');
    await page.getByRole('button', { name: 'Predict first: off' }).click();

    const dialog = page.getByRole('dialog', { name: 'Predict before you explore' });
    await dialog.getByRole('radio').first().click();
    await dialog.getByRole('button', { name: 'Continue' }).click();
    await expect(dialog).not.toBeVisible();

    await page.reload();
    await expect(page.getByRole('dialog', { name: 'Predict before you explore' })).toBeVisible();
  });

  test('the preference persists across reload and applies to other modules', async ({ page }) => {
    await page.goto('/circuits');
    await page.getByRole('button', { name: 'Predict first: off' }).click();

    await page.goto('/convolution');
    await expect(page.getByRole('button', { name: 'Predict first: on' })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Predict before you explore' })).toBeVisible();
  });

  test('?predict=off still bypasses the gate even with practice mode on', async ({ page }) => {
    await page.goto('/circuits');
    await page.getByRole('button', { name: 'Predict first: off' }).click();

    await page.goto('/circuits?predict=off');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('slider').first()).toBeVisible();
  });
});
