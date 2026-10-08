import { test, expect, type Page } from '@playwright/test';

function stat(page: Page, label: string) {
  return page.getByText(label, { exact: true }).locator('..');
}

test.describe('AC circuits module', () => {
  test('opens on the sine wave with Thai mains defaults: 311 V peak ≈ 220 V rms', async ({
    page,
  }) => {
    await page.goto('/ac/sine-wave-rms?predict=off');
    await expect(
      page
        .getByRole('navigation', { name: 'Section', exact: true })
        .getByRole('link', { name: 'Sine wave & RMS' })
    ).toHaveAttribute('aria-current', 'page');
    await expect(stat(page, 'Peak Vp').getByText('311 V')).toBeVisible();
    await expect(stat(page, 'RMS Vrms').getByText('220 V')).toBeVisible();
    await expect(stat(page, 'Period T = 1/f').getByText('20.0 ms')).toBeVisible();
    await expect(page.getByRole('img', { name: /Phasor diagram/ })).toBeVisible();
  });

  test('the √2 rule holds for a sine and fails for a square wave (RMS = peak)', async ({
    page,
  }) => {
    await page.goto('/ac/sine-wave-rms?predict=off&peak=100');
    await expect(page.getByText(/equals Vrms: true for a sine/)).toBeVisible();

    await page.getByRole('radio', { name: 'Square' }).click();
    await expect(stat(page, 'RMS Vrms').getByText('100 V')).toBeVisible();
    await expect(page.getByText(/the √2 rule is sine-only/)).toBeVisible();
    // Phasors describe sinusoids only.
    await expect(page.getByRole('img', { name: /Phasor diagram/ })).toHaveCount(0);
  });

  test('an RL load draws a lagging current; an RC load a leading one', async ({ page }) => {
    await page.goto('/ac/rlc-power-factor?predict=off&load=rl&r=10&l=50&freq=50&vrms=220');
    await expect(stat(page, 'Phase angle θ').getByText('57.5°')).toBeVisible();
    await expect(stat(page, 'Power factor cos θ').getByText('0.537 lagging')).toBeVisible();
    await expect(page.getByText(/current lags voltage by 57\.5°/).first()).toBeVisible();

    await page.getByRole('radio', { name: 'RC', exact: true }).click();
    await expect(stat(page, 'Power factor cos θ').getByText(/leading$/)).toBeVisible();
    await expect(page.getByText(/current leads voltage by/).first()).toBeVisible();
  });

  test('pure L and pure C consume no real power', async ({ page }) => {
    for (const load of ['l', 'c']) {
      await page.goto(`/ac/rlc-power-factor?predict=off&load=${load}`);
      await expect(stat(page, 'Real power P').getByText(/^-?0\.00 W$/)).toBeVisible();
      await expect(
        stat(page, 'Phase angle θ').getByText(load === 'l' ? '90.0°' : '-90.0°')
      ).toBeVisible();
    }
  });

  test('tuning an RLC load to resonance gives unity power factor and Z = R', async ({ page }) => {
    await page.goto('/ac/rlc-power-factor?predict=off&load=rlc&r=10&l=100&c=100&freq=30');
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

test.describe('AC generator and three phase', () => {
  test('opens on the generator: 157 V peak, 50 Hz from 2 poles at 3000 rpm', async ({ page }) => {
    await page.goto('/ac/generator?predict=off');
    await expect(
      page
        .getByRole('navigation', { name: 'Section', exact: true })
        .getByRole('link', { name: 'Generator' })
    ).toHaveAttribute('aria-current', 'page');
    await expect(stat(page, 'Peak EMF').getByText('157 V')).toBeVisible();
    await expect(stat(page, 'RMS EMF').getByText('111 V')).toBeVisible();
    await expect(stat(page, 'Terminal V (rms)').getByText('110 V')).toBeVisible();
    await expect(stat(page, 'Frequency').getByText('50.0 Hz')).toBeVisible();
    await expect(stat(page, 'Load power').getByText('121 W')).toBeVisible();
    await expect(page.getByRole('img', { name: /End view of a 2-pole generator/ })).toBeVisible();
  });

  test('f = P·n/120: more poles, more frequency; the 4-pole preset gets back to 50 Hz', async ({
    page,
  }) => {
    await page.goto('/ac/generator?predict=off');
    await page.getByRole('combobox', { name: 'Poles' }).selectOption('4');
    await expect(stat(page, 'Frequency').getByText('100.0 Hz')).toBeVisible();
    await page.getByRole('combobox', { name: 'Preset' }).selectOption('four');
    await expect(stat(page, 'Frequency').getByText('50.0 Hz')).toBeVisible();
    await expect(page).toHaveURL(/poles=4/);
    await expect(page).toHaveURL(/rpm=1500/);
  });

  test('pause, step the rotor, and show the calculations', async ({ page }) => {
    await page.goto('/ac/generator?predict=off');
    await page.getByRole('button', { name: 'Pause' }).click();
    await page.getByRole('button', { name: '+15° ▶' }).click();
    await page.getByRole('button', { name: 'Show calculations' }).click();
    await expect(page.getByText(/f = P·n\/120 = 2·3000\/120 = 50\.00 Hz/)).toBeVisible();
    await expect(page.getByText(/Emax = 0\.500·314\.2 = 157\.1 V/)).toBeVisible();
  });

  test('three phase: 230 V phase gives 398 V line, and a balanced star has no neutral current', async ({
    page,
  }) => {
    await page.goto('/ac/three-phase?predict=off');
    await expect(stat(page, 'Phase voltage (line–neutral)').getByText('230 V')).toBeVisible();
    await expect(stat(page, 'Line voltage (line–line)').getByText('398 V')).toBeVisible();
    await expect(stat(page, 'Neutral current').getByText('0.00 mA')).toBeVisible();
    await expect(page.getByText(/total power p\(t\) is a flat line/)).toBeVisible();
  });

  test('an unbalanced star sends current down the neutral', async ({ page }) => {
    await page.goto('/ac/three-phase?predict=off&unb=0.5');
    await expect(page.getByText(/^Unbalanced:/)).toBeVisible();
    await expect(stat(page, 'Neutral current').getByText(/^\d+\.\d+ A$/)).toBeVisible();
    await page.getByRole('button', { name: 'Balance the load' }).click();
    await expect(stat(page, 'Neutral current').getByText('0.00 mA')).toBeVisible();
  });

  test('delta: loads see the line voltage and line current is √3 × load current', async ({
    page,
  }) => {
    await page.goto('/ac/three-phase?predict=off&xph=0');
    await page.getByRole('radio', { name: 'Delta (Δ)' }).click();
    // 398 V across 20 Ω = 19.9 A in each load; √3 × that in each line.
    await expect(stat(page, 'Load current (phase A)').getByText('19.9 A')).toBeVisible();
    await expect(stat(page, 'Line current (A)').getByText('34.5 A')).toBeVisible();
    await expect(stat(page, 'Neutral current').getByText('—')).toBeVisible();
  });
});
