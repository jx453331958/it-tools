import { test, expect } from '@playwright/test';

test.describe('Tool - Lottery tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lottery-tool');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Lottery tool - IT Tools');
  });

  test('', async ({ page }) => {

  });
});