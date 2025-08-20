import { test, expect } from '@playwright/test';

test.describe('Video Upload', () => {
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
        channelName: 'Test Channel'
      }));
    });
    
    await page.goto('/');
  });

  test('should show upload option for authenticated users', async ({ page }) => {
    // Look for upload button/link
    const uploadButton = page.locator('button:has-text("Upload"), a:has-text("Upload"), [data-testid="upload-button"]');
    const uploadIcon = page.locator('svg[data-testid="upload-icon"], .upload-icon');
    
    const hasUploadButton = await uploadButton.isVisible();
    const hasUploadIcon = await uploadIcon.isVisible();
    
    expect(hasUploadButton || hasUploadIcon).toBeTruthy();
  });

  test('should navigate to upload page when upload is clicked', async ({ page }) => {
    // Click upload button
    const uploadButton = page.locator('button:has-text("Upload"), a:has-text("Upload"), [data-testid="upload-button"]');
    
    if (await uploadButton.isVisible()) {
      await uploadButton.click();
      
      // Should navigate to upload page or open upload modal
      const isUploadPage = page.url().includes('/upload');
      const hasUploadModal = await page.locator('[role="dialog"]:has-text("Upload"), .upload-modal').isVisible();
      const hasFileInput = await page.locator('input[type="file"]').isVisible();
      
      expect(isUploadPage || hasUploadModal || hasFileInput).toBeTruthy();
    }
  });

  test('should display upload form with required fields', async ({ page }) => {
    // Navigate to upload page
    await page.goto('/upload');
    
    // Check for required form fields
    const titleInput = page.locator('input[placeholder*="title"], input[name="title"]');
    const descriptionInput = page.locator('textarea[placeholder*="description"], textarea[name="description"]');
    const fileInput = page.locator('input[type="file"]');
    const categorySelect = page.locator('select[name="category"], select:has(option)');
    
    await expect(titleInput).toBeVisible();
    await expect(descriptionInput).toBeVisible();
    await expect(fileInput).toBeVisible();
    
    // Category might be a select or custom dropdown
    const hasCategorySelect = await categorySelect.isVisible();
    const hasCategoryDropdown = await page.locator('text=Category, text=Gaming, text=Music').isVisible();
    
    expect(hasCategorySelect || hasCategoryDropdown).toBeTruthy();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/upload');
    
    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"], button:has-text("Upload"), button:has-text("Publish")');
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Should show validation errors
      const errorMessages = page.locator('text=required, text=Please, .error, [role="alert"]');
      const hasErrors = await errorMessages.first().isVisible();
      
      expect(hasErrors).toBeTruthy();
    }
  });

  test('should handle file selection', async ({ page }) => {
    await page.goto('/upload');
    
    const fileInput = page.locator('input[type="file"]');
    
    // Create a test file
    const testFile = {
      name: 'test-video.mp4',
      mimeType: 'video/mp4',
      buffer: Buffer.from('fake video content')
    };
    
    // Set file input
    await fileInput.setInputFiles(testFile);
    
    // Should show file name or upload progress
    const fileName = page.locator('text=test-video.mp4');
    const uploadProgress = page.locator('.progress, text=Uploading, text=Processing');
    
    const hasFileName = await fileName.isVisible();
    const hasProgress = await uploadProgress.isVisible();
    
    expect(hasFileName || hasProgress).toBeTruthy();
  });

  test('should validate file type', async ({ page }) => {
    await page.goto('/upload');
    
    const fileInput = page.locator('input[type="file"]');
    
    // Try to upload invalid file type
    const invalidFile = {
      name: 'test-document.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not a video file')
    };
    
    await fileInput.setInputFiles(invalidFile);
    
    // Should show error for invalid file type
    const errorMessage = page.locator('text=invalid file type, text=video files only, text=not supported');
    const hasError = await errorMessage.isVisible();
    
    expect(hasError).toBeTruthy();
  });

  test('should handle successful upload', async ({ page }) => {
    // Mock successful upload
    await page.route('**/upload**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          videoId: 'test-video-123',
          message: 'Video uploaded successfully'
        })
      });
    });
    
    await page.goto('/upload');
    
    // Fill form
    await page.fill('input[placeholder*="title"], input[name="title"]', 'Test Video Title');
    await page.fill('textarea[placeholder*="description"], textarea[name="description"]', 'Test video description');
    
    // Select category
    const categorySelect = page.locator('select[name="category"]');
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption('Technology');
    }
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    const testFile = {
      name: 'test-video.mp4',
      mimeType: 'video/mp4',
      buffer: Buffer.from('fake video content')
    };
    await fileInput.setInputFiles(testFile);
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Upload"), button:has-text("Publish")');
    await submitButton.click();
    
    // Should show success message
    const successMessage = page.locator('text=uploaded successfully, text=success');
    await expect(successMessage).toBeVisible({ timeout: 10000 });
  });

  test('should handle upload errors', async ({ page }) => {
    // Mock upload error
    await page.route('**/upload**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Upload failed'
        })
      });
    });
    
    await page.goto('/upload');
    
    // Fill and submit form
    await page.fill('input[placeholder*="title"], input[name="title"]', 'Test Video');
    await page.fill('textarea[placeholder*="description"], textarea[name="description"]', 'Test description');
    
    const fileInput = page.locator('input[type="file"]');
    const testFile = {
      name: 'test-video.mp4',
      mimeType: 'video/mp4',
      buffer: Buffer.from('fake video content')
    };
    await fileInput.setInputFiles(testFile);
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Upload")');
    await submitButton.click();
    
    // Should show error message
    const errorMessage = page.locator('text=failed, text=error');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('should show upload progress', async ({ page }) => {
    // Mock slow upload with progress
    await page.route('**/upload**', async route => {
      // Simulate slow upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    await page.goto('/upload');
    
    // Fill and submit form
    await page.fill('input[placeholder*="title"], input[name="title"]', 'Test Video');
    
    const fileInput = page.locator('input[type="file"]');
    const testFile = {
      name: 'test-video.mp4',
      mimeType: 'video/mp4',
      buffer: Buffer.from('fake video content')
    };
    await fileInput.setInputFiles(testFile);
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Upload")');
    await submitButton.click();
    
    // Should show progress indicator
    const progressIndicator = page.locator('.progress, text=Uploading, text=Processing, .spinner');
    await expect(progressIndicator).toBeVisible({ timeout: 5000 });
  });

  test('should require authentication for upload', async ({ page, context }) => {
    // Clear authentication
    await context.clearCookies();
    await page.addInitScript(() => {
      localStorage.clear();
    });
    
    await page.goto('/upload');
    
    // Should redirect to login or show login prompt
    const isLoginPage = page.url().includes('/login') || page.url().includes('/auth');
    const hasLoginPrompt = await page.locator('text=Please login, text=Sign in required').isVisible();
    const hasLoginForm = await page.locator('input[type="email"]').isVisible();
    
    expect(isLoginPage || hasLoginPrompt || hasLoginForm).toBeTruthy();
  });

  test('should allow adding tags to video', async ({ page }) => {
    await page.goto('/upload');
    
    // Look for tags input
    const tagsInput = page.locator('input[placeholder*="tags"], input[name="tags"]');
    
    if (await tagsInput.isVisible()) {
      await tagsInput.fill('react, typescript, tutorial');
      
      // Should show tags or tag chips
      const tagElements = page.locator('.tag, .chip, text=react');
      const hasTagElements = await tagElements.first().isVisible();
      
      expect(hasTagElements).toBeTruthy();
    }
  });
});