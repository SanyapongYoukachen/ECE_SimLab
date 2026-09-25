import { test, expect, type Page } from '@playwright/test';

function stat(page: Page, label: string) {
  return page.getByText(label, { exact: true }).locator('..');
}

test.describe('AC circuits module', () => {
  test('opens on the sine wave with Thai mains defaults: 311 V peak ≈ 220 V rms', async ({
    page,
  }) => {
    await page.goto('/ac?predict=off');
    await expect(page.getByRole('radio', { name: 'Sine wave & RMS' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await expect(stat(page, 'Peak Vp').getByText('311 V')).toBeVisible();
    await expect(stat(page, 'RMS Vrms').getByText('220 V')).toBeVisible();
    await expect(stat(page, 'Period T = 1/f').getByText('20.0 ms')).toBeVisible();
    await expect(page.getByRole('img', { name: /Phasor diagram/ })).toBeVisible();
  });

  test('the √2 rule holds for a sine and fails for a square wave (RMS = peak)', async ({
    page,
  }) => {
    await page.goto('/ac?predict=off&peak=100');
    await expect(page.getByText(/equals Vrms: true for a sine/)).toBeVisible();

    await page.getByRole('radio', { name: 'Square' }).click();
    await expect(stat(page, 'RMS Vrms').getByText('100 V')).toBeVisible();
    await expect(page.getByText(/the √2 rule is sine-only/)).toBeVisible();
    // Phasors describe sinusoids only.
    await expect(page.getByRole('img', { name: /Phasor diagram/ })).toHaveCount(0);
  });

  test('an RL load draws a lagging current; an RC load a leading one', async ({ page }) => {
    await page.goto('/ac?predict=off&mode=load&load=rl&r=10&l=50&freq=50&vrms=220');
    await expect(stat(page, 'Phase angle θ').getByText('57.5°')).toBeVisible();
    await expect(stat(page, 'Power factor cos θ').getByText('0.537 lagging')).toBeVisible();
    await expect(page.getByText(/current lags voltage by 57\.5°/).first()).toBeVisible();

    await page.getByRole('radio', { name: 'RC', exact: true }).click();
    await expect(stat(page, 'Power factor cos θ').getByText(/leading$/)).toBeVisible();
    await expect(page.getByText(/current leads voltage by/).first()).toBeVisible();
  });

  test('pure L and pure C consume no real power', async ({ page }) => {
    for (const load of ['l', 'c']) {
      await page.goto(`/ac?predict=off&mode=load&load=${load}`);
      await expect(stat(page, 'Real power P').getByText(/^-?0\.00 W$/)).toBeVisible();
      await expect(
        stat(page, 'Phase angle θ').getByText(load === 'l' ? '90.0°' : '-90.0°')
      ).toBeVisible();
    }
  });

  test('tuning an RLC load to resonance gives unity power factor and Z = R', async ({ page }) => {
    await page.goto('/ac?predict=off&mode=load&load=rlc&r=10&l=100&c=100&freq=30');
    await expect(stat(page, 'Power factor cos θ').getByText(/leading$/)).toBeVisible();

    await page.getByRole('button', { name: /Tune to resonance \(50\.3 Hz\)/ }).click();
    await expect(stat(page, 'Power factor cos θ').getByText('1.000 unity')).toBeVisible();
    await expect(stat(page, '|Z|').getByText('10.0 Ω')).toBeVisible();
    await expect(page).toHaveURL(/freq=50\.32/);
  });

  test('the old /theorem address redirects to AC circuits', async ({ page }) => {
    await page.goto('/theorem');
    await expect(page).toHaveURL(/\/ac/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('AC circuits');
  });
});
