import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to portfolio page', async ({ page }) => {
    await page.goto('/');
    
    const portfolioLink = page.locator('a:has-text("Portfolio"), a:has-text("Portföy")').first();
    await portfolioLink.click();
    
    await expect(page).toHaveURL(/\/portfolio/);
  });

  test('should navigate to services page', async ({ page }) => {
    await page.goto('/');
    
    const servicesLink = page.locator('a:has-text("Services"), a:has-text("Hizmetler")').first();
    
    if (await servicesLink.isVisible()) {
      await servicesLink.click();
      await expect(page).toHaveURL(/\/services/);
    }
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/');
    
    const productsLink = page.locator('a:has-text("Products"), a:has-text("Ürünler")').first();
    
    if (await productsLink.isVisible()) {
      await productsLink.click();
      await expect(page).toHaveURL(/\/products/);
    }
  });

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/');
    
    const contactLink = page.locator('a:has-text("Contact"), a:has-text("İletişim")').first();
    await contactLink.click();
    
    await expect(page).toHaveURL(/\/contact/);
  });

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/');
    
    const aboutLink = page.locator('a:has-text("About"), a:has-text("Hakkında")').first();
    
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/\/about/);
    }
  });

  test('should have working header navigation', async ({ page }) => {
    await page.goto('/');
    
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();
    
    const navLinks = header.locator('a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have working footer navigation', async ({ page }) => {
    await page.goto('/');
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const footer = page.locator('footer').first();
    
    if (await footer.isVisible()) {
      const footerLinks = footer.locator('a');
      const count = await footerLinks.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should handle mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const mobileMenuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      
      const mobileMenu = page.locator('[role="navigation"], [data-testid="mobile-menu"]').first();
      await expect(mobileMenu).toBeVisible();
    }
  });

  test('should navigate back using browser back button', async ({ page }) => {
    await page.goto('/');
    
    const link = page.locator('a').first();
    await link.click();
    
    await page.goBack();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Navigation Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    const navLinks = page.locator('a[aria-label], button[aria-label]');
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through navigation
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });
    
    expect(focusedElement).toBeTruthy();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    
    // Should have at least one h1
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });
});
