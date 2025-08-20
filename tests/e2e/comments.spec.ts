import { test, expect } from '@playwright/test';

test.describe('Comments System', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authenticated user for comment testing
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
        photoURL: 'https://example.com/avatar.jpg'
      }));
    });
    
    // Navigate to a video
    await page.goto('/');
    await page.waitForSelector('[data-testid="video-card"]', { timeout: 10000 });
    await page.locator('[data-testid="video-card"]').first().click();
    await page.waitForURL(/\/watch\/.+/);
  });

  test('should display comments section', async ({ page }) => {
    // Check comments section exists
    await expect(page.locator('h2:has-text("Comments")')).toBeVisible();
    
    // Should show comment count
    const commentCount = page.locator('text=/\\d+ Comments/');
    await expect(commentCount).toBeVisible();
  });

  test('should display comment form for authenticated users', async ({ page }) => {
    // Should show comment form
    const commentForm = page.locator('form:has(textarea[placeholder*="comment"])');
    await expect(commentForm).toBeVisible();
    
    // Should show user avatar
    const userAvatar = page.locator('img[alt*="avatar"], div:has-text("T")'); // T for Test User
    await expect(userAvatar.first()).toBeVisible();
    
    // Should have comment textarea
    const textarea = page.locator('textarea[placeholder*="comment"]');
    await expect(textarea).toBeVisible();
  });

  test('should show comment buttons when typing', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="comment"]');
    await textarea.fill('This is a test comment');
    
    // Should show Cancel and Comment buttons
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Comment")')).toBeVisible();
  });

  test('should clear comment when cancel is clicked', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="comment"]');
    await textarea.fill('This is a test comment');
    
    // Click cancel
    await page.click('button:has-text("Cancel")');
    
    // Textarea should be empty
    await expect(textarea).toHaveValue('');
    
    // Buttons should be hidden
    await expect(page.locator('button:has-text("Cancel")')).not.toBeVisible();
    await expect(page.locator('button:has-text("Comment")')).not.toBeVisible();
  });

  test('should submit comment successfully', async ({ page }) => {
    const testComment = 'This is an automated test comment';
    
    // Fill and submit comment
    const textarea = page.locator('textarea[placeholder*="comment"]');
    await textarea.fill(testComment);
    
    // Mock successful comment submission
    await page.route('**/comments**', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      } else {
        await route.continue();
      }
    });
    
    await page.click('button:has-text("Comment")');
    
    // Should show success message
    const successMessage = page.locator('text=Comment added successfully, text=success');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    
    // Form should be cleared
    await expect(textarea).toHaveValue('');
  });

  test('should display existing comments', async ({ page }) => {
    // Mock comments data
    await page.route('**/comments**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            userName: 'John Doe',
            userAvatar: 'https://example.com/john.jpg',
            content: 'Great video! Really helpful content.',
            likes: 12,
            createdAt: new Date().toISOString(),
            replies: []
          },
          {
            id: '2',
            userName: 'Jane Smith',
            userAvatar: 'https://example.com/jane.jpg',
            content: 'Thanks for sharing this! Looking forward to more content like this.',
            likes: 8,
            createdAt: new Date().toISOString(),
            replies: []
          }
        ])
      });
    });
    
    await page.reload();
    
    // Should display comments
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).toBeVisible();
    await expect(page.locator('text=Great video! Really helpful content.')).toBeVisible();
    await expect(page.locator('text=Thanks for sharing this!')).toBeVisible();
  });

  test('should show comment timestamps', async ({ page }) => {
    // Mock comments with timestamps
    await page.route('**/comments**', async route => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            userName: 'John Doe',
            content: 'Great video!',
            likes: 12,
            createdAt: yesterday.toISOString(),
            replies: []
          }
        ])
      });
    });
    
    await page.reload();
    
    // Should show relative time
    const timeStamp = page.locator('text=/ago|yesterday|hours?|minutes?|seconds?/');
    await expect(timeStamp).toBeVisible();
  });

  test('should handle comment errors gracefully', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="comment"]');
    await textarea.fill('Test comment');
    
    // Mock error response
    await page.route('**/comments**', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Failed to add comment' })
        });
      } else {
        await route.continue();
      }
    });
    
    await page.click('button:has-text("Comment")');
    
    // Should show error message
    const errorMessage = page.locator('text=Failed to add comment, text=error');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should prevent empty comments', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="comment"]');
    
    // Try to submit empty comment
    await textarea.fill('   '); // Only whitespace
    await page.click('button:has-text("Comment")');
    
    // Should show validation error or prevent submission
    const errorMessage = page.locator('text=cannot be empty, text=required');
    const hasError = await errorMessage.isVisible();
    
    // Or comment button should be disabled
    const commentButton = page.locator('button:has-text("Comment")');
    const isDisabled = await commentButton.isDisabled();
    
    expect(hasError || isDisabled).toBeTruthy();
  });

  test('should show user avatars in comments', async ({ page }) => {
    // Mock comments with avatars
    await page.route('**/comments**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            userName: 'John Doe',
            userAvatar: 'https://example.com/john.jpg',
            content: 'Great video!',
            likes: 12,
            createdAt: new Date().toISOString(),
            replies: []
          }
        ])
      });
    });
    
    await page.reload();
    
    // Should show avatar or fallback
    const avatar = page.locator('img[alt="John Doe"], div:has-text("J")'); // J for John
    await expect(avatar.first()).toBeVisible();
  });
});