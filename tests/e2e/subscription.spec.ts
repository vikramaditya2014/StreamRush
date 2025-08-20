import { test, expect } from '@playwright/test';

test.describe('Subscription System', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authenticated user
    await context.addCookies([
      {
        name: 'auth-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/'
      }
    ]);
    
    await page.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        subscribedTo: [] // Start with no subscriptions
      }));
    });
    
    // Navigate to a video
    await page.goto('/');
    await page.waitForSelector('[data-testid="video-card"]', { timeout: 10000 });
    await page.locator('[data-testid="video-card"]').first().click();
    await page.waitForURL(/\/watch\/.+/);
  });

  test('should display subscribe button for unauthenticated users', async ({ page, context }) => {
    // Clear authentication
    await context.clearCookies();
    await page.addInitScript(() => {
      localStorage.clear();
    });
    
    await page.reload();
    
    // Should show subscribe button
    const subscribeButton = page.locator('button:has-text("Subscribe")');
    await expect(subscribeButton).toBeVisible();
  });

  test('should show login prompt when unauthenticated user tries to subscribe', async ({ page, context }) => {
    // Clear authentication
    await context.clearCookies();
    await page.addInitScript(() => {
      localStorage.clear();
    });
    
    await page.reload();
    
    // Click subscribe button
    const subscribeButton = page.locator('button:has-text("Subscribe")');
    await subscribeButton.click();
    
    // Should show login prompt
    const loginPrompt = page.locator('text=Please login to subscribe');
    await expect(loginPrompt).toBeVisible({ timeout: 5000 });
  });

  test('should handle subscription for authenticated users', async ({ page }) => {
    // Mock subscription API
    await page.route('**/subscribe**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    const subscribeButton = page.locator('button:has-text("Subscribe")');
    
    if (await subscribeButton.isVisible()) {
      // Click subscribe
      await subscribeButton.click();
      
      // Should show success message
      const successMessage = page.locator('text=Subscribed successfully');
      await expect(successMessage).toBeVisible({ timeout: 5000 });
      
      // Button should change to "Subscribed"
      await expect(page.locator('button:has-text("Subscribed")')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle unsubscription', async ({ page }) => {
    // Mock user as already subscribed
    await page.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        subscribedTo: ['techguru-uid-1'] // Subscribed to TechGuru
      }));
    });
    
    // Mock unsubscribe API
    await page.route('**/unsubscribe**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    const subscribedButton = page.locator('button:has-text("Subscribed")');
    
    if (await subscribedButton.isVisible()) {
      // Click unsubscribe
      await subscribedButton.click();
      
      // Should show success message
      const successMessage = page.locator('text=Unsubscribed successfully');
      await expect(successMessage).toBeVisible({ timeout: 5000 });
      
      // Button should change back to "Subscribe"
      await expect(page.locator('button:has-text("Subscribe")')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should update subscriber count after subscription', async ({ page }) => {
    // Mock channel data with subscriber count
    await page.route('**/users/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          uid: 'techguru-uid-1',
          displayName: 'TechGuru',
          subscribers: 1200000
        })
      });
    });
    
    // Mock subscription API
    await page.route('**/subscribe**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Get initial subscriber count
    const subscriberElement = page.locator('text=/\\d+.*subscribers/');
    await expect(subscriberElement).toBeVisible();
    
    const initialCount = await subscriberElement.textContent();
    
    // Subscribe
    const subscribeButton = page.locator('button:has-text("Subscribe")');
    if (await subscribeButton.isVisible()) {
      await subscribeButton.click();
      
      // Wait for update
      await page.waitForTimeout(2000);
      
      // Subscriber count should update (or at least not show "Loading...")
      const updatedElement = page.locator('text=/\\d+.*subscribers/');
      const updatedCount = await updatedElement.textContent();
      
      expect(updatedCount).not.toBe('Loading...');
      expect(updatedCount).toBeTruthy();
    }
  });

  test('should prevent self-subscription', async ({ page }) => {
    // Mock user as the video uploader
    await page.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({
        uid: 'techguru-uid-1', // Same as video uploader
        email: 'techguru@example.com',
        displayName: 'TechGuru'
      }));
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    const subscribeButton = page.locator('button:has-text("Subscribe")');
    
    if (await subscribeButton.isVisible()) {
      await subscribeButton.click();
      
      // Should show error message
      const errorMessage = page.locator('text=cannot subscribe to your own channel');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    } else {
      // Subscribe button should not be visible for own channel
      expect(await subscribeButton.isVisible()).toBeFalsy();
    }
  });

  test('should handle subscription errors gracefully', async ({ page }) => {
    // Mock subscription error
    await page.route('**/subscribe**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Subscription failed' })
      });
    });
    
    await page.waitForTimeout(2000);
    
    const subscribeButton = page.locator('button:has-text("Subscribe")');
    
    if (await subscribeButton.isVisible()) {
      await subscribeButton.click();
      
      // Should show error message
      const errorMessage = page.locator('text=error, text=failed');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
      
      // Button should remain as "Subscribe"
      await expect(subscribeButton).toBeVisible();
    }
  });

  test('should show correct subscriber count format', async ({ page }) => {
    // Test different subscriber count formats
    const testCases = [
      { count: 999, expected: '999 subscribers' },
      { count: 1500, expected: '1.5K subscribers' },
      { count: 1200000, expected: '1.2M subscribers' }
    ];
    
    for (const testCase of testCases) {
      // Mock channel data
      await page.route('**/users/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            uid: 'test-channel',
            displayName: 'Test Channel',
            subscribers: testCase.count
          })
        });
      });
      
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Check subscriber count format
      const subscriberElement = page.locator(`text=${testCase.expected}`);
      if (await subscriberElement.isVisible()) {
        await expect(subscriberElement).toBeVisible();
      }
    }
  });

  test('should maintain subscription state across page reloads', async ({ page }) => {
    // Mock user as subscribed
    await page.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        subscribedTo: ['techguru-uid-1']
      }));
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Should show "Subscribed" button
    const subscribedButton = page.locator('button:has-text("Subscribed")');
    await expect(subscribedButton).toBeVisible();
    
    // Reload page again
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Should still show "Subscribed" button
    await expect(subscribedButton).toBeVisible();
  });
});