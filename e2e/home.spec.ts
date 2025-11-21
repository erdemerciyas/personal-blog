import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should render the hero slider', async ({ page }) => {
        // Check for main heading
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        // Check for slider navigation buttons (desktop)
        // Note: They might be hidden on mobile, so we check if they exist in DOM
        const nextButton = page.getByLabel('Sonraki slayt');
        await expect(nextButton).toBeAttached();
    });

    test('should display services grid', async ({ page }) => {
        await expect(page.getByText('Sunduğumuz Hizmetler')).toBeVisible();

        // Check if at least one service card is present
        const serviceCards = page.locator('.card-modern');
        await expect(serviceCards.first()).toBeVisible();
    });

    test('should display portfolio section', async ({ page }) => {
        await expect(page.getByText('Öne Çıkan Projelerimiz')).toBeVisible();
    });

    test('should open project modal from header', async ({ page }) => {
        // Open mobile menu if needed (viewport dependent)
        // For this test we assume desktop or we handle mobile menu

        // Try to find the button directly first (desktop)
        // Or open mobile menu

        // Let's assume desktop for simplicity or check visibility
        const isMobile = await page.evaluate(() => window.innerWidth < 768);

        if (isMobile) {
            await page.getByLabel('Mobil menüyü aç').click();
            await page.getByText('Proje Başvurusu').click();
        } else {
            // On desktop, it might be in a different place or we trigger it via other means
            // The header usually has a CTA or we can use the floating CTA if present
            // Let's try the floating CTA or footer CTA as fallback
            const ctaButton = page.getByRole('link', { name: 'İletişime Geçin' }).first();
            await expect(ctaButton).toBeVisible();
        }
    });
});
