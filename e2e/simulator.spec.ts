import { test, expect } from '@playwright/test';

test.describe('circuit simulator', () => {
  test('opens on the Wheatstone bridge tab, unlocked, with the schematic and controls visible', async ({
    page,
  }) => {
    await page.goto('/simulator?predict=off');

    await expect(page.getByRole('radio', { name: 'Wheatstone bridge' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('img', { name: /Wheatstone bridge schematic/ })).toBeVisible();
    await expect(page.getByRole('slider', { name: 'R1' })).toBeVisible();
  });

  test('starts unbalanced by default and the balance button zeroes the galvanometer current', async ({
    page,
  }) => {
    await page.goto('/simulator?predict=off');

    await expect(page.getByText('Balanced?').locator('..').getByText('No')).toBeVisible();

    await page.getByRole('button', { name: 'Balance the bridge (solve R4)' }).click();

    await expect(
      page.getByText('Galvanometer current').locator('..').getByText('0.00 mA')
    ).toBeVisible();
    await expect(page.getByText('Balanced?').locator('..').getByText('Yes')).toBeVisible();
  });

  test('moving a resistor slider updates the live balance expression', async ({ page }) => {
    await page.goto('/simulator?predict=off');

    const initial = await page.getByText(/^R1·R4 = /).textContent();

    const slider = page.getByRole('slider', { name: 'R4 (the unknown, in a real bridge)' });
    await slider.focus();
    for (let i = 0; i < 5; i++) await slider.press('ArrowRight');

    await expect(async () => {
      const updated = await page.getByText(/^R1·R4 = /).textContent();
      expect(updated).not.toBe(initial);
    }).toPass();
  });

  test('the check-your-understanding prompt appears by default and predict=off hides it', async ({
    page,
  }) => {
    await page.goto('/simulator');
    await expect(page.getByText('Check your understanding')).toBeVisible();

    await page.goto('/simulator?predict=off');
    await expect(page.getByText('Check your understanding')).toHaveCount(0);
  });

  test('practice mode gates the simulator behind one question, like the other modules', async ({
    page,
  }) => {
    await page.goto('/simulator');
    await page.getByRole('button', { name: 'Predict first: off' }).click();

    const dialog = page.getByRole('dialog', { name: 'Predict before you explore' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('slider')).toHaveCount(0);
  });
});
