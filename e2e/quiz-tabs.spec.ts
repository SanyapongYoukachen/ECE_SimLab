import { test, expect } from '@playwright/test';

const quizTab = /Check your understanding/;

test.describe('module tabs: Explore, then Check your understanding', () => {
  test('opens on Explore with the quiz a tab away, showing its progress', async ({ page }) => {
    await page.goto('/circuits');

    await expect(page.getByRole('tab', { name: 'Explore' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.getByRole('tab', { name: quizTab })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    await expect(page.getByRole('tab', { name: quizTab })).toContainText('0/9');
    await expect(page.getByRole('slider').first()).toBeVisible();
    await expect(page.getByRole('radiogroup', { name: /You double R/ })).toHaveCount(0);
  });

  test('the end-of-explore button opens the check, and the URL remembers it', async ({ page }) => {
    await page.goto('/circuits');
    await page.getByRole('button', { name: 'Start the check →' }).click();

    await expect(page.getByRole('tab', { name: quizTab })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Answered 0 of 9 · 0 correct')).toBeVisible();
    await expect(page).toHaveURL(/view=quiz/);

    await page.reload();
    await expect(page.getByText('Answered 0 of 9 · 0 correct')).toBeVisible();

    await page.getByRole('button', { name: '← Back to explore' }).click();
    await expect(page.getByRole('slider').first()).toBeVisible();
    await expect(page).toHaveURL(/view=explore/);
  });

  test('scores answers as they come, then clears them for a retake', async ({ page }) => {
    await page.goto('/circuits?view=quiz');

    await page
      .getByRole('radiogroup', { name: /You double R/ })
      .getByRole('radio', { name: "It's cut in half" })
      .click();
    await page
      .getByRole('radiogroup', { name: /You double the voltage V/ })
      .getByRole('radio', { name: 'It doubles' })
      .click();

    await expect(page.getByText('Answered 2 of 9 · 1 correct')).toBeVisible();
    await expect(page.getByRole('tab', { name: quizTab })).toContainText('2/9');

    await page.getByRole('button', { name: 'Clear my answers' }).click();
    await expect(page.getByText('Answered 0 of 9 · 0 correct')).toBeVisible();
    await expect(page.getByText(/— correct|— not quite/)).toHaveCount(0);
  });

  test('arrow keys move between the tabs', async ({ page }) => {
    await page.goto('/ac');
    await page.getByRole('tab', { name: 'Explore' }).focus();
    await page.keyboard.press('ArrowRight');

    await expect(page.getByRole('tab', { name: quizTab })).toBeFocused();
    await expect(page.getByRole('tab', { name: quizTab })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText('Answered 0 of');
  });

  test('every module gets the tabs', async ({ page }) => {
    for (const path of ['/convolution', '/fourier', '/ac', '/circuits', '/sensors', '/simulator']) {
      await page.goto(path);
      await expect(page.getByRole('tab', { name: quizTab })).toBeVisible();
    }
  });

  test('?predict=off hides the quiz and its tabs entirely', async ({ page }) => {
    await page.goto('/fourier?predict=off');
    await expect(page.getByRole('tablist', { name: 'Module sections' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Start the check →' })).toHaveCount(0);
  });
});
