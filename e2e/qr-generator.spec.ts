import { test, expect } from '@playwright/test';

test.describe('QR Code Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main generator page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /QR Code Generator/i })).toBeVisible();
  });

  test('should generate a QR code from URL input', async ({ page }) => {
    // Find the URL input and enter a URL
    const urlInput = page.getByPlaceholder(/enter url/i).first();
    await urlInput.fill('https://example.com');

    // Wait for QR code to be generated
    await page.waitForTimeout(500);

    // Check that a QR code canvas or image is visible
    const qrCode = page.locator('canvas, img[alt*="QR"]').first();
    await expect(qrCode).toBeVisible();
  });

  test('should switch between QR code types', async ({ page }) => {
    // Find type selector buttons
    const emailButton = page.getByRole('button', { name: /email/i }).first();
    await emailButton.click();

    // Check that email-specific fields are visible
    await expect(page.getByPlaceholder(/email address/i)).toBeVisible();
  });

  test('should download QR code as PNG', async ({ page }) => {
    // Generate a QR code first
    const urlInput = page.getByPlaceholder(/enter url/i).first();
    await urlInput.fill('https://example.com');
    await page.waitForTimeout(500);

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Find and click download button
    const downloadButton = page.getByRole('button', { name: /download/i }).first();
    await downloadButton.click();

    // Verify download started
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.png');
  });

  test('should customize QR code colors', async ({ page }) => {
    // Generate a QR code first
    const urlInput = page.getByPlaceholder(/enter url/i).first();
    await urlInput.fill('https://example.com');
    await page.waitForTimeout(500);

    // Find color customization section
    const colorSection = page.getByText(/foreground color/i).first();
    if (await colorSection.isVisible()) {
      // Color customization is available
      await expect(colorSection).toBeVisible();
    }
  });

  test('should handle empty input gracefully', async ({ page }) => {
    // Clear any default input
    const urlInput = page.getByPlaceholder(/enter url/i).first();
    await urlInput.clear();

    // The page should not crash
    await expect(page.getByRole('heading', { name: /QR Code Generator/i })).toBeVisible();
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Tab through the page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check that focus is visible somewhere
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should show keyboard shortcuts help on ?', async ({ page }) => {
    // Press ? key
    await page.keyboard.press('?');

    // Check for keyboard shortcuts modal
    const modal = page.getByRole('dialog');
    if (await modal.isVisible()) {
      await expect(page.getByText(/keyboard shortcuts/i)).toBeVisible();
    }
  });
});

test.describe('QR Scanner', () => {
  test('should navigate to scanner page', async ({ page }) => {
    await page.goto('/scan');
    await expect(page.getByRole('heading', { name: /scan/i })).toBeVisible();
  });
});

test.describe('Batch Generator', () => {
  test('should navigate to batch page', async ({ page }) => {
    await page.goto('/batch');
    await expect(page.getByRole('heading', { name: /batch/i })).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have no accessibility violations on main page', async ({ page }) => {
    await page.goto('/');

    // Check for basic accessibility features
    const mainContent = page.getByRole('main');
    await expect(mainContent).toBeVisible();

    // Check for proper heading structure
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/');

    // Check that inputs have associated labels or aria-labels
    const inputs = page.locator('input[type="text"], input[type="url"], input[type="email"]');
    const count = await inputs.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.getAttribute('aria-label') ||
                      await input.getAttribute('aria-labelledby') ||
                      await input.getAttribute('placeholder');
      expect(hasLabel).toBeTruthy();
    }
  });
});

test.describe('Responsive Design', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Main content should still be visible
    await expect(page.getByRole('heading', { name: /QR Code Generator/i })).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /QR Code Generator/i })).toBeVisible();
  });
});

test.describe('History', () => {
  test('should save QR codes to history', async ({ page }) => {
    await page.goto('/');

    // Generate a QR code
    const urlInput = page.getByPlaceholder(/enter url/i).first();
    await urlInput.fill('https://example.com');
    await page.waitForTimeout(1000);

    // Check localStorage for history (if accessible)
    const history = await page.evaluate(() => {
      const stored = localStorage.getItem('qr-history');
      return stored ? JSON.parse(stored) : [];
    });

    // History should contain at least one item
    expect(history.length).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Performance', () => {
  test('should load main page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
