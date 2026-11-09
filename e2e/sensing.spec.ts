import { test, expect, type Page } from '@playwright/test';

function stat(page: Page, label: string) {
  return page.getByText(label, { exact: true }).locator('..');
}

test.describe('Wheatstone bridge: sensing mode', () => {
  test('switching to sensing fixes three arms, shows the sensor controls, and starts balanced', async ({
    page,
  }) => {
    await page.goto('/simulator?predict=off');
    await expect(page.getByRole('slider', { name: 'R1' })).toBeVisible();

    await page.getByRole('radio', { name: 'Sensing (one sensor arm)' }).click();

    await expect(page.getByRole('slider', { name: 'R1' })).toHaveCount(0);
    await expect(page.getByRole('radio', { name: 'Temperature (NTC thermistor)' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(page.getByRole('radio', { name: 'R4', exact: true })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(page.getByRole('radio', { name: 'Quarter (1 active arm)' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(
      page.getByText(/equals the sensor's resistance at 25 °C \(10\.000 kΩ\)/)
    ).toBeVisible();
    await expect(stat(page, 'Balanced?').getByText('Yes')).toBeVisible();
    await expect(page).toHaveURL(/mode=sensing/);
  });

  test('changing the physical quantity unbalances the bridge; back-to-reference rebalances it', async ({
    page,
  }) => {
    await page.goto('/simulator?predict=off&mode=sensing&sensor=ntc');

    const slider = page.getByRole('slider', { name: 'Temperature' });
    await slider.focus();
    for (let i = 0; i < 10; i++) await slider.press('ArrowRight');

    await expect(stat(page, 'Balanced?').getByText('No')).toBeVisible();
    // Warmer NTC → lower resistance than the 10 kΩ fixed arms.
    await expect(stat(page, 'Sensor resistance').getByText(/^[0-9.]+ kΩ$/)).not.toHaveText(
      '10.000 kΩ'
    );

    await page.getByRole('button', { name: 'Back to reference (25 °C)' }).click();
    await expect(stat(page, 'Balanced?').getByText('Yes')).toBeVisible();
  });

  test('moving the sensor from R4 to R3 flips the sign of the bridge output', async ({ page }) => {
    await page.goto('/simulator?predict=off&mode=sensing&sensor=strain&arm=r4&strain=1000');
    const output = stat(page, 'Bridge output VB − VC').locator('div').nth(1);
    const inR4 = (await output.textContent()) ?? '';

    await page.getByRole('radio', { name: 'R3', exact: true }).click();
    await expect(output).not.toHaveText(inR4);
    const inR3 = (await output.textContent()) ?? '';

    expect(inR4.startsWith('-')).not.toBe(inR3.startsWith('-'));
    expect(inR4.replace('-', '')).toBe(inR3.replace('-', ''));
  });

  test('a sensing link reproduces the sensor, its arm, and its reading', async ({ page }) => {
    await page.goto('/simulator?predict=off&mode=sensing&sensor=strain&arm=r1&strain=1500');
    await expect(page.getByRole('radio', { name: 'Strain gauge' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(page.getByRole('radio', { name: 'R1', exact: true })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    // 350 Ω × (1 + 2.0 × 1500e-6) = 351.05 Ω
    await expect(stat(page, 'Sensor resistance').getByText('351.05 Ω')).toBeVisible();
  });

  test('every sensor type renders its illustration and response curves', async ({ page }) => {
    await page.goto('/simulator?predict=off&mode=sensing');
    for (const name of [
      'Light (LDR)',
      'Temperature (NTC thermistor)',
      'Temperature (Pt100 RTD)',
      'Strain gauge',
      'Variable resistor',
    ]) {
      await page.getByRole('radio', { name }).click();
      await expect(
        page.getByRole('img', {
          name: new RegExp(`Illustration of the ${name.replace(/[()]/g, '\\$&')}`),
        })
      ).toBeVisible();
      await expect(page.getByRole('group', { name: /Response curves/ })).toBeVisible();
    }
  });

  test('half and full bridges multiply the output by about 2 and 4, and stay balanced at reference', async ({
    page,
  }) => {
    await page.goto('/simulator?predict=off&mode=sensing&sensor=strain&arm=r4&strain=1000&rg=2200');
    const output = stat(page, 'Bridge output VB − VC').locator('div').nth(1);
    const mv = async (): Promise<number> =>
      Math.abs(parseFloat((await output.textContent()) ?? '0'));

    const quarter = await mv();
    await page.getByRole('radio', { name: 'Half (2 active arms)' }).click();
    await expect(
      stat(page, 'Sensitivity vs quarter bridge').getByText(/^×1\.9\d|^×2\.0\d/)
    ).toBeVisible();
    const half = await mv();
    await page.getByRole('radio', { name: 'Full (4 active arms)' }).click();
    await expect(
      stat(page, 'Sensitivity vs quarter bridge').getByText(/^×3\.\d\d|^×4\.0\d/)
    ).toBeVisible();
    const full = await mv();

    expect(half / quarter).toBeGreaterThan(1.8);
    expect(half / quarter).toBeLessThan(2.2);
    expect(full / quarter).toBeGreaterThan(3.4);
    expect(full / quarter).toBeLessThan(4.4);

    // A full bridge of linear gauges is exactly linear: open-circuit output
    // equals the textbook V·ΔR/R. Here 9 V × (2.0 × 1000e-6) = 18 mV.
    await expect(stat(page, 'Open-circuit output (no meter)').getByText('-18.00 mV')).toBeVisible();
    await expect(stat(page, 'Textbook estimate 1·V·ΔR/R').getByText('-18.00 mV')).toBeVisible();

    // Full bridge with R4 primary: R1 is +Δ too, R2 and R3 are −Δ.
    await expect(page.getByText('R1 (+Δ): +1000 µε → 350.70 Ω')).toBeVisible();
    await expect(page.getByText('R2 (−Δ): -1000 µε → 349.30 Ω')).toBeVisible();

    await page.getByRole('button', { name: 'Back to reference (0 µε)' }).click();
    await expect(stat(page, 'Balanced?').getByText('Yes')).toBeVisible();
    await expect(page).toHaveURL(/config=full/);
  });
});
