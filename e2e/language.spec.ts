import { test, expect } from '@playwright/test';

test.describe('language toggle (English ↔ Thai)', () => {
  test('defaults to English for an English browser', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Circuit simulators and signal graphs, made visible',
      })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch language to Thai' })).toHaveText('ไทย');
  });

  test('switches the landing page to Thai, remembers it, and carries it into a module', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Switch language to Thai' }).click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'th');
    await expect(
      page.getByRole('heading', { level: 1, name: 'จำลองวงจรและกราฟสัญญาณ ที่มองเห็นได้' })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'คอนโวลูชัน', exact: true })).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole('heading', { level: 1, name: 'จำลองวงจรและกราฟสัญญาณ ที่มองเห็นได้' })
    ).toBeVisible();

    await page.getByRole('link', { name: 'จำลองวงจร' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'จำลองวงจร' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ปรับบริดจ์ให้สมดุล (หาค่า R4)' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /ทบทวนความเข้าใจ/ })).toBeVisible();
  });

  test('switches a module live, without a reload, and back again', async ({ page }) => {
    await page.goto('/circuits?predict=off');
    await expect(page.getByRole('slider', { name: 'Source voltage V' })).toBeVisible();

    await page.getByRole('button', { name: 'Switch language to Thai' }).click();
    await expect(page.getByRole('slider', { name: 'แรงดันแหล่งจ่าย V' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'กฎของโอห์ม' })).toBeVisible();

    await page.getByRole('button', { name: 'เปลี่ยนเป็นภาษาอังกฤษ' }).click();
    await expect(page.getByRole('slider', { name: 'Source voltage V' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('the URL state survives a language switch', async ({ page }) => {
    await page.goto('/simulator?predict=off&r1=300&r2=100&r3=100&r4=150');
    await page.getByRole('button', { name: 'Switch language to Thai' }).click();
    await expect(page).toHaveURL(/r1=300/);
    await expect(page.getByText(/^R1·R4 = 45\.00 kΩ/)).toBeVisible();
  });
});

test.describe('Thai browser', () => {
  test.use({ locale: 'th-TH' });

  test('opens in Thai by default when the browser prefers Thai', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'th');
    await expect(
      page.getByRole('heading', { level: 1, name: 'จำลองวงจรและกราฟสัญญาณ ที่มองเห็นได้' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'เปลี่ยนเป็นภาษาอังกฤษ' })).toHaveText('English');
  });
});
