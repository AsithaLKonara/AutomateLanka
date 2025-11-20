import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('Authentication Flow', () => {
  test('should register a new user', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/auth/register`);

    // Fill registration form
    await page.fill('input[type="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="workspaceName"]', 'Test Workspace');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or show success
    await expect(page).toHaveURL(new RegExp(`${FRONTEND_URL}/w/.*/dashboard`));
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/auth/login`);

    // Fill login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'SecurePass123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(new RegExp(`${FRONTEND_URL}/w/.*/dashboard`));
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/auth/login`);

    // Fill with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/invalid|error/i')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login (would need to set up test user)
    await page.goto(`${FRONTEND_URL}/auth/login`);
    // ... login steps ...

    // Then logout
    await page.click('button:has-text("Logout")');

    // Should redirect to login page
    await expect(page).toHaveURL(new RegExp(`${FRONTEND_URL}/auth/login`));
  });
});

test.describe('Workflow Execution Flow', () => {
  test('should execute a workflow', async ({ page, request }) => {
    // Login first
    // ... login steps ...

    // Navigate to workflows
    await page.goto(`${FRONTEND_URL}/w/test-workspace/workflows`);

    // Click on a workflow
    await page.click('.workflow-card:first-child');

    // Click run button
    await page.click('button:has-text("Run")');

    // Should show run status
    await expect(page.locator('text=/queued|running|success/i')).toBeVisible();

    // Wait for completion (with timeout)
    await page.waitForSelector('text=/success|failed/i', { timeout: 30000 });

    // Check logs are visible
    await expect(page.locator('text=/logs|output/i')).toBeVisible();
  });
});

