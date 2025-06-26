import { test, expect } from '@playwright/test';
import { AuthHelpers } from './helpers/auth-helpers';
import { testUsers, testUrls, testSelectors, generateTestUser } from './fixtures/test-data';

test.describe('Authentication', () => {
  let authHelpers: AuthHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
  });

  test.describe('User Registration', () => {
    test('should register a new user successfully', async ({ page }) => {
      const newUser = generateTestUser();

      await page.goto(testUrls.register);

      // Fill registration form
      await page.fill(testSelectors.emailInput, newUser.email);
      await page.fill(testSelectors.passwordInput, newUser.password);
      await page.fill('[data-testid="confirm-password-input"]', newUser.password);
      await page.fill('[data-testid="name-input"]', newUser.name);

      // Submit form
      await page.click(testSelectors.submitButton);

      // Should redirect to home page
      await page.waitForURL('**/');

      // Should show success message
      await expect(page.locator(testSelectors.successMessage)).toBeVisible();

      // Should be logged in (user menu visible)
      await expect(page.locator(testSelectors.navUser)).toBeVisible();
    });

    test('should show validation errors for invalid data', async ({ page }) => {
      await page.goto(testUrls.register);

      // Try to submit with empty fields
      await page.click(testSelectors.submitButton);

      // Should show validation errors
      await expect(page.locator(testSelectors.errorMessage)).toBeVisible();
    });

    test('should show error for mismatched passwords', async ({ page }) => {
      const newUser = generateTestUser();

      await page.goto(testUrls.register);

      await page.fill(testSelectors.emailInput, newUser.email);
      await page.fill(testSelectors.passwordInput, newUser.password);
      await page.fill('[data-testid="confirm-password-input"]', 'different-password');
      await page.fill('[data-testid="name-input"]', newUser.name);

      await page.click(testSelectors.submitButton);

      // Should show password mismatch error
      await expect(page.locator('[data-testid="password-mismatch-error"]')).toBeVisible();
    });

    test('should show error for existing email', async ({ page }) => {
      await page.goto(testUrls.register);

      // Try to register with existing email
      await page.fill(testSelectors.emailInput, testUsers.customer.email);
      await page.fill(testSelectors.passwordInput, 'newpassword123');
      await page.fill('[data-testid="confirm-password-input"]', 'newpassword123');
      await page.fill('[data-testid="name-input"]', 'New User');

      await page.click(testSelectors.submitButton);

      // Should show email already exists error
      await expect(page.locator('[data-testid="email-exists-error"]')).toBeVisible();
    });
  });

  test.describe('User Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      await page.goto(testUrls.login);

      await page.fill(testSelectors.emailInput, testUsers.customer.email);
      await page.fill(testSelectors.passwordInput, testUsers.customer.password);

      await page.click(testSelectors.submitButton);

      // Should redirect to home page
      await page.waitForURL('**/');

      // Should be logged in
      await expect(page.locator(testSelectors.navUser)).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto(testUrls.login);

      await page.fill(testSelectors.emailInput, 'invalid@example.com');
      await page.fill(testSelectors.passwordInput, 'wrongpassword');

      await page.click(testSelectors.submitButton);

      // Should show error message
      await expect(page.locator(testSelectors.errorMessage)).toBeVisible();

      // Should still be on login page
      expect(page.url()).toContain('/auth/login');
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto(testUrls.login);

      await page.click(testSelectors.submitButton);

      // Should show validation errors
      await expect(page.locator(testSelectors.errorMessage)).toBeVisible();
    });

    test('should redirect to intended page after login', async ({ page }) => {
      // Try to access protected page while logged out
      await page.goto(testUrls.account);

      // Should redirect to login
      await page.waitForURL('**/auth/login**');

      // Login
      await page.fill(testSelectors.emailInput, testUsers.customer.email);
      await page.fill(testSelectors.passwordInput, testUsers.customer.password);
      await page.click(testSelectors.submitButton);

      // Should redirect back to intended page
      await page.waitForURL('**/account');
    });
  });

  test.describe('User Logout', () => {
    test('should logout successfully', async ({ page }) => {
      // First login
      await authHelpers.login();

      // Verify logged in
      await expect(page.locator(testSelectors.navUser)).toBeVisible();

      // Logout
      await authHelpers.logout();

      // Should be logged out
      await expect(page.locator(testSelectors.navUser)).not.toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login for protected routes when not authenticated', async ({
      page,
    }) => {
      await page.goto(testUrls.account);

      // Should redirect to login
      await page.waitForURL('**/auth/login**');
    });

    test('should allow access to protected routes when authenticated', async ({ page }) => {
      await authHelpers.login();

      await page.goto(testUrls.account);

      // Should stay on account page
      await page.waitForURL('**/account');
      await expect(page.locator('[data-testid="account-page"]')).toBeVisible();
    });

    test('should redirect admin routes for non-admin users', async ({ page }) => {
      await authHelpers.login('customer');

      await page.goto(testUrls.admin);

      // Should redirect to home or show access denied
      await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
    });

    test('should allow admin access for admin users', async ({ page }) => {
      await authHelpers.login('admin');

      await page.goto(testUrls.admin);

      // Should show admin dashboard
      await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      await authHelpers.login();

      // Refresh page
      await page.reload();

      // Should still be logged in
      await expect(page.locator(testSelectors.navUser)).toBeVisible();
    });

    test('should handle session expiration gracefully', async ({ page }) => {
      await authHelpers.login();

      // Simulate session expiration by clearing storage
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // Try to access protected route
      await page.goto(testUrls.account);

      // Should redirect to login
      await page.waitForURL('**/auth/login**');
    });
  });
});
