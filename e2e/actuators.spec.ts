import { test, expect } from '@playwright/test';

test.describe('actuators module', () => {
  test('opens on the DC motor page, unlocked, with the schematic and controls visible', async ({
    page,
  }) => {
    await page.goto('/actuators/dc-motor?predict=off');

    await expect(
      page.getByRole('navigation', { name: 'Actuator' }).getByRole('link', { name: 'DC motor' })
    ).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('img', { name: /DC motor schematic/ })).toBeVisible();
    await expect(page.getByRole('slider', { name: 'Supply voltage V' })).toBeVisible();
  });

  test('DC motor: more load torque lowers speed and the live expression updates', async ({
    page,
  }) => {
    await page.goto('/actuators/dc-motor?predict=off');

    const initial = await page.getByText(/^ω = (\(Vavg|0 —)/).textContent();

    const slider = page.getByRole('slider', { name: 'Load torque Tl' });
    await slider.focus();
    for (let i = 0; i < 10; i++) await slider.press('ArrowRight');

    await expect(async () => {
      const updated = await page.getByText(/^ω = (\(Vavg|0 —)/).textContent();
      expect(updated).not.toBe(initial);
    }).toPass();
  });

  test('DC motor: PWM duty sets the average voltage, and with it the speed', async ({ page }) => {
    await page.goto('/actuators/dc-motor?predict=off&duty=50');

    await expect(page.getByRole('slider', { name: 'PWM duty cycle D' })).toHaveValue('50');
    await expect(page.getByText('Vavg = D × Vs = 50% × 12.00 V = 6.00 V')).toBeVisible();
    await expect(page.getByRole('img', { name: /PWM waveform/ })).toBeVisible();
    await expect(
      page.getByText('Average voltage', { exact: true }).locator('..').getByText('6.00 V')
    ).toBeVisible();

    const half = await page.getByText(/^ω = (\(Vavg|0 —)/).textContent();
    const slider = page.getByRole('slider', { name: 'PWM duty cycle D' });
    await slider.focus();
    for (let i = 0; i < 25; i++) await slider.press('ArrowRight');
    await expect(
      page.getByText('Average voltage', { exact: true }).locator('..').getByText('9.00 V')
    ).toBeVisible();
    expect(await page.getByText(/^ω = (\(Vavg|0 —)/).textContent()).not.toBe(half);
    await expect(page).toHaveURL(/duty=75/);
  });

  test('DC motor: too little duty for the load stalls it instead of reversing', async ({
    page,
  }) => {
    await page.goto('/actuators/dc-motor?predict=off&duty=8&tl=0.05');
    await expect(page.getByText('Speed', { exact: true }).locator('..')).toContainText('Stalled');
    await expect(page.getByText(/^ω = 0 — stalled/)).toBeVisible();
  });

  test('stepping motor: shows stator poles around a magnet rotor, and its pole pairs', async ({
    page,
  }) => {
    await page.goto('/actuators/stepper-motor?predict=off');
    await expect(
      page.getByRole('img', { name: /four stator poles A to D around a permanent-magnet rotor/ })
    ).toBeVisible();
    await expect(page.getByText('Rotor pole pairs').locator('..').getByText('6')).toBeVisible();
    await expect(page.getByText('N pole', { exact: true })).toBeVisible();
    await expect(page.getByText('S pole', { exact: true })).toBeVisible();
  });

  test('stepping motor: switching to half-step doubles the steps-per-revolution stat', async ({
    page,
  }) => {
    await page.goto('/actuators/dc-motor?predict=off');
    await page
      .getByRole('navigation', { name: 'Actuator' })
      .getByRole('link', { name: 'Stepping motor' })
      .click();

    await expect(page.getByRole('img', { name: /Stepping motor schematic/ })).toBeVisible();
    await expect(page.getByText('Steps / revolution').locator('..').getByText('24')).toBeVisible();

    await page.getByRole('radio', { name: 'Half step' }).click();
    await expect(page.getByText('Steps / revolution').locator('..').getByText('48')).toBeVisible();
  });

  test('stepping motor: direction toggle is reflected in the stat tile', async ({ page }) => {
    await page.goto('/actuators/dc-motor?predict=off');
    await page
      .getByRole('navigation', { name: 'Actuator' })
      .getByRole('link', { name: 'Stepping motor' })
      .click();

    await expect(page.getByText('Direction').locator('..').getByText('Clockwise')).toBeVisible();
    await page.getByRole('radio', { name: 'Counter-clockwise' }).click();
    await expect(
      page.getByText('Direction').locator('..').getByText('Counter-clockwise')
    ).toBeVisible();
  });

  test('relay: starts de-energized with zero load current, energizes once coil current clears the threshold', async ({
    page,
  }) => {
    await page.goto('/actuators/dc-motor?predict=off');
    await page
      .getByRole('navigation', { name: 'Actuator' })
      .getByRole('link', { name: 'Relay' })
      .click();

    await expect(page.getByRole('img', { name: /Relay schematic/ })).toBeVisible();
    await expect(page.getByText('State').locator('..').getByText('De-energized')).toBeVisible();
    await expect(page.getByText('Load current').locator('..').getByText('0.000 A')).toBeVisible();

    const slider = page.getByRole('slider', { name: 'Coil voltage' });
    await slider.focus();
    for (let i = 0; i < 40; i++) await slider.press('ArrowRight');

    await expect(page.getByText('State').locator('..').getByText('Energized')).toBeVisible();
    await expect(page.getByText('Active contact').locator('..').getByText('NO')).toBeVisible();
  });

  test('relay: the circuit symbol and the internal structure switch together', async ({ page }) => {
    await page.goto('/actuators/relay?predict=off');
    await expect(page.getByText('Circuit symbol', { exact: true })).toBeVisible();
    await expect(page.getByText('Inside the relay', { exact: true })).toBeVisible();
    await expect(page.getByRole('img', { name: /COM resting on NC/ })).toHaveCount(2);

    await page.goto('/actuators/relay?predict=off&cv=12');
    await expect(
      page.getByRole('img', { name: /Relay schematic.*COM closed onto NO/ })
    ).toBeVisible();
    await expect(
      page.getByRole('img', { name: /Relay internal structure.*closing COM to NO/ })
    ).toBeVisible();
  });

  test('the check-your-understanding prompt appears by default and predict=off hides it', async ({
    page,
  }) => {
    await page.goto('/actuators/dc-motor');
    await expect(page.getByText('Check your understanding')).toBeVisible();

    await page.goto('/actuators/dc-motor?predict=off');
    await expect(page.getByText('Check your understanding')).toHaveCount(0);
  });

  test('practice mode gates the actuators module behind one question, like the other modules', async ({
    page,
  }) => {
    await page.goto('/actuators/dc-motor');
    await page.getByRole('button', { name: 'Predict first: off' }).click();

    const dialog = page.getByRole('dialog', { name: 'Predict before you explore' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('slider')).toHaveCount(0);
  });

  test('the hub links to one page per actuator, and old ?tab= links redirect there', async ({
    page,
    request,
  }) => {
    await page.goto('/actuators');
    for (const name of ['DC motor', 'Stepping motor', 'Relay']) {
      await expect(page.getByRole('link', { name: new RegExp(`${name} →`) })).toBeVisible();
    }
    const res = await request.get('/actuators?tab=relay&cv=12', { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()['location']).toMatch(/\/actuators\/relay\?.*cv=12/);
  });
});
