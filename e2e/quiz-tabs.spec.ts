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
    await expect(page.getByText('Question 1 of 9')).toBeVisible();
    await expect(page).toHaveURL(/view=quiz/);

    await page.reload();
    await expect(page.getByText('Question 1 of 9')).toBeVisible();

    await page.getByRole('button', { name: '← Back to explore' }).click();
    await expect(page.getByRole('slider').first()).toBeVisible();
    await expect(page).toHaveURL(/view=explore/);
  });

  test('shows one question at a time, moves on by itself, and scores only at the end', async ({
    page,
  }) => {
    await page.goto('/ac?view=quiz');
    await expect(page.getByRole('radiogroup')).toHaveCount(1);
    await expect(page.getByText('Question 1 of 6')).toBeVisible();

    await page.getByRole('radio', { name: 'About 311 V (220 × √2)' }).click();
    // No verdict yet: straight on to the next question.
    await expect(page.getByText('Question 2 of 6')).toBeVisible();
    await expect(page.getByText(/— correct|— not quite/)).toHaveCount(0);
    await expect(page.getByRole('tab', { name: quizTab })).toContainText('1/6');

    for (let n = 2; n <= 6; n++) {
      await expect(page.getByText(`Question ${n} of 6`)).toBeVisible();
      await page.getByRole('radiogroup').getByRole('radio').first().click();
    }

    await expect(page.getByText('Your result')).toBeVisible();
    await expect(page.getByText(/^\d \/ 6 correct$/)).toBeVisible();
    await expect(page.getByRole('tabpanel').getByRole('listitem')).toHaveCount(6);
    // Question 1 was right; the review marks it and lists the right answer for misses.
    await expect(page.getByRole('tabpanel').getByRole('listitem').first()).toContainText(
      '— correct'
    );
    await expect(page.getByText('Correct answer:').first()).toBeVisible();

    await page.getByRole('button', { name: 'Retake the check' }).click();
    await expect(page.getByText('Question 1 of 6')).toBeVisible();
    await expect(page.getByRole('tab', { name: quizTab })).toContainText('0/6');
  });

  test('Previous changes an answer before finishing, and a reload resumes', async ({ page }) => {
    await page.goto('/ac?view=quiz');
    await page.getByRole('radio', { name: '220 V' }).first().click();
    await expect(page.getByText('Question 2 of 6')).toBeVisible();

    await page.reload();
    await expect(page.getByText('Question 2 of 6')).toBeVisible();

    await page.getByRole('button', { name: '← Previous' }).click();
    await expect(page.getByText('Question 1 of 6')).toBeVisible();
    await expect(page.getByRole('radio', { name: '220 V' }).first()).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await page.getByRole('radio', { name: 'About 311 V (220 × √2)' }).click();
    await expect(page.getByText('Question 2 of 6')).toBeVisible();
    await expect(page.getByRole('tab', { name: quizTab })).toContainText('1/6');
  });

  test('the explore tab offers to continue a check in progress', async ({ page }) => {
    await page.goto('/ac?view=quiz');
    await page.getByRole('radio', { name: '220 V' }).first().click();
    await expect(page.getByText('Question 2 of 6')).toBeVisible();
    await page.getByRole('tab', { name: 'Explore' }).click();
    await expect(
      page.getByText("You're part-way through the check: 1 of 6 answered.")
    ).toBeVisible();
    await page.getByRole('button', { name: 'Continue the check →' }).click();
    await expect(page.getByText('Question 2 of 6')).toBeVisible();
  });

  test('arrow keys move between the tabs', async ({ page }) => {
    await page.goto('/ac');
    await page.getByRole('tab', { name: 'Explore' }).focus();
    await page.keyboard.press('ArrowRight');

    await expect(page.getByRole('tab', { name: quizTab })).toBeFocused();
    await expect(page.getByRole('tab', { name: quizTab })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText('Question 1 of');
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
