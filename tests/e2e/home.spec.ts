import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display welcome banner and category filters', async ({ page }) => {
    // Check welcome banner
    await expect(page.locator('h1')).toContainText('Welcome to StreamRush');
    await expect(page.locator('text=Discover amazing content')).toBeVisible();

    // Check category filters
    const categories = ['All', 'Gaming', 'Music', 'Sports', 'News', 'Entertainment', 'Education', 'Technology', 'Travel', 'Cooking'];
    for (const category of categories) {
      await expect(page.locator(`button:has-text("${category}")`)).toBeVisible();
    }
  });

  test('should filter videos by category', async ({ page }) => {
    // Wait for videos to load
    await page.waitForSelector('[data-testid="video-card"]', { timeout: 10000 });
    
    // Get initial video count
    const allVideos = await page.locator('[data-testid="video-card"]').count();
    expect(allVideos).toBeGreaterThan(0);

    // Click on Technology category
    await page.click('button:has-text("Technology")');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check that Technology button is active
    await expect(page.locator('button:has-text("Technology")')).toHaveClass(/from-red-500/);
  });

  test('should display video cards with correct information', async ({ page }) => {
    // Wait for videos to load
    await page.waitForSelector('[data-testid="video-card"]', { timeout: 10000 });
    
    const firstVideo = page.locator('[data-testid="video-card"]').first();
    
    // Check video card elements
    await expect(firstVideo.locator('img')).toBeVisible(); // Thumbnail
    await expect(firstVideo.locator('[data-testid="video-title"]')).toBeVisible();
    await expect(firstVideo.locator('[data-testid="video-uploader"]')).toBeVisible();
    await expect(firstVideo.locator('[data-testid="video-views"]')).toBeVisible();
    await expect(firstVideo.locator('[data-testid="video-date"]')).toBeVisible();
  });

  test('should navigate to video when clicked', async ({ page }) => {
    // Wait for videos to load
    await page.waitForSelector('[data-testid="video-card"]', { timeout: 10000 });
    
    const firstVideo = page.locator('[data-testid="video-card"]').first();
    
    // Click on the video
    await firstVideo.click();
    
    // Should navigate to watch page
    await expect(page).toHaveURL(/\/watch\/.+/);
  });

  test('should show loading state initially', async ({ page }) => {
    // Intercept the API call to delay it
    await page.route('**/videos**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto('/');
    
    // Should show loading spinner
    await expect(page.locator('text=Loading amazing content')).toBeVisible();
  });

  test('should show empty state when no videos match filter', async ({ page }) => {
    // Mock empty response for a specific category
    await page.route('**/videos**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/');
    
    // Click on a category
    await page.click('button:has-text("Gaming")');
    
    // Should show empty state
    await expect(page.locator('text=No Gaming videos found')).toBeVisible();
  });
});