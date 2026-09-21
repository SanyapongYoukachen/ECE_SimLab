import { test, expect } from '@playwright/test';

test.describe('circuits module', () => {
  test('renders the Ohm’s law view by default with both panels', async ({ page }) => {
    await page.goto('/circuits?predict=off');

    await expect(page.getByRole('radio', { name: "Ohm's law" })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(page.getByText(/^I = V \/ R/).first()).toBeVisible();
  });

  test('moving the voltage slider updates the live current expression', async ({ page }) => {
    await page.goto('/circuits?predict=off');

    const initial = await page
      .getByText(/^I = V \/ R/)
      .first()
      .textContent();

    const slider = page.getByRole('slider', { name: 'Source voltage V' });
    await slider.focus();
    for (let i = 0; i < 5; i++) await slider.press('ArrowRight');

    await expect(async () => {
      const updated = await page
        .getByText(/^I = V \/ R/)
        .first()
        .textContent();
      expect(updated).not.toBe(initial);
    }).toPass();
  });

  test('switching to the voltage divider view exposes R2 and the divider equation', async ({
    page,
  }) => {
    await page.goto('/circuits?predict=off');

    await page.getByRole('radio', { name: 'Voltage divider' }).click();

    await expect(page.getByRole('slider', { name: 'Resistance R2' })).toBeVisible();
    await expect(page.getByText(/^Vout = V × R2/).first()).toBeVisible();
  });

  test('switching to series & parallel exposes the topology control', async ({ page }) => {
    await page.goto('/circuits?predict=off');

    await page.getByRole('radio', { name: 'Series & parallel' }).click();
    await expect(page.getByRole('radiogroup', { name: 'Topology' })).toBeVisible();

    await page.getByRole('radio', { name: 'Parallel', exact: true }).click();
    await expect(page.getByText(/^Req = \(R1×R2\)/).first()).toBeVisible();
  });

  test('mode selection is reflected in the URL and survives reload', async ({ page }) => {
    await page.goto('/circuits?predict=off');
    await page.getByRole('radio', { name: 'Voltage divider' }).click();
    await expect(page).toHaveURL(/mode=divider/);

    await page.reload();
    await expect(page.getByRole('radio', { name: 'Voltage divider' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });
});
