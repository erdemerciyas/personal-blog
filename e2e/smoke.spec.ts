import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Personal Blog|Erdem/);
    
    // Check if page loads without errors
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have basic navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check if there are any navigation links
    const links = page.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    
    // Allow some time for any async errors
    await page.waitForTimeout(2000);
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('net::ERR_')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});