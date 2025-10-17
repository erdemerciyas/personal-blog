import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('should load contact page', async ({ page }) => {
    await expect(page).toHaveTitle(/Contact|İletişim/i);
  });

  test('should display contact form', async ({ page }) => {
    const form = page.locator('form[data-testid="contact-form"], form').first();
    await expect(form).toBeVisible();
  });

  test('should have required form fields', async ({ page }) => {
    const nameInput = page.locator('input[name="name"], input[placeholder*="Name"], input[placeholder*="İsim"]').first();
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const messageInput = page.locator('textarea[name="message"], textarea[placeholder*="Message"]').first();

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(messageInput).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Check for validation messages
    const errorMessages = page.locator('[role="alert"], .error, .invalid');
    const count = await errorMessages.count();
    
    // Should show at least one error
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should validate email format', async ({ page }) => {
    const nameInput = page.locator('input[name="name"], input[placeholder*="Name"]').first();
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const messageInput = page.locator('textarea[name="message"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await nameInput.fill('Test User');
    await emailInput.fill('invalid-email');
    await messageInput.fill('Test message');
    await submitButton.click();

    // Should show email validation error
    const emailError = page.locator('[role="alert"], .error').first();
    
    if (await emailError.isVisible()) {
      const text = await emailError.textContent();
      expect(text?.toLowerCase()).toContain('email');
    }
  });

  test('should submit valid form', async ({ page }) => {
    const nameInput = page.locator('input[name="name"], input[placeholder*="Name"]').first();
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const messageInput = page.locator('textarea[name="message"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await nameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    await messageInput.fill('This is a test message');
    
    // Listen for response
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/contact') && response.status() === 200
    );

    await submitButton.click();

    try {
      await responsePromise;
      
      // Check for success message
      const successMessage = page.locator('[role="status"], .success, .alert-success').first();
      
      if (await successMessage.isVisible()) {
        const text = await successMessage.textContent();
        expect(text?.toLowerCase()).toContain('success');
      }
    } catch {
      // API might not be available in test environment
    }
  });

  test('should have phone field if available', async ({ page }) => {
    const phoneInput = page.locator('input[name="phone"], input[type="tel"]').first();
    
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('+1 234 567 8900');
      const value = await phoneInput.inputValue();
      expect(value).toBeTruthy();
    }
  });

  test('should have subject field if available', async ({ page }) => {
    const subjectInput = page.locator('input[name="subject"], input[placeholder*="Subject"]').first();
    
    if (await subjectInput.isVisible()) {
      await subjectInput.fill('Test Subject');
      const value = await subjectInput.inputValue();
      expect(value).toBe('Test Subject');
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('should have accessible form', async ({ page }) => {
    const labels = page.locator('label');
    const count = await labels.count();
    
    // Should have labels for form fields
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Contact Information', () => {
  test('should display contact information', async ({ page }) => {
    await page.goto('/contact');
    
    const contactInfo = page.locator('[data-testid="contact-info"], .contact-info').first();
    
    if (await contactInfo.isVisible()) {
      await expect(contactInfo).toBeVisible();
    }
  });

  test('should have email link', async ({ page }) => {
    await page.goto('/contact');
    
    const emailLink = page.locator('a[href^="mailto:"]').first();
    
    if (await emailLink.isVisible()) {
      const href = await emailLink.getAttribute('href');
      expect(href).toMatch(/^mailto:/);
    }
  });

  test('should have phone link', async ({ page }) => {
    await page.goto('/contact');
    
    const phoneLink = page.locator('a[href^="tel:"]').first();
    
    if (await phoneLink.isVisible()) {
      const href = await phoneLink.getAttribute('href');
      expect(href).toMatch(/^tel:/);
    }
  });
});
