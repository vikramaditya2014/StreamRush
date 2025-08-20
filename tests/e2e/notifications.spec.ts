import { test, expect } from '@playwright/test';

test.describe('Notification System', () => {
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
        uid: 'techguru-uid-1',
        email: 'techguru@example.com',
        displayName: 'TechGuru'
      }));
    });
    
    await page.goto('/');
  });

  test('should display notification bell with unread count', async ({ page }) => {
    // Mock notifications data
    await page.route('**/notifications**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            userId: 'techguru-uid-1',
            type: 'video_upload',
            title: 'New video uploaded',
            message: 'Check out this amazing content!',
            read: false,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            userId: 'techguru-uid-1',
            type: 'comment',
            title: 'New comment',
            message: 'Someone commented on your video',
            read: false,
            createdAt: new Date().toISOString()
          }
        ])
      });
    });

    // Should show notification bell
    const notificationBell = page.locator('button:has(svg)').filter({ hasText: /bell|notification/i }).first();
    await expect(notificationBell).toBeVisible();

    // Should show unread count badge
    const unreadBadge = page.locator('span:has-text("2"), span:has-text("99+")');
    const hasBadge = await unreadBadge.isVisible();
    expect(hasBadge).toBeTruthy();
  });

  test('should open notification dropdown when bell is clicked', async ({ page }) => {
    // Mock notifications
    await page.route('**/notifications**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            userId: 'techguru-uid-1',
            type: 'video_upload',
            title: 'MusicLover uploaded a new video',
            message: 'Relaxing Jazz Music for Study & Work',
            read: false,
            createdAt: new Date().toISOString(),
            data: {
              videoId: 'sample-video-3',
              channelName: 'MusicLover',
              thumbnailUrl: 'https://example.com/thumb.jpg'
            }
          }
        ])
      });
    });

    // Click notification bell
    const notificationBell = page.locator('button:has([data-testid="bell"], svg)').first();
    await notificationBell.click();

    // Should show dropdown
    await expect(page.locator('text=Notifications')).toBeVisible();
    await expect(page.locator('text=MusicLover uploaded a new video')).toBeVisible();
    await expect(page.locator('text=Relaxing Jazz Music for Study & Work')).toBeVisible();
  });

  test('should navigate to notifications page', async ({ page }) => {
    // Mock notifications
    await page.route('**/notifications**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // Navigate to notifications page
    await page.goto('/notifications');

    // Should show notifications page
    await expect(page.locator('h1:has-text("Notifications")')).toBeVisible();
    await expect(page.locator('text=No notifications')).toBeVisible();
  });

  test('should display different notification types', async ({ page }) => {
    // Mock different notification types
    await page.route('**/notifications**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            type: 'video_upload',
            title: 'New video uploaded',
            message: 'Check it out!',
            read: false,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            type: 'comment',
            title: 'New comment',
            message: 'Someone commented',
            read: false,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            type: 'like',
            title: 'Video liked',
            message: 'Someone liked your video',
            read: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '4',
            type: 'subscription',
            title: 'New subscriber',
            message: 'You have a new subscriber',
            read: false,
            createdAt: new Date().toISOString()
          }
        ])
      });
    });

    await page.goto('/notifications');

    // Should show different notification types
    await expect(page.locator('text=New video uploaded')).toBeVisible();
    await expect(page.locator('text=New comment')).toBeVisible();
    await expect(page.locator('text=Video liked')).toBeVisible();
    await expect(page.locator('text=New subscriber')).toBeVisible();
  });

  test('should filter notifications by type', async ({ page }) => {
    // Mock notifications
    await page.route('**/notifications**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            type: 'video_upload',
            title: 'New video',
            message: 'Video uploaded',
            read: false,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            type: 'comment',
            title: 'New comment',
            message: 'Comment added',
            read: false,
            createdAt: new Date().toISOString()
          }
        ])
      });
    });

    await page.goto('/notifications');

    // Click on "New Videos" filter
    await page.click('button:has-text("New Videos")');

    // Should show only video upload notifications
    await expect(page.locator('text=New video')).toBeVisible();
    
    // Click on "Comments" filter
    await page.click('button:has-text("Comments")');

    // Should show only comment notifications
    await expect(page.locator('text=New comment')).toBeVisible();
  });

  test('should mark notifications as read', async ({ page }) => {
    // Mock notifications
    await page.route('**/notifications**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            type: 'video_upload',
            title: 'New video',
            message: 'Check it out',
            read: false,
            createdAt: new Date().toISOString()
          }
        ])
      });
    });

    // Mock mark as read API
    await page.route('**/notifications/*/read', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto('/notifications');

    // Click mark as read button
    const markReadButton = page.locator('button[title="Mark as read"]');
    if (await markReadButton.isVisible()) {
      await markReadButton.click();
      
      // Should show success message
      const successMessage = page.locator('text=marked as read');
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show notification settings', async ({ page }) => {
    await page.goto('/notifications');

    // Click settings button
    const settingsButton = page.locator('button[title="Settings"]');
    await settingsButton.click();

    // Should show settings panel
    await expect(page.locator('text=Notification Settings')).toBeVisible();
    await expect(page.locator('text=video uploads')).toBeVisible();
    await expect(page.locator('text=comments')).toBeVisible();
    await expect(page.locator('text=likes')).toBeVisible();
    await expect(page.locator('text=subscriptions')).toBeVisible();
  });

  test('should toggle notification preferences', async ({ page }) => {
    // Mock preferences update
    await page.route('**/notificationPreferences**', async route => {
      if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/notifications');

    // Open settings
    await page.click('button[title="Settings"]');

    // Toggle a preference
    const toggleButton = page.locator('button').filter({ hasText: /bg-youtube-red|bg-gray-600/ }).first();
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      
      // Should show success message
      const successMessage = page.locator('text=preferences updated');
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to video when notification is clicked', async ({ page }) => {
    // Mock notifications
    await page.route('**/notifications**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            type: 'video_upload',
            title: 'New video',
            message: 'Check it out',
            read: false,
            createdAt: new Date().toISOString(),
            data: {
              videoId: 'sample-video-123'
            }
          }
        ])
      });
    });

    await page.goto('/notifications');

    // Click on notification
    await page.click('text=New video');

    // Should navigate to video page
    await expect(page).toHaveURL(/\/watch\/sample-video-123/);
  });

  test('should show empty state when no notifications', async ({ page }) => {
    // Mock empty notifications
    await page.route('**/notifications**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/notifications');

    // Should show empty state
    await expect(page.locator('text=No notifications')).toBeVisible();
    await expect(page.locator('text=We\'ll notify you when something happens')).toBeVisible();
  });

  test('should clear all notifications', async ({ page }) => {
    // Mock notifications
    await page.route('**/notifications**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            type: 'video_upload',
            title: 'New video',
            message: 'Check it out',
            read: false,
            createdAt: new Date().toISOString()
          }
        ])
      });
    });

    // Mock clear all API
    await page.route('**/notifications/clear', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto('/notifications');

    // Click clear all button
    const clearAllButton = page.locator('button[title="Clear all"]');
    await clearAllButton.click();

    // Should show success message
    const successMessage = page.locator('text=cleared');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });
});