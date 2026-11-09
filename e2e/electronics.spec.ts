import { test, expect, type Page } from '@playwright/test';

function stat(page: Page, label: string) {
  return page.getByText(label, { exact: true }).locator('..');
}

test.describe('Electronics module', () => {
  test('the hub links to all four topics', async ({ page }) => {
    await page.goto('/electronics');
    for (const slug of ['pn-junction', 'diode', 'bjt', 'amplifier']) {
      await expect(page.locator(`main a[href="/electronics/${slug}"]`).first()).toBeVisible();
    }
  });

  test('P/N junction: 0.714 V built-in, 0.430 µm wide; reverse bias widens it', async ({
    page,
  }) => {
    await page.goto('/electronics/pn-junction?predict=off');
    await expect(stat(page, 'Built-in potential Vbi').getByText('0.714 V')).toBeVisible();
    await expect(stat(page, 'Depletion width W').getByText('0.430 µm')).toBeVisible();
    await page.goto('/electronics/pn-junction?predict=off&va=-5');
    await expect(stat(page, 'Depletion width W').getByText('1.22 µm')).toBeVisible();
    await expect(page.getByText(/^Reverse bias:/)).toBeVisible();
  });

  test('diode: 10 mA through 430 Ω from 5 V, and the ideal model overestimates', async ({
    page,
  }) => {
    await page.goto('/electronics/diode?predict=off');
    await expect(stat(page, 'Current I').getByText('10.0 mA')).toBeVisible();
    await expect(stat(page, 'Diode voltage VD').getByText('0.700 V')).toBeVisible();
    await page.getByRole('radio', { name: 'Ideal' }).click();
    await expect(stat(page, 'Current I').getByText('11.6 mA')).toBeVisible();
    await page.getByRole('radio', { name: 'Exponential' }).click();
    await page.getByRole('radio', { name: 'Red LED' }).click();
    await expect(page.getByText(/650 nm photon/)).toBeVisible();
  });

  test('BJT: active by default; a smaller base resistor saturates it', async ({ page }) => {
    await page.goto('/electronics/bjt?predict=off');
    await expect(stat(page, 'Region').getByText('Active')).toBeVisible();
    await expect(stat(page, 'Collector current IC').getByText('1.46 mA')).toBeVisible();
    await page.goto('/electronics/bjt?predict=off&rb=22000');
    await expect(stat(page, 'Region').getByText('Saturation')).toBeVisible();
  });

  test('amplifier: gain ≈ −156 bypassed, ≈ −3.1 without; big inputs clip', async ({ page }) => {
    await page.goto('/electronics/amplifier?predict=off');
    await expect(stat(page, 'Small-signal gain Av').getByText(/^-156\.\d/)).toBeVisible();
    await expect(page.getByText(/^Clean amplification/)).toBeVisible();
    await page.getByRole('radio', { name: 'Removed (stable gain)' }).click();
    await expect(stat(page, 'Small-signal gain Av').getByText(/^-3\.1/)).toBeVisible();
    await page.goto('/electronics/amplifier?predict=off&vin=60');
    await expect(page.getByText(/^Clipping at/)).toBeVisible();
  });

  test('switching topics keeps the settings in the URL', async ({ page }) => {
    await page.goto('/electronics/diode?predict=off&vcc=15');
    await page
      .getByRole('navigation', { name: 'Topic', exact: true })
      .getByRole('link', { name: 'CE amplifier' })
      .click();
    await expect(page).toHaveURL(/\/electronics\/amplifier\?.*vcc=15/);
  });
});
