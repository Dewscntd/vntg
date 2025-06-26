import { Page, expect } from '@playwright/test';
import { testSelectors, testUrls } from '../fixtures/test-data';

export class CartHelpers {
  constructor(private page: Page) {}

  async addProductToCart(productName?: string) {
    // Go to products page
    await this.page.goto(testUrls.products);

    // Wait for products to load
    await this.page.waitForSelector(testSelectors.productCard);

    // Find and click on a product (or specific product if name provided)
    if (productName) {
      const productCard = this.page
        .locator(testSelectors.productCard)
        .filter({ hasText: productName });
      await productCard.first().click();
    } else {
      // Click on first available product
      await this.page.locator(testSelectors.productCard).first().click();
    }

    // Wait for product detail page
    await this.page.waitForSelector(testSelectors.addToCartButton);

    // Add to cart
    await this.page.click(testSelectors.addToCartButton);

    // Wait for success notification or cart update
    await expect(this.page.locator(testSelectors.toast)).toBeVisible();
  }

  async goToCart() {
    await this.page.click(testSelectors.navCart);
    await this.page.waitForURL('**/cart');
  }

  async getCartItemCount(): Promise<number> {
    try {
      const cartBadge = this.page.locator('[data-testid="cart-badge"]');
      const count = await cartBadge.textContent();
      return count ? parseInt(count) : 0;
    } catch {
      return 0;
    }
  }

  async updateCartItemQuantity(productName: string, quantity: number) {
    await this.goToCart();

    // Find the cart item
    const cartItem = this.page.locator(testSelectors.cartItem).filter({ hasText: productName });

    // Update quantity
    const quantityInput = cartItem.locator(testSelectors.cartQuantity);
    await quantityInput.fill(quantity.toString());

    // Wait for cart to update
    await this.page.waitForTimeout(1000);
  }

  async removeCartItem(productName: string) {
    await this.goToCart();

    // Find the cart item
    const cartItem = this.page.locator(testSelectors.cartItem).filter({ hasText: productName });

    // Click remove button
    await cartItem.locator(testSelectors.removeFromCart).click();

    // Wait for item to be removed
    await expect(cartItem).not.toBeVisible();
  }

  async clearCart() {
    await this.goToCart();

    // Remove all items
    const removeButtons = this.page.locator(testSelectors.removeFromCart);
    const count = await removeButtons.count();

    for (let i = 0; i < count; i++) {
      await removeButtons.first().click();
      await this.page.waitForTimeout(500);
    }
  }

  async getCartTotal(): Promise<string> {
    await this.goToCart();
    const totalElement = this.page.locator(testSelectors.cartTotal);
    return (await totalElement.textContent()) || '0';
  }

  async proceedToCheckout() {
    await this.goToCart();
    await this.page.click(testSelectors.checkoutButton);
    await this.page.waitForURL('**/checkout');
  }

  async verifyCartIsEmpty() {
    await this.goToCart();

    // Check for empty cart message or no cart items
    const cartItems = this.page.locator(testSelectors.cartItem);
    await expect(cartItems).toHaveCount(0);

    // Verify empty state message
    await expect(this.page.locator('[data-testid="empty-cart"]')).toBeVisible();
  }

  async verifyCartContainsProduct(productName: string, quantity?: number) {
    await this.goToCart();

    const cartItem = this.page.locator(testSelectors.cartItem).filter({ hasText: productName });

    await expect(cartItem).toBeVisible();

    if (quantity) {
      const quantityElement = cartItem.locator(testSelectors.cartQuantity);
      await expect(quantityElement).toHaveValue(quantity.toString());
    }
  }

  async addMultipleProductsToCart(productNames: string[]) {
    for (const productName of productNames) {
      await this.addProductToCart(productName);
      // Small delay between additions
      await this.page.waitForTimeout(500);
    }
  }

  async saveCartForLater() {
    // This would be used for cart abandonment testing
    await this.goToCart();

    // Navigate away without completing purchase
    await this.page.goto(testUrls.home);
  }

  async restoreAbandonedCart() {
    // Navigate back to cart to test cart persistence
    await this.goToCart();

    // Verify cart items are still there
    const cartItems = this.page.locator(testSelectors.cartItem);
    await expect(cartItems.first()).toBeVisible();
  }
}
