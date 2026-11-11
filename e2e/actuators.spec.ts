import { test, expect } from '@playwright/test';

test.describe('actuators module', () => {
  test('opens on the DC motor tab, unlocked, with the schematic and controls visible', async ({
    page,
  }) => {
    await page.goto('/actuators?predict=off');

    await expect(page.getByRole('radio', { name: 'DC motor' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('img', { name: /DC motor schematic/ })).toBeVisible();
    await expect(page.getByRole('slider', { name: 'Supply voltage V' })).toBeVisible();
  });

  test('DC motor: more load torque lowers speed and the live expression updates', async ({
    page,
  }) => {
    await page.goto('/actuators?predict=off');

    const initial = await page.getByText(/^ω = /).textContent();

    const slider = page.getByRole('slider', { name: 'Load torque Tl' });
    await slider.focus();
    for (let i = 0; i < 10; i++) await slider.press('ArrowRight');

    await expect(async () => {
      const updated = await page.getByText(/^ω = /).textContent();
      expect(updated).not.toBe(initial);
    }).toPass();
  });

  test('stepping motor: switching to half-step doubles the steps-per-revolution stat', async ({
    page,
  }) => {
    await page.goto('/actuators?predict=off');
    await page.getByRole('radio', { name: 'Stepping motor' }).click();

    await expect(page.getByRole('img', { name: /Stepping motor schematic/ })).toBeVisible();
    await expect(page.getByText('Steps / revolution').locator('..').getByText('24')).toBeVisible();

    await page.getByRole('radio', { name: 'Half step' }).click();
    await expect(page.getByText('Steps / revolution').locator('..').getByText('48')).toBeVisible();
  });

  test('stepping motor: direction toggle is reflected in the stat tile', async ({ page }) => {
    await page.goto('/actuators?predict=off');
    await page.getByRole('radio', { name: 'Stepping motor' }).click();

    await expect(page.getByText('Direction').locator('..').getByText('Clockwise')).toBeVisible();
    await page.getByRole('radio', { name: 'Counter-clockwise' }).click();
    await expect(
      page.getByText('Direction').locator('..').getByText('Counter-clockwise')
    ).toBeVisible();
  });

  test('relay: starts de-energized with zero load current, energizes once coil current clears the threshold', async ({
    page,
  }) => {
    await page.goto('/actuators?predict=off');
    await page.getByRole('radio', { name: 'Relay' }).click();

    await expect(page.getByRole('img', { name: /Relay schematic/ })).toBeVisible();
    await expect(page.getByText('State').locator('..').getByText('De-energized')).toBeVisible();
    await expect(page.getByText('Load current').locator('..').getByText('0.000 A')).toBeVisible();

    const slider = page.getByRole('slider', { name: 'Coil voltage' });
    await slider.focus();
    for (let i = 0; i < 40; i++) await slider.press('ArrowRight');

    await expect(page.getByText('State').locator('..').getByText('Energized')).toBeVisible();
    await expect(page.getByText('Active contact').locator('..').getByText('NO')).toBeVisible();
  });

  test('the check-your-understanding prompt appears by default and predict=off hides it', async ({
    page,
  }) => {
    await page.goto('/actuators');
    await expect(page.getByText('Check your understanding')).toBeVisible();

    await page.goto('/actuators?predict=off');
    await expect(page.getByText('Check your understanding')).toHaveCount(0);
  });

  test('practice mode gates the actuators module behind one question, like the other modules', async ({
    page,
  }) => {
    await page.goto('/actuators');
    await page.getByRole('button', { name: 'Predict first: off' }).click();

    const dialog = page.getByRole('dialog', { name: 'Predict before you explore' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('slider')).toHaveCount(0);
  });
});
