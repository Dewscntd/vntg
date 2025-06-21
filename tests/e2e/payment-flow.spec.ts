import { test, expect } from '@playwright/test';
import { 
  loginUser, 
  addProductToCart, 
  navigateToCheckout,
  fillShippingAddress,
  selectShippingMethod,
  TEST_USER,
  TEST_PRODUCTS 
} from './helpers/auth-helpers';

test.describe('Payment Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto('/');
    
    // Login user
    await loginUser(page, TEST_USER.email, TEST_USER.password);
    
    // Add a product to cart
    await addProductToCart(page, TEST_PRODUCTS[0].id);
  });

  test('should complete successful payment flow', async ({ page }) => {
    // Navigate to checkout
    await navigateToCheckout(page);
    
    // Fill shipping address
    await fillShippingAddress(page, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'US',
    });
    
    // Continue to shipping method
    await page.click('[data-testid="continue-to-shipping"]');
    
    // Select shipping method
    await selectShippingMethod(page, 'standard');
    
    // Continue to payment
    await page.click('[data-testid="continue-to-payment"]');
    
    // Wait for Stripe Elements to load
    await page.waitForSelector('[data-testid="stripe-card-element"]');
    
    // Fill payment information (using Stripe test card)
    const cardElement = page.frameLocator('[data-testid="stripe-card-element"] iframe');
    await cardElement.locator('[name="cardnumber"]').fill('4242424242424242');
    await cardElement.locator('[name="exp-date"]').fill('12/25');
    await cardElement.locator('[name="cvc"]').fill('123');
    await cardElement.locator('[name="postal"]').fill('12345');
    
    // Review order
    await page.click('[data-testid="continue-to-review"]');
    
    // Verify order summary
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-total"]')).toContainText('$');
    
    // Place order
    await page.click('[data-testid="place-order"]');
    
    // Wait for payment processing
    await page.waitForSelector('[data-testid="payment-processing"]');
    
    // Wait for success page
    await page.waitForURL('**/checkout/success**', { timeout: 30000 });
    
    // Verify success page elements
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-total"]')).toBeVisible();
    
    // Verify order appears in user's order history
    await page.goto('/account/orders');
    await expect(page.locator('[data-testid="order-item"]').first()).toBeVisible();
  });

  test('should handle payment failure gracefully', async ({ page }) => {
    // Navigate to checkout
    await navigateToCheckout(page);
    
    // Fill shipping address
    await fillShippingAddress(page, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'US',
    });
    
    // Continue through checkout steps
    await page.click('[data-testid="continue-to-shipping"]');
    await selectShippingMethod(page, 'standard');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Wait for Stripe Elements to load
    await page.waitForSelector('[data-testid="stripe-card-element"]');
    
    // Use a card that will be declined (Stripe test card)
    const cardElement = page.frameLocator('[data-testid="stripe-card-element"] iframe');
    await cardElement.locator('[name="cardnumber"]').fill('4000000000000002');
    await cardElement.locator('[name="exp-date"]').fill('12/25');
    await cardElement.locator('[name="cvc"]').fill('123');
    await cardElement.locator('[name="postal"]').fill('12345');
    
    // Continue to review and place order
    await page.click('[data-testid="continue-to-review"]');
    await page.click('[data-testid="place-order"]');
    
    // Wait for error message
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-error"]')).toContainText('declined');
    
    // Verify user can retry payment
    await expect(page.locator('[data-testid="retry-payment"]')).toBeVisible();
    
    // Verify cart is still intact
    await page.goto('/cart');
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
  });

  test('should handle insufficient funds error', async ({ page }) => {
    // Navigate to checkout
    await navigateToCheckout(page);
    
    // Fill shipping address
    await fillShippingAddress(page, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'US',
    });
    
    // Continue through checkout steps
    await page.click('[data-testid="continue-to-shipping"]');
    await selectShippingMethod(page, 'standard');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Wait for Stripe Elements to load
    await page.waitForSelector('[data-testid="stripe-card-element"]');
    
    // Use insufficient funds test card
    const cardElement = page.frameLocator('[data-testid="stripe-card-element"] iframe');
    await cardElement.locator('[name="cardnumber"]').fill('4000000000009995');
    await cardElement.locator('[name="exp-date"]').fill('12/25');
    await cardElement.locator('[name="cvc"]').fill('123');
    await cardElement.locator('[name="postal"]').fill('12345');
    
    // Continue to review and place order
    await page.click('[data-testid="continue-to-review"]');
    await page.click('[data-testid="place-order"]');
    
    // Wait for specific insufficient funds error
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-error"]')).toContainText('insufficient');
  });

  test('should validate payment form fields', async ({ page }) => {
    // Navigate to checkout
    await navigateToCheckout(page);
    
    // Fill shipping address
    await fillShippingAddress(page, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'US',
    });
    
    // Continue through checkout steps
    await page.click('[data-testid="continue-to-shipping"]');
    await selectShippingMethod(page, 'standard');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Try to continue without filling payment info
    await page.click('[data-testid="continue-to-review"]');
    
    // Should show validation errors
    await expect(page.locator('[data-testid="payment-validation-error"]')).toBeVisible();
    
    // Fill invalid card number
    const cardElement = page.frameLocator('[data-testid="stripe-card-element"] iframe');
    await cardElement.locator('[name="cardnumber"]').fill('1234');
    
    // Should show card validation error
    await expect(page.locator('[data-testid="card-error"]')).toBeVisible();
  });

  test('should handle payment timeout', async ({ page }) => {
    // Set shorter timeout for this test
    page.setDefaultTimeout(10000);
    
    // Navigate to checkout
    await navigateToCheckout(page);
    
    // Fill shipping address
    await fillShippingAddress(page, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'US',
    });
    
    // Continue through checkout steps
    await page.click('[data-testid="continue-to-shipping"]');
    await selectShippingMethod(page, 'standard');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Wait for Stripe Elements to load
    await page.waitForSelector('[data-testid="stripe-card-element"]');
    
    // Fill payment information
    const cardElement = page.frameLocator('[data-testid="stripe-card-element"] iframe');
    await cardElement.locator('[name="cardnumber"]').fill('4242424242424242');
    await cardElement.locator('[name="exp-date"]').fill('12/25');
    await cardElement.locator('[name="cvc"]').fill('123');
    await cardElement.locator('[name="postal"]').fill('12345');
    
    // Continue to review and place order
    await page.click('[data-testid="continue-to-review"]');
    
    // Mock slow network to simulate timeout
    await page.route('**/api/checkout/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15 second delay
      await route.continue();
    });
    
    await page.click('[data-testid="place-order"]');
    
    // Should show timeout error
    await expect(page.locator('[data-testid="payment-timeout-error"]')).toBeVisible();
  });
});
