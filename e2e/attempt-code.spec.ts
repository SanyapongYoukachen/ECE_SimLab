import { test, expect } from '@playwright/test';

test.describe('attempt codes', () => {
  test('a finished check shows its time log and a code that verifies only for its name', async ({
    page,
  }) => {
    await page.goto('/circuits/ohms-law?view=quiz');
    const count = Number(
      (await page.getByText(/^Question 1 of \d+$/).textContent())?.match(/of (\d+)/)?.[1]
    );
    for (let n = 1; n <= count; n++) {
      await expect(page.getByText(`Question ${n} of ${count}`)).toBeVisible();
      await page.getByRole('radiogroup').getByRole('radio').first().click();
    }
    await expect(page.getByText('Your result')).toBeVisible();
    await expect(page.getByText('Started', { exact: true })).toBeVisible();
    await expect(page.getByText('Time taken', { exact: true })).toBeVisible();

    await page.getByLabel(/Your name or student ID/).fill('Somchai 6510001');
    const code = (await page.getByTestId('attempt-code').textContent()) ?? '';
    expect(code).toMatch(/^[0-9A-Z]{6}-[0-9A-Z]{6}-[0-9A-Z]{6}$/);

    // The name persists, and the code follows it.
    await page.reload();
    await expect(page.getByLabel(/Your name or student ID/)).toHaveValue('Somchai 6510001');
    await expect(page.getByTestId('attempt-code')).toHaveText(code);

    await page.goto(`/verify?code=${code}`);
    await page.getByLabel(/name or ID/).fill('somchai 6510001');
    await expect(page.getByText(/Genuine/)).toBeVisible();
    await expect(page.getByText('DC circuits')).toBeVisible();
    await expect(page.getByText(new RegExp(`/ ${count} correct`))).toBeVisible();

    await page.getByLabel(/name or ID/).fill('Somsak 6510002');
    await expect(page.getByText('✗ Does not match')).toBeVisible();
  });

  test('retaking clears the old attempt', async ({ page }) => {
    await page.goto('/ac/generator?view=quiz');
    for (let n = 1; n <= 9; n++) {
      await page.getByRole('radiogroup').getByRole('radio').first().click();
      if (n < 9) await expect(page.getByText(`Question ${n + 1} of 9`)).toBeVisible();
    }
    const first = await page.getByTestId('attempt-code').textContent();
    await page.getByRole('button', { name: 'Retake the check' }).click();
    for (let n = 1; n <= 9; n++) {
      await page.getByRole('radiogroup').getByRole('radio').first().click();
      if (n < 9) await expect(page.getByText(`Question ${n + 1} of 9`)).toBeVisible();
    }
    await expect(page.getByTestId('attempt-code')).not.toHaveText(first ?? '');
  });

  test('the verify page rejects text that is not a code', async ({ page }) => {
    await page.goto('/verify');
    await page.getByLabel('Attempt code').fill('hello');
    await expect(page.getByText(/isn’t an attempt code/)).toBeVisible();
  });
});
