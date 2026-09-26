import { test, expect, type Page } from '@playwright/test';

/** A stage card in the measurement chain, by its numbered title. */
function stage(page: Page, title: RegExp) {
  return page.getByRole('list', { name: 'The measurement chain' }).getByRole('listitem').filter({
    hasText: title,
  });
}

test.describe('Sensors module', () => {
  test('opens on the LDR at its 100 lx reference point, near mid-scale', async ({ page }) => {
    await page.goto('/sensors?predict=off');
    await expect(page.getByRole('radio', { name: 'LDR (light)' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(stage(page, /Physical quantity/)).toContainText('100 lx');
    await expect(stage(page, /Free electrons/)).toContainText('×1.00');
    await expect(stage(page, /Resistance/)).toContainText('9.90 kΩ');
    await expect(stage(page, /ADC code/)).toContainText('514 / 1023');
    await expect(stage(page, /Measured/)).toContainText('100 lx');
    await expect(page.getByRole('img', { name: /Magnified LDR film/ })).toBeVisible();
    await expect(page.getByRole('img', { name: /Voltage divider: 5 V source/ })).toBeVisible();
  });

  test('infrared, however bright, frees no electrons: the LDR reads dark', async ({ page }) => {
    await page.goto('/sensors?predict=off&lux=10000');
    await expect(stage(page, /Free electrons/)).toContainText('×24.9');
    await page.getByRole('radio', { name: 'Infrared 940 nm' }).click();
    await expect(stage(page, /Free electrons/)).toContainText('×0.010');
    await expect(stage(page, /Free electrons/)).toContainText('photons pass through');
    await expect(stage(page, /Resistance/)).toContainText('1.00 MΩ');
    await expect(stage(page, /Measured/)).toContainText('0.00 lx');
    await expect(page.getByText(/passes straight through/)).toBeVisible();
  });

  test('a warmer thermistor frees more electrons and raises Vout', async ({ page }) => {
    await page.goto('/sensors?predict=off&sensor=ntc');
    await expect(stage(page, /Physical quantity/)).toContainText('25.0 °C');
    await expect(stage(page, /Resistance/)).toContainText('10.0 kΩ');
    await expect(stage(page, /Voltage/)).toContainText('Vout 2.500 V');
    await expect(stage(page, /ADC code/)).toContainText('512 / 1023');

    await page.goto('/sensors?predict=off&sensor=ntc&temp=70');
    await expect(stage(page, /Free electrons/)).toContainText('×5.68');
    await expect(stage(page, /Resistance/)).toContainText('1.76 kΩ');
    await expect(stage(page, /Voltage/)).toContainText('Vout 4.252 V');
    await expect(stage(page, /Measured/)).toContainText('69.9 °C');
  });

  test('Play drives the physical signal; stopping keeps where it got to', async ({ page }) => {
    await page.goto('/sensors?predict=off&sensor=ntc');
    await page.getByRole('button', { name: 'Play' }).click();
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Pause' }).click();
    // The cycle starts cold (−10 °C), so it has moved well away from 25 °C.
    await expect(page).not.toHaveURL(/temp=25(&|$)/);
    await expect(stage(page, /Physical quantity/)).not.toContainText('25.0 °C');
  });

  test('keeps its settings in the URL and has crawlable About text', async ({ page }) => {
    await page.goto('/sensors?predict=off&sensor=ldr&color=red&lux=500&flow=conventional');
    await expect(page.getByRole('radio', { name: 'Red 650 nm' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(page.getByRole('radio', { name: 'Conventional current' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(
      page.getByRole('heading', { level: 2, name: 'About this simulator' })
    ).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/sensors$/);
  });
});
