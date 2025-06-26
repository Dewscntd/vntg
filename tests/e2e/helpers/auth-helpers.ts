import { Page, expect } from '@playwright/test';
import { testUsers, testUrls, testSelectors } from '../fixtures/test-data';

export class AuthHelpers {
  constructor(private page: Page) {}

  async login(userType: 'customer' | 'admin' = 'customer') {
    const user = testUsers[userType];

    await this.page.goto(testUrls.login);

    // Wait for login form to be visible
    await this.page.waitForSelector(testSelectors.emailInput);

    // Fill login form
    await this.page.fill(testSelectors.emailInput, user.email);
    await this.page.fill(testSelectors.passwordInput, user.password);

    // Submit form
    await this.page.click(testSelectors.submitButton);

    // Wait for redirect after successful login
    await this.page.waitForURL('**/');

    // Verify user is logged in by checking for user menu or similar
    await expect(this.page.locator(testSelectors.navUser)).toBeVisible();
  }

  async register(userData?: { email: string; password: string; name: string }) {
    const user = userData || {
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123',
      name: 'Test User',
    };

    await this.page.goto(testUrls.register);

    // Wait for registration form
    await this.page.waitForSelector(testSelectors.emailInput);

    // Fill registration form
    await this.page.fill(testSelectors.emailInput, user.email);
    await this.page.fill(testSelectors.passwordInput, user.password);
    await this.page.fill('[data-testid="confirm-password-input"]', user.password);
    await this.page.fill('[data-testid="name-input"]', user.name);

    // Submit form
    await this.page.click(testSelectors.submitButton);

    // Wait for redirect or success message
    await this.page.waitForURL('**/');

    return user;
  }

  async logout() {
    // Click user menu
    await this.page.click(testSelectors.navUser);

    // Click logout option
    await this.page.click('[data-testid="logout-button"]');

    // Wait for redirect to home or login page
    await this.page.waitForURL('**/');

    // Verify user is logged out
    await expect(this.page.locator(testSelectors.navUser)).not.toBeVisible();
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.locator(testSelectors.navUser).waitFor({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async ensureLoggedIn(userType: 'customer' | 'admin' = 'customer') {
    const isLoggedIn = await this.isLoggedIn();
    if (!isLoggedIn) {
      await this.login(userType);
    }
  }

  async ensureLoggedOut() {
    const isLoggedIn = await this.isLoggedIn();
    if (isLoggedIn) {
      await this.logout();
    }
  }
}
