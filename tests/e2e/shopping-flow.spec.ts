import { test, expect } from '@playwright/test';
import { AuthHelpers } from './helpers/auth-helpers';
import { CartHelpers } from './helpers/cart-helpers';
import { testUrls, testSelectors, testProducts } from './fixtures/test-data';

test.describe('Shopping Flow', () => {
  let authHelpers: AuthHelpers;
  let cartHelpers: CartHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    cartHelpers = new CartHelpers(page);

    // Start each test logged in
    await authHelpers.login();
  });

  test.afterEach(async ({ page }) => {
    // Clean up cart after each test
    await cartHelpers.clearCart();
  });

  test.describe('Product Browsing', () => {
    test('should display products on the products page', async ({ page }) => {
      await page.goto(testUrls.products);

      // Wait for products to load
      await page.waitForSelector(testSelectors.productCard);

      // Should show at least one product
      const productCards = page.locator(testSelectors.productCard);
      await expect(productCards.first()).toBeVisible();

      // Each product card should have required elements
      const firstCard = productCards.first();
      await expect(firstCard.locator(testSelectors.productTitle)).toBeVisible();
      await expect(firstCard.locator(testSelectors.productPrice)).toBeVisible();
    });

    test('should filter products by category', async ({ page }) => {
      await page.goto(testUrls.products);

      // Wait for products to load
      await page.waitForSelector(testSelectors.productCard);

      // Click on a category filter
      await page.click('[data-testid="category-electronics"]');

      // Should show filtered products
      await page.waitForSelector(testSelectors.productCard);

      // Verify URL contains category parameter
      expect(page.url()).toContain('category=electronics');
    });

    test('should search for products', async ({ page }) => {
      await page.goto(testUrls.products);

      // Use search functionality
      await page.fill('[data-testid="search-input"]', 'Test Product');
      await page.press('[data-testid="search-input"]', 'Enter');

      // Should show search results
      await page.waitForSelector(testSelectors.productCard);

      // Verify URL contains search parameter
      expect(page.url()).toContain('search=Test%20Product');
    });

    test('should view product details', async ({ page }) => {
      await page.goto(testUrls.products);

      // Wait for products and click on first one
      await page.waitForSelector(testSelectors.productCard);
      await page.locator(testSelectors.productCard).first().click();

      // Should navigate to product detail page
      await page.waitForURL('**/products/**');

      // Should show product details
      await expect(page.locator('[data-testid="product-detail"]')).toBeVisible();
      await expect(page.locator(testSelectors.addToCartButton)).toBeVisible();
    });
  });

  test.describe('Cart Management', () => {
    test('should add product to cart', async ({ page }) => {
      await cartHelpers.addProductToCart();

      // Verify cart count updated
      const cartCount = await cartHelpers.getCartItemCount();
      expect(cartCount).toBeGreaterThan(0);

      // Verify success notification
      await expect(page.locator(testSelectors.toast)).toBeVisible();
    });

    test('should view cart contents', async ({ page }) => {
      await cartHelpers.addProductToCart();
      await cartHelpers.goToCart();

      // Should show cart items
      await expect(page.locator(testSelectors.cartItem)).toBeVisible();
      await expect(page.locator(testSelectors.cartTotal)).toBeVisible();
    });

    test('should update cart item quantity', async ({ page }) => {
      await cartHelpers.addProductToCart('Test Product 1');
      await cartHelpers.updateCartItemQuantity('Test Product 1', 3);

      // Verify quantity updated
      await cartHelpers.verifyCartContainsProduct('Test Product 1', 3);
    });

    test('should remove item from cart', async ({ page }) => {
      await cartHelpers.addProductToCart('Test Product 1');
      await cartHelpers.removeCartItem('Test Product 1');

      // Verify item removed
      await cartHelpers.verifyCartIsEmpty();
    });

    test('should persist cart across sessions', async ({ page }) => {
      await cartHelpers.addProductToCart('Test Product 1');

      // Logout and login again
      await authHelpers.logout();
      await authHelpers.login();

      // Cart should still contain the item
      await cartHelpers.verifyCartContainsProduct('Test Product 1');
    });

    test('should calculate cart total correctly', async ({ page }) => {
      // Add multiple products
      await cartHelpers.addProductToCart('Test Product 1'); // $29.99
      await cartHelpers.addProductToCart('Test Product 2'); // $49.99

      const total = await cartHelpers.getCartTotal();

      // Should calculate correct total (may include tax/shipping)
      expect(total).toContain('79.98'); // Basic total without tax
    });
  });

  test.describe('Checkout Process', () => {
    test('should proceed to checkout with items in cart', async ({ page }) => {
      await cartHelpers.addProductToCart();
      await cartHelpers.proceedToCheckout();

      // Should be on checkout page
      await expect(page.locator(testSelectors.shippingForm)).toBeVisible();
    });

    test('should not allow checkout with empty cart', async ({ page }) => {
      await cartHelpers.goToCart();

      // Checkout button should be disabled or not visible
      const checkoutButton = page.locator(testSelectors.checkoutButton);
      await expect(checkoutButton).toBeDisabled();
    });

    test('should fill shipping information', async ({ page }) => {
      await cartHelpers.addProductToCart();
      await cartHelpers.proceedToCheckout();

      // Fill shipping form
      await page.fill('[data-testid="first-name"]', 'John');
      await page.fill('[data-testid="last-name"]', 'Doe');
      await page.fill('[data-testid="address"]', '123 Test St');
      await page.fill('[data-testid="city"]', 'Test City');
      await page.fill('[data-testid="state"]', 'CA');
      await page.fill('[data-testid="zip-code"]', '12345');
      await page.fill('[data-testid="country"]', 'US');

      // Continue to payment
      await page.click('[data-testid="continue-to-payment"]');

      // Should show payment form
      await expect(page.locator(testSelectors.paymentForm)).toBeVisible();
    });

    test('should validate shipping form', async ({ page }) => {
      await cartHelpers.addProductToCart();
      await cartHelpers.proceedToCheckout();

      // Try to continue without filling required fields
      await page.click('[data-testid="continue-to-payment"]');

      // Should show validation errors
      await expect(page.locator(testSelectors.errorMessage)).toBeVisible();
    });
  });

  test.describe('Order Completion', () => {
    test('should complete order with valid payment', async ({ page }) => {
      await cartHelpers.addProductToCart();
      await cartHelpers.proceedToCheckout();

      // Fill shipping information
      await page.fill('[data-testid="first-name"]', 'John');
      await page.fill('[data-testid="last-name"]', 'Doe');
      await page.fill('[data-testid="address"]', '123 Test St');
      await page.fill('[data-testid="city"]', 'Test City');
      await page.fill('[data-testid="state"]', 'CA');
      await page.fill('[data-testid="zip-code"]', '12345');
      await page.fill('[data-testid="country"]', 'US');

      await page.click('[data-testid="continue-to-payment"]');

      // Fill payment information (using Stripe test card)
      const cardFrame = page.frameLocator('[data-testid="stripe-card-element"] iframe');
      await cardFrame.locator('[name="cardnumber"]').fill('4242424242424242');
      await cardFrame.locator('[name="exp-date"]').fill('12/34');
      await cardFrame.locator('[name="cvc"]').fill('123');

      // Place order
      await page.click(testSelectors.placeOrderButton);

      // Should redirect to order confirmation
      await page.waitForURL('**/order-confirmation/**');

      // Should show order confirmation
      await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();

      // Cart should be empty
      await cartHelpers.verifyCartIsEmpty();
    });

    test('should handle payment failures gracefully', async ({ page }) => {
      await cartHelpers.addProductToCart();
      await cartHelpers.proceedToCheckout();

      // Fill shipping information
      await page.fill('[data-testid="first-name"]', 'John');
      await page.fill('[data-testid="last-name"]', 'Doe');
      await page.fill('[data-testid="address"]', '123 Test St');
      await page.fill('[data-testid="city"]', 'Test City');
      await page.fill('[data-testid="state"]', 'CA');
      await page.fill('[data-testid="zip-code"]', '12345');
      await page.fill('[data-testid="country"]', 'US');

      await page.click('[data-testid="continue-to-payment"]');

      // Use declined test card
      const cardFrame = page.frameLocator('[data-testid="stripe-card-element"] iframe');
      await cardFrame.locator('[name="cardnumber"]').fill('4000000000000002');
      await cardFrame.locator('[name="exp-date"]').fill('12/34');
      await cardFrame.locator('[name="cvc"]').fill('123');

      // Attempt to place order
      await page.click(testSelectors.placeOrderButton);

      // Should show payment error
      await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();

      // Should remain on checkout page
      expect(page.url()).toContain('/checkout');
    });
  });
});
