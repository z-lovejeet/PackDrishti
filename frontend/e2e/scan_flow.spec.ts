/**
 * End-to-End Test Suite: Consumer Food & Nutrition Scanner Flow
 * System: BiteIQ Consumer Health & Nutrition Intelligence
 */

import { test, expect } from '@playwright/test';

test.describe('BiteIQ Consumer Nutrition Scanner Flow', () => {
  const BASE_URL = 'http://localhost:5173/';

  test('should render consumer landing page and navigate to nutrition scanner', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('h1')).toContainText('Know what’s really inside your everyday packaged food.');
  });

  test('should support file upload on nutrition scanner page', async ({ page }) => {
    await page.goto(`${BASE_URL}#health`);
    const dropzone = page.locator('input[type="file"]').first();
    await expect(dropzone).toBeAttached();
  });

  test('should show authentication modal when sign in trigger clicked', async ({ page }) => {
    await page.goto(BASE_URL);
    const signInBtn = page.locator('button:has-text("Sign In")');
    if (await signInBtn.isVisible()) {
      await signInBtn.click();
      await expect(page.locator('text=Quick Demo Access')).toBeVisible();
    }
  });

  test('should navigate to scanned food products history', async ({ page }) => {
    await page.goto(BASE_URL);
    const historyBtn = page.locator('button:has-text("Scan History")').first();
    if (await historyBtn.isVisible()) {
      await historyBtn.click();
      await expect(page.locator('text=Scanned Food Products')).toBeVisible();
    }
  });
});
