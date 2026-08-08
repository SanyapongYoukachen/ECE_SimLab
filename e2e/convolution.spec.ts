import { test, expect } from '@playwright/test';

test.describe('convolution module', () => {
  test('renders both panels and updates the live expression as the shift changes', async ({
    page,
  }) => {
    await page.goto('/convolution?predict=off');

    await expect(page.getByRole('application')).toBeVisible();
    await expect(page.getByText(/length = N \+ M − 1/)).toBeVisible();

    const initialExpression = await page
      .getByText(/^y\[\d+\]/)
      .first()
      .textContent();

    const slider = page.getByRole('slider', { name: 'Shift n' });
    await slider.focus();
    await slider.press('ArrowRight');
    await slider.press('ArrowRight');

    await expect(async () => {
      const updated = await page
        .getByText(/^y\[\d+\]/)
        .first()
        .textContent();
      expect(updated).not.toBe(initialExpression);
    }).toPass();
  });

  test('switching kernels updates the output length badge and the note', async ({ page }) => {
    await page.goto('/convolution?predict=off');

    await expect(page.getByText('length = N + M − 1 = 10')).toBeVisible();

    await page.getByRole('radio', { name: 'Difference [1, −1]' }).click();

    await expect(page.getByText('length = N + M − 1 = 9')).toBeVisible();
    await expect(page.getByText(/not a smoother/i)).toBeVisible();
  });

  test('kernel selector is keyboard-navigable as a radiogroup', async ({ page }) => {
    await page.goto('/convolution?predict=off');

    const rectangular = page.getByRole('radio', { name: 'Rectangular' });
    await rectangular.focus();
    await page.keyboard.press('ArrowRight');

    await expect(page.getByRole('radio', { name: 'Triangular' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });
});
