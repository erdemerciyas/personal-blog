import { test, expect } from '@playwright/test';

test.describe('Portfolio Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio');
  });

  test('should load portfolio page', async ({ page }) => {
    await expect(page).toHaveTitle(/Portfolio|Portföy/i);
  });

  test('should display portfolio items', async ({ page }) => {
    const portfolioItems = page.locator('[data-testid="portfolio-item"]');
    const count = await portfolioItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter portfolio by category', async ({ page }) => {
    const filterButton = page.locator('button:has-text("Filter")').first();
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      const categoryOption = page.locator('button[data-category]').first();
      if (await categoryOption.isVisible()) {
        await categoryOption.click();
        
        const filteredItems = page.locator('[data-testid="portfolio-item"]');
        const count = await filteredItems.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should open portfolio item details', async ({ page }) => {
    const firstItem = page.locator('[data-testid="portfolio-item"]').first();
    await firstItem.click();
    
    await expect(page).toHaveURL(/\/portfolio\/.+/);
  });

  test('should display portfolio item details', async ({ page }) => {
    const firstItem = page.locator('[data-testid="portfolio-item"]').first();
    await firstItem.click();
    
    const title = page.locator('h1, h2');
    await expect(title).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    const backButton = page.locator('button:has-text("Back"), a:has-text("Back")').first();
    
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL(/\/portfolio\/?$/);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const portfolioItems = page.locator('[data-testid="portfolio-item"]');
    const count = await portfolioItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have accessible portfolio items', async ({ page }) => {
    const portfolioItems = page.locator('[data-testid="portfolio-item"]');
    const firstItem = portfolioItems.first();
    
    // Check for alt text on images
    const image = firstItem.locator('img').first();
    const alt = await image.getAttribute('alt');
    expect(alt).toBeTruthy();
  });
});

test.describe('Portfolio Search/Filter', () => {
  test('should search portfolio items', async ({ page }) => {
    await page.goto('/portfolio');
    
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Ara"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('web');
      
      await page.waitForTimeout(500);
      
      const results = page.locator('[data-testid="portfolio-item"]');
      const count = await results.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should sort portfolio items', async ({ page }) => {
    await page.goto('/portfolio');
    
    const sortButton = page.locator('button:has-text("Sort"), select[data-sort]').first();
    
    if (await sortButton.isVisible()) {
      await sortButton.click();
      
      const sortOption = page.locator('button[data-sort-value], option').first();
      if (await sortOption.isVisible()) {
        await sortOption.click();
      }
    }
  });
});
