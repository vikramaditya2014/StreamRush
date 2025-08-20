import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('h2:has-text("Sign in to YouTube")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
    await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();
  });

  test('should display registration form', async ({ page }) => {
    await page.goto('/register');
    
    await expect(page.locator('h2:has-text("Create your account")')).toBeVisible();
    await expect(page.locator('input[placeholder="Display Name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Channel Name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Password"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Confirm Password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Create account")')).toBeVisible();
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    
    // Navigate to register
    await page.click('text=Sign up');
    await expect(page).toHaveURL('/register');
    
    // Navigate back to login
    await page.click('text=Sign in');
    await expect(page).toHaveURL('/login');
  });

  test('should show password visibility toggle', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1);
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle to show password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click toggle to hide password again
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should validate required fields on login', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.click('button:has-text("Sign in")');
    
    // Check for HTML5 validation
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');
  });

  test('should validate required fields on register', async ({ page }) => {
    await page.goto('/register');
    
    // Try to submit empty form
    await page.click('button:has-text("Create account")');
    
    // Check for HTML5 validation
    const displayNameInput = page.locator('input[placeholder="Display Name"]');
    const channelNameInput = page.locator('input[placeholder="Channel Name"]');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[placeholder="Password"]');
    const confirmPasswordInput = page.locator('input[placeholder="Confirm Password"]');
    
    await expect(displayNameInput).toHaveAttribute('required');
    await expect(channelNameInput).toHaveAttribute('required');
    await expect(emailInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');
    await expect(confirmPasswordInput).toHaveAttribute('required');
  });
});