import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the YouTube logo and title', async ({ page }) => {
    await expect(page.locator('text=YouTube')).toBeVisible();
  });

  test('should have a search bar', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search"]');
    await expect(searchInput).toBeVisible();
  });

  test('should display category filters', async ({ page }) => {
    await expect(page.locator('text=All')).toBeVisible();
    await expect(page.locator('text=Gaming')).toBeVisible();
    await expect(page.locator('text=Music')).toBeVisible();
  });

  test('should show sign in button when not authenticated', async ({ page }) => {
    await expect(page.locator('text=Sign in')).toBeVisible();
  });

  test('should navigate to login page when sign in is clicked', async ({ page }) => {
    await page.click('text=Sign in');
    await expect(page).toHaveURL('/login');
  });

  test('should filter videos by category', async ({ page }) => {
    // Click on Gaming category
    await page.click('text=Gaming');
    
    // Check if Gaming button is active (has different styling)
    const gamingButton = page.locator('button:has-text("Gaming")');
    await expect(gamingButton).toHaveClass(/bg-white text-black/);
  });

  test('should perform search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search"]');
    await searchInput.fill('test video');
    await searchInput.press('Enter');
    
    await expect(page).toHaveURL(/\/search\?q=test%20video/);
  });
});

test.describe('Navigation', () => {
  test('should navigate to trending page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Trending');
    await expect(page).toHaveURL('/trending');
    await expect(page.locator('h1:has-text("Trending")')).toBeVisible();
  });

  test('should show sidebar navigation items', async ({ page }) => {
    await page.goto('/');
    
    // Check main navigation items
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Trending')).toBeVisible();
    
    // Check explore section
    await expect(page.locator('text=Gaming')).toBeVisible();
    await expect(page.locator('text=Music')).toBeVisible();
    await expect(page.locator('text=Sports')).toBeVisible();
  });
});