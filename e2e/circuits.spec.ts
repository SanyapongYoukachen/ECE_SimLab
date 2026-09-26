import { test, expect, type Page } from '@playwright/test';

function stat(page: Page, label: string) {
  return page.getByText(label, { exact: true }).locator('..');
}

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

test.describe('circuit analysis sections', () => {
  test('Thévenin and Norton equivalents give the load the same current', async ({ page }) => {
    await page.goto('/circuits?predict=off&mode=thevenin');
    await expect(stat(page, 'Thévenin voltage Vth').getByText('6.13 V')).toBeVisible();
    await expect(stat(page, 'Thévenin resistance Rth').getByText('479.9 Ω')).toBeVisible();
    await expect(stat(page, 'Norton current IN').getByText('12.78 mA')).toBeVisible();

    for (const view of ['Original circuit', 'Thévenin equivalent', 'Norton equivalent']) {
      await page.getByRole('radio', { name: view }).click();
      await expect(page.getByRole('img', { name: new RegExp(`Schematic, ${view}`) })).toBeVisible();
      await expect(stat(page, 'Load current IL').getByText('4.14 mA')).toBeVisible();
    }
    await expect(page).toHaveURL(/equiv=norton/);
  });

  test('matching the load to Rth draws the maximum power', async ({ page }) => {
    await page.goto('/circuits?predict=off&mode=thevenin');
    await page.getByRole('button', { name: /Set RL = Rth/ }).click();
    await expect(page).toHaveURL(/rl=480\.0/);
    await expect(stat(page, 'Load power PL').getByText('19.6 mW')).toBeVisible();
    await expect(stat(page, 'Max possible Pmax = Vth²/4Rth').getByText('19.6 mW')).toBeVisible();
    await expect(stat(page, 'Efficiency RL/(Rth+RL)').getByText('50.0 %')).toBeVisible();
  });

  test('mesh and nodal analysis reach the same branch currents', async ({ page }) => {
    await page.goto('/circuits?predict=off&mode=mesh');
    await expect(page.getByText('690·I1 − 470·I2 = 9.00')).toBeVisible();
    await expect(stat(page, 'Mesh current I1 (clockwise)').getByText('14.65 mA')).toBeVisible();
    await expect(stat(page, 'Mesh current I2 (clockwise)').getByText('2.36 mA')).toBeVisible();
    await expect(stat(page, 'Node voltage VA').getByText('5.78 V')).toBeVisible();

    await page.getByRole('radio', { name: 'Node (KCL, node voltages)' }).click();
    await expect(page.getByText(/VA = 5\.78 V/).first()).toBeVisible();
    await expect(page.getByText(/I_R2 = VA\/R2\s+= 12\.29 mA/)).toBeVisible();
    await expect(stat(page, 'I_R1 (V1 → A)').getByText('14.65 mA')).toBeVisible();
  });

  test('a weaker second source is charged: it absorbs power', async ({ page }) => {
    await page.goto('/circuits?predict=off&mode=mesh&voltage=12&v2=1');
    await expect(page.getByText('V2 absorbs (charging)')).toBeVisible();
    await expect(page.getByText('V1 delivers')).toBeVisible();
  });
});
