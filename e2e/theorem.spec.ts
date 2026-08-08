import { test, expect } from '@playwright/test';

test.describe('convolution theorem module', () => {
  test('direct and FFT paths agree to within a tiny error', async ({ page }) => {
    await page.goto('/theorem?predict=off');

    const errorText = await page.getByText(/max \|direct/).textContent();
    const match = errorText?.match(/=\s*([\d.e+-]+)/);
    expect(match).not.toBeNull();
    const error = Number(match?.[1]);
    expect(error).toBeLessThan(1e-6);
  });

  test('operation counts reflect N*M vs N log N and change with the length slider', async ({
    page,
  }) => {
    await page.goto('/theorem?predict=off&length=64');

    const before = await page.getByText('4,096').first().textContent();
    expect(before).toBe('4,096'); // 64 * 64

    // React-controlled range inputs need the native value setter + a real
    // 'input' event — Locator.fill() does not reliably drive them.
    const slider = page.getByRole('slider', { name: /Signal length/ });
    await slider.evaluate((el: HTMLInputElement, value: string) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, '256');

    await expect(page.getByText('65,536').first()).toBeVisible(); // 256 * 256
  });

  test('changing the signal preset keeps the two paths in agreement', async ({ page }) => {
    await page.goto('/theorem?predict=off');
    await page.getByRole('radio', { name: 'Pulse' }).click();

    const errorText = await page.getByText(/max \|direct/).textContent();
    const match = errorText?.match(/=\s*([\d.e+-]+)/);
    const error = Number(match?.[1]);
    expect(error).toBeLessThan(1e-6);
  });
});
