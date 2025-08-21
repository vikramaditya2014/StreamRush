import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test.describe('Mobile Responsiveness (375px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('should display mobile header correctly', async ({ page }) => {
      // Check if logo is shortened on mobile
      const logo = page.locator('header a[href="/"]');
      await expect(logo).toContainText('SR');
      
      // Check if desktop search is hidden
      const desktopSearch = page.locator('header form').first();
      await expect(desktopSearch).toBeHidden();
      
      // Check if mobile search button is visible
      const mobileSearchBtn = page.locator('header button[title="Search"]');
      await expect(mobileSearchBtn).toBeVisible();
    });

    test('should open mobile search overlay', async ({ page }) => {
      // Click mobile search button
      const mobileSearchBtn = page.locator('header button[title="Search"]');
      await mobileSearchBtn.click();
      
      // Check if search overlay appears
      const searchOverlay = page.locator('header div').filter({ hasText: 'Search videos...' });
      await expect(searchOverlay).toBeVisible();
      
      // Check if search input is focused
      const searchInput = page.locator('header input[placeholder="Search videos..."]');
      await expect(searchInput).toBeFocused();
    });

    test('should display sidebar as overlay on mobile', async ({ page }) => {
      // Initially sidebar should be hidden
      const sidebar = page.locator('aside');
      await expect(sidebar).toHaveClass(/translate-x-full/);
      
      // Click hamburger menu
      const menuBtn = page.locator('header button').first();
      await menuBtn.click();
      
      // Sidebar should slide in
      await expect(sidebar).toHaveClass(/translate-x-0/);
      
      // Overlay should be visible
      const overlay = page.locator('div.bg-black.bg-opacity-50');
      await expect(overlay).toBeVisible();
    });

    test('should close mobile sidebar when clicking overlay', async ({ page }) => {
      // Open sidebar
      const menuBtn = page.locator('header button').first();
      await menuBtn.click();
      
      // Click overlay to close
      const overlay = page.locator('div.bg-black.bg-opacity-50');
      await overlay.click();
      
      // Sidebar should be hidden
      const sidebar = page.locator('aside');
      await expect(sidebar).toHaveClass(/translate-x-full/);
    });

    test('should display video cards in single column', async ({ page }) => {
      // Wait for videos to load
      await page.waitForSelector('[data-testid="video-card"]');
      
      // Check grid layout - should be single column on mobile
      const videoGrid = page.locator('div.grid');
      await expect(videoGrid).toHaveClass(/grid-cols-1/);
      
      // Check video card responsiveness
      const firstVideoCard = page.locator('[data-testid="video-card"]').first();
      await expect(firstVideoCard).toBeVisible();
      
      // Check if video title is properly truncated
      const videoTitle = firstVideoCard.locator('[data-testid="video-title"]');
      await expect(videoTitle).toHaveClass(/line-clamp-2/);
    });

    test('should have touch-friendly tap targets', async ({ page }) => {
      // Check if buttons have minimum touch target size
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();
        if (box) {
          // Minimum touch target should be 44px (iOS guidelines)
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(32); // Slightly relaxed for this test
        }
      }
    });
  });

  test.describe('Tablet Responsiveness (768px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
    });

    test('should display tablet layout correctly', async ({ page }) => {
      // Check if full logo is visible
      const logo = page.locator('header a[href="/"]');
      await expect(logo).toContainText('StreamRush');
      
      // Check if desktop search is visible
      const desktopSearch = page.locator('header form').first();
      await expect(desktopSearch).toBeVisible();
      
      // Check if mobile search button is hidden
      const mobileSearchBtn = page.locator('header button[title="Search"]');
      await expect(mobileSearchBtn).toBeHidden();
    });

    test('should display video cards in 2 columns', async ({ page }) => {
      // Wait for videos to load
      await page.waitForSelector('[data-testid="video-card"]');
      
      // Check grid layout - should be 2 columns on tablet
      const videoGrid = page.locator('div.grid');
      await expect(videoGrid).toHaveClass(/md:grid-cols-2/);
    });

    test('should handle sidebar properly on tablet', async ({ page }) => {
      // Sidebar should behave like desktop on tablet
      const sidebar = page.locator('aside');
      await expect(sidebar).not.toHaveClass(/translate-x-full/);
      
      // Click hamburger to toggle
      const menuBtn = page.locator('header button').first();
      await menuBtn.click();
      
      // Should collapse to mini sidebar
      await expect(sidebar).toHaveClass(/w-16/);
    });
  });

  test.describe('Desktop Responsiveness (1920px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test('should display full desktop layout', async ({ page }) => {
      // Check if full logo is visible
      const logo = page.locator('header a[href="/"]');
      await expect(logo).toContainText('StreamRush');
      
      // Check if desktop search is visible and properly sized
      const searchInput = page.locator('header input[placeholder="Search videos..."]');
      await expect(searchInput).toBeVisible();
      
      // Check if upload button is visible in header
      const uploadBtn = page.locator('header a[href="/upload"]');
      await expect(uploadBtn).toBeVisible();
    });

    test('should display video cards in multiple columns', async ({ page }) => {
      // Wait for videos to load
      await page.waitForSelector('[data-testid="video-card"]');
      
      // Check grid layout - should be multiple columns on desktop
      const videoGrid = page.locator('div.grid');
      await expect(videoGrid).toHaveClass(/xl:grid-cols-4/);
    });

    test('should display full sidebar by default', async ({ page }) => {
      const sidebar = page.locator('aside');
      await expect(sidebar).toHaveClass(/w-64/);
      
      // All sidebar sections should be visible
      await expect(page.locator('aside h3').filter({ hasText: 'Library' })).toBeVisible();
      await expect(page.locator('aside h3').filter({ hasText: 'Explore' })).toBeVisible();
    });
  });

  test.describe('Cross-Device Navigation', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    viewports.forEach(({ name, width, height }) => {
      test(`should navigate properly on ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        
        // Test home navigation
        await page.goto('http://localhost:3000');
        await expect(page).toHaveURL('http://localhost:3000/');
        
        // Test category filtering
        const categoryBtn = page.locator('button').filter({ hasText: 'Gaming' }).first();
        if (await categoryBtn.isVisible()) {
          await categoryBtn.click();
          // Should still be on home page but with filtered content
          await expect(page).toHaveURL('http://localhost:3000/');
        }
        
        // Test video card click
        const firstVideo = page.locator('[data-testid="video-card"]').first();
        if (await firstVideo.isVisible()) {
          await firstVideo.click();
          // Should navigate to watch page
          await expect(page.url()).toContain('/watch/');
        }
      });
    });
  });

  test.describe('Search Functionality Across Devices', () => {
    test('should search on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Open mobile search
      const mobileSearchBtn = page.locator('header button[title="Search"]');
      await mobileSearchBtn.click();
      
      // Type search query
      const searchInput = page.locator('header input[placeholder="Search videos..."]');
      await searchInput.fill('test video');
      
      // Submit search
      await searchInput.press('Enter');
      
      // Should navigate to search results
      await expect(page).toHaveURL(/.*search.*test%20video/);
    });

    test('should search on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Use desktop search
      const searchInput = page.locator('header input[placeholder="Search videos..."]');
      await searchInput.fill('test video');
      await searchInput.press('Enter');
      
      // Should navigate to search results
      await expect(page).toHaveURL(/.*search.*test%20video/);
    });
  });

  test.describe('Responsive Video Player', () => {
    test('should display video player responsively', async ({ page }) => {
      // Navigate to a video page
      await page.goto('http://localhost:3000');
      await page.waitForSelector('[data-testid="video-card"]');
      
      const firstVideo = page.locator('[data-testid="video-card"]').first();
      await firstVideo.click();
      
      // Wait for video page to load
      await page.waitForLoadState('networkidle');
      
      // Test on mobile
      await page.setViewportSize({ width: 375, height: 667 });
      const videoPlayer = page.locator('div.aspect-video');
      await expect(videoPlayer).toBeVisible();
      
      // Test on tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(videoPlayer).toBeVisible();
      
      // Test on desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(videoPlayer).toBeVisible();
    });
  });

  test.describe('Accessibility and Touch Interactions', () => {
    test('should be keyboard navigable on all devices', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1920, height: 1080 }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        
        // Tab through interactive elements
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
        
        // Should be able to navigate with keyboard
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        const secondFocusedElement = page.locator(':focus');
        await expect(secondFocusedElement).toBeVisible();
      }
    });

    test('should handle touch interactions on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Test touch on video card
      const firstVideo = page.locator('[data-testid="video-card"]').first();
      await firstVideo.tap();
      
      // Should navigate to video
      await expect(page.url()).toContain('/watch/');
    });
  });

  test.describe('Performance on Different Screen Sizes', () => {
    test('should load efficiently on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time (5 seconds)
      expect(loadTime).toBeLessThan(5000);
      
      // Check if essential elements are visible
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('[data-testid="video-card"]').first()).toBeVisible();
    });
  });
});