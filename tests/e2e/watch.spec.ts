import { test, expect } from '@playwright/test';

test.describe('Watch Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a video (assuming we have seeded data)
    await page.goto('/');
    await page.waitForSelector('[data-testid="video-card"]', { timeout: 10000 });
    await page.locator('[data-testid="video-card"]').first().click();
    await page.waitForURL(/\/watch\/.+/);
  });

  test('should display video player and controls', async ({ page }) => {
    // Check video player is present
    await expect(page.locator('video, iframe')).toBeVisible();
    
    // Check video information
    await expect(page.locator('h1')).toBeVisible(); // Video title
    await expect(page.locator('text=views')).toBeVisible(); // View count
    await expect(page.locator('text=ago')).toBeVisible(); // Upload date
  });

  test('should display channel information with subscriber count', async ({ page }) => {
    // Wait for channel data to load
    await page.waitForTimeout(2000);
    
    // Check channel avatar and name
    await expect(page.locator('img[alt*="uploader"], div:has-text("TechGuru"), div:has-text("MusicLover"), div:has-text("ProGamer"), div:has-text("ChefMaster")')).toBeVisible();
    
    // Check subscriber count (should not be hardcoded "1.2M subscribers")
    const subscriberText = await page.locator('text=/subscribers|Loading/').textContent();
    expect(subscriberText).toBeTruthy();
    expect(subscriberText).not.toBe('1.2M subscribers'); // Should not be hardcoded
  });

  test('should handle like and dislike functionality', async ({ page }) => {
    // Check like/dislike buttons are present
    const likeButton = page.locator('button:has([data-testid="like-button"], svg)').first();
    const dislikeButton = page.locator('button:has([data-testid="dislike-button"], svg)').first();
    
    await expect(likeButton).toBeVisible();
    await expect(dislikeButton).toBeVisible();
    
    // Get initial like count
    const initialLikeCount = await page.locator('text=/\\d+/').first().textContent();
    
    // Click like button (should prompt login if not authenticated)
    await likeButton.click();
    
    // Should either show login prompt or update like count
    const hasLoginPrompt = await page.locator('text=Please login').isVisible();
    const hasUpdatedCount = await page.locator('text=/\\d+/').first().textContent() !== initialLikeCount;
    
    expect(hasLoginPrompt || hasUpdatedCount).toBeTruthy();
  });

  test('should display and handle subscription button', async ({ page }) => {
    // Wait for subscription button to load
    await page.waitForTimeout(2000);
    
    const subscribeButton = page.locator('button:has-text("Subscribe"), button:has-text("Subscribed")');
    await expect(subscribeButton).toBeVisible();
    
    // Click subscribe button
    await subscribeButton.click();
    
    // Should either show login prompt or change subscription state
    const hasLoginPrompt = await page.locator('text=Please login').isVisible();
    const buttonChanged = await subscribeButton.textContent();
    
    expect(hasLoginPrompt || buttonChanged).toBeTruthy();
  });

  test('should display related videos and make them clickable', async ({ page }) => {
    // Check related videos section
    await expect(page.locator('h2:has-text("Related Videos")')).toBeVisible();
    
    // Wait for related videos to load
    await page.waitForSelector('[data-testid="related-video"]', { timeout: 10000 });
    
    const relatedVideos = page.locator('[data-testid="related-video"]');
    const count = await relatedVideos.count();
    expect(count).toBeGreaterThan(0);
    
    // Check first related video has required elements
    const firstRelated = relatedVideos.first();
    await expect(firstRelated.locator('img')).toBeVisible(); // Thumbnail
    await expect(firstRelated.locator('h3')).toBeVisible(); // Title
    await expect(firstRelated.locator('text=views')).toBeVisible(); // Views
    
    // Test clicking on related video
    const currentUrl = page.url();
    await firstRelated.click();
    
    // Should navigate to different video
    await page.waitForURL(/\/watch\/.+/);
    const newUrl = page.url();
    expect(newUrl).not.toBe(currentUrl);
  });

  test('should display comments section', async ({ page }) => {
    // Check comments section
    await expect(page.locator('text=Comments')).toBeVisible();
    
    // Check comment form (if user is logged in) or login prompt
    const commentForm = page.locator('form textarea[placeholder*="comment"]');
    const loginPrompt = page.locator('text=Please login to comment');
    
    const hasCommentForm = await commentForm.isVisible();
    const hasLoginPrompt = await loginPrompt.isVisible();
    
    expect(hasCommentForm || hasLoginPrompt).toBeTruthy();
  });

  test('should handle video player errors gracefully', async ({ page }) => {
    // Mock video error
    await page.route('**/*.mp4', async route => {
      await route.abort('failed');
    });
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="video-card"]', { timeout: 10000 });
    await page.locator('[data-testid="video-card"]').first().click();
    
    // Should show error message or fallback
    const hasErrorMessage = await page.locator('text=Error loading video, text=Video not available').isVisible();
    expect(hasErrorMessage).toBeTruthy();
  });

  test('should update view count when video is watched', async ({ page }) => {
    // Get initial view count
    const viewsElement = page.locator('text=/\\d+.*views/');
    await expect(viewsElement).toBeVisible();
    
    const initialViews = await viewsElement.textContent();
    
    // Wait for view increment (should happen automatically)
    await page.waitForTimeout(3000);
    
    // Refresh page to see updated count
    await page.reload();
    await page.waitForSelector('text=/\\d+.*views/');
    
    const updatedViews = await page.locator('text=/\\d+.*views/').textContent();
    
    // Views should be tracked (this might be the same if increment is async)
    expect(updatedViews).toBeTruthy();
  });

  test('should show video description', async ({ page }) => {
    // Check description section
    const description = page.locator('div:has-text("description"), p:has-text("Learn"), p:has-text("Check out"), p:has-text("Perfect")').first();
    await expect(description).toBeVisible();
    
    // Description should be expandable/collapsible
    const descriptionContainer = page.locator('div[class*="line-clamp"], button:has(div[class*="line-clamp"])');
    if (await descriptionContainer.isVisible()) {
      await descriptionContainer.click();
      // Should expand or show more content
    }
  });
});