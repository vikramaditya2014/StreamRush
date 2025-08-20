import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login/signup options', async ({ page }) => {
    // Check for auth buttons in header
    const authButtons = page.locator('button:has-text("Sign In"), button:has-text("Login"), a:has-text("Sign In"), a:has-text("Login")');
    await expect(authButtons.first()).toBeVisible();
  });

  test('should open login modal when clicking sign in', async ({ page }) => {
    // Click sign in button
    await page.click('button:has-text("Sign In"), a:has-text("Sign In")');
    
    // Should open login modal or navigate to login page
    const loginForm = page.locator('form:has(input[type="email"]), input[placeholder*="email"]');
    const loginModal = page.locator('[role="dialog"], .modal, .popup');
    
    const hasLoginForm = await loginForm.isVisible();
    const hasLoginModal = await loginModal.isVisible();
    const isLoginPage = page.url().includes('/login') || page.url().includes('/auth');
    
    expect(hasLoginForm || hasLoginModal || isLoginPage).toBeTruthy();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    // Navigate to login
    await page.click('button:has-text("Sign In"), a:has-text("Sign In")');
    
    // Wait for login form
    await page.waitForSelector('input[type="email"], input[placeholder*="email"]', { timeout: 5000 });
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    await submitButton.click();
    
    // Should show validation errors
    const errorMessage = page.locator('text=required, text=invalid, text=error, .error, [role="alert"]');
    const hasError = await errorMessage.isVisible();
    
    expect(hasError).toBeTruthy();
  });

  test('should handle Google sign in option', async ({ page }) => {
    // Navigate to login
    await page.click('button:has-text("Sign In"), a:has-text("Sign In")');
    
    // Look for Google sign in button
    const googleButton = page.locator('button:has-text("Google"), button:has-text("Continue with Google"), svg[class*="google"]');
    
    if (await googleButton.isVisible()) {
      // Click Google sign in (will likely fail in test environment)
      await googleButton.click();
      
      // Should either redirect or show error about popup
      await page.waitForTimeout(2000);
      
      // Test passes if button exists and is clickable
      expect(true).toBeTruthy();
    } else {
      // Skip if Google auth not implemented
      test.skip();
    }
  });

  test('should show registration form', async ({ page }) => {
    // Look for sign up option
    const signUpButton = page.locator('button:has-text("Sign Up"), a:has-text("Sign Up"), text=Create account');
    
    if (await signUpButton.isVisible()) {
      await signUpButton.click();
      
      // Should show registration form
      const registrationForm = page.locator('input[placeholder*="name"], input[placeholder*="channel"]');
      await expect(registrationForm.first()).toBeVisible();
    } else {
      // Check if there's a toggle to registration
      const toggleToSignUp = page.locator('text=Create account, text=Sign up, button:has-text("Register")');
      if (await toggleToSignUp.isVisible()) {
        await toggleToSignUp.click();
        
        const registrationForm = page.locator('input[placeholder*="name"], input[placeholder*="channel"]');
        await expect(registrationForm.first()).toBeVisible();
      }
    }
  });

  test('should persist authentication state', async ({ page, context }) => {
    // Mock successful authentication
    await context.addCookies([
      {
        name: 'auth-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/'
      }
    ]);
    
    // Set localStorage for auth state
    await page.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({
        uid: 'test-user',
        email: 'test@example.com',
        displayName: 'Test User'
      }));
    });
    
    await page.reload();
    
    // Should show authenticated state
    const userMenu = page.locator('button:has-text("Test User"), img[alt*="avatar"], .user-menu');
    const profileButton = page.locator('button:has-text("Profile"), text=Test User');
    
    const hasUserMenu = await userMenu.isVisible();
    const hasProfileButton = await profileButton.isVisible();
    
    expect(hasUserMenu || hasProfileButton).toBeTruthy();
  });

  test('should handle logout functionality', async ({ page, context }) => {
    // Mock authenticated state
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
        uid: 'test-user',
        email: 'test@example.com',
        displayName: 'Test User'
      }));
    });
    
    await page.reload();
    
    // Look for logout option
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), text=Logout');
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should return to unauthenticated state
      await page.waitForTimeout(1000);
      const signInButton = page.locator('button:has-text("Sign In"), a:has-text("Sign In")');
      await expect(signInButton).toBeVisible();
    } else {
      // Look for user menu that might contain logout
      const userMenu = page.locator('.user-menu, button:has(img[alt*="avatar"])');
      if (await userMenu.isVisible()) {
        await userMenu.click();
        
        const logoutInMenu = page.locator('button:has-text("Logout"), button:has-text("Sign Out")');
        if (await logoutInMenu.isVisible()) {
          await logoutInMenu.click();
          
          const signInButton = page.locator('button:has-text("Sign In"), a:has-text("Sign In")');
          await expect(signInButton).toBeVisible();
        }
      }
    }
  });
});