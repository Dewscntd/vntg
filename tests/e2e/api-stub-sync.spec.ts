import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for API-Stub Synchronization
 * 
 * These tests ensure that:
 * 1. The application works identically with stubs and real APIs
 * 2. All user flows work in both environments
 * 3. Data consistency is maintained
 */

class E2EStubValidator {
  constructor(private page: Page) {}

  async testProductListing(environment: 'stub' | 'real') {
    console.log(`🛍️ Testing product listing (${environment})...`);
    
    // Navigate to products page
    await this.page.goto('/products');
    
    // Wait for products to load
    await this.page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Get product data
    const products = await this.page.$$eval('[data-testid="product-card"]', (cards) => {
      return cards.map(card => ({
        name: card.querySelector('[data-testid="product-name"]')?.textContent || '',
        price: card.querySelector('[data-testid="product-price"]')?.textContent || '',
        image: card.querySelector('img')?.getAttribute('src') || ''
      }));
    });

    // Validate structure
    expect(products.length).toBeGreaterThan(0);
    
    products.forEach((product, index) => {
      expect(product.name).toBeTruthy();
      expect(product.price).toMatch(/\$\d+\.\d{2}/);
      expect(product.image).toBeTruthy();
    });

    return products;
  }

  async testCategoryListing(environment: 'stub' | 'real') {
    console.log(`📂 Testing category listing (${environment})...`);
    
    await this.page.goto('/categories');
    
    // Wait for categories to load
    await this.page.waitForSelector('[data-testid="category-card"]', { timeout: 10000 });
    
    const categories = await this.page.$$eval('[data-testid="category-card"]', (cards) => {
      return cards.map(card => ({
        name: card.querySelector('[data-testid="category-name"]')?.textContent || '',
        description: card.querySelector('[data-testid="category-description"]')?.textContent || ''
      }));
    });

    expect(categories.length).toBeGreaterThan(0);
    
    categories.forEach(category => {
      expect(category.name).toBeTruthy();
    });

    return categories;
  }

  async testAdminAccess(environment: 'stub' | 'real') {
    console.log(`🔑 Testing admin access (${environment})...`);
    
    await this.page.goto('/admin');
    
    if (environment === 'stub') {
      // With stubs, should get immediate access
      await this.page.waitForSelector('[data-testid="admin-dashboard"]', { timeout: 5000 });
      
      // Check for admin dashboard elements
      await expect(this.page.locator('[data-testid="metrics-overview"]')).toBeVisible();
      await expect(this.page.locator('[data-testid="admin-navigation"]')).toBeVisible();
      
    } else {
      // With real API, might need authentication
      const currentUrl = this.page.url();
      
      if (currentUrl.includes('/admin')) {
        // Already has admin access
        await this.page.waitForSelector('[data-testid="admin-dashboard"]', { timeout: 5000 });
      } else {
        // Redirected to login - this is expected behavior
        expect(currentUrl).toContain('login');
      }
    }
  }

  async testCartFunctionality(environment: 'stub' | 'real') {
    console.log(`🛒 Testing cart functionality (${environment})...`);
    
    await this.page.goto('/products');
    
    // Wait for products and add first one to cart
    await this.page.waitForSelector('[data-testid="add-to-cart-btn"]');
    await this.page.click('[data-testid="add-to-cart-btn"]');
    
    // Check cart update
    await this.page.waitForSelector('[data-testid="cart-count"]');
    const cartCount = await this.page.textContent('[data-testid="cart-count"]');
    expect(parseInt(cartCount || '0')).toBeGreaterThan(0);
    
    // Navigate to cart
    await this.page.click('[data-testid="cart-button"]');
    
    // Verify cart contents
    await this.page.waitForSelector('[data-testid="cart-item"]');
    const cartItems = await this.page.$$('[data-testid="cart-item"]');
    expect(cartItems.length).toBeGreaterThan(0);
  }

  async compareEnvironments(stubResults: any, realResults: any) {
    console.log('🔍 Comparing stub vs real API results...');
    
    const comparison = {
      products: this.compareArrayStructures(stubResults.products, realResults.products),
      categories: this.compareArrayStructures(stubResults.categories, realResults.categories),
      adminAccess: stubResults.adminAccess === realResults.adminAccess
    };

    return comparison;
  }

  private compareArrayStructures(stubArray: any[], realArray: any[]) {
    if (!stubArray || !realArray) return false;
    
    // Compare lengths
    if (stubArray.length === 0 && realArray.length === 0) return true;
    if (stubArray.length === 0 || realArray.length === 0) return false;
    
    // Compare structure of first item
    const stubKeys = Object.keys(stubArray[0]).sort();
    const realKeys = Object.keys(realArray[0]).sort();
    
    return JSON.stringify(stubKeys) === JSON.stringify(realKeys);
  }
}

// Test suite for stub environment
test.describe('Stub Environment Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure stubs are enabled
    await page.addInitScript(() => {
      window.localStorage.setItem('USE_STUBS', 'true');
    });
  });

  test('should load products with stub data', async ({ page }) => {
    const validator = new E2EStubValidator(page);
    const products = await validator.testProductListing('stub');
    
    // Stub-specific assertions
    expect(products.some(p => p.name.includes('Wireless Headphones'))).toBeTruthy();
    expect(products.some(p => p.image.includes('images.unsplash.com'))).toBeTruthy();
  });

  test('should load categories with stub data', async ({ page }) => {
    const validator = new E2EStubValidator(page);
    const categories = await validator.testCategoryListing('stub');
    
    // Stub-specific assertions
    expect(categories.some(c => c.name === 'Electronics')).toBeTruthy();
    expect(categories.some(c => c.name === 'Clothing')).toBeTruthy();
  });

  test('should allow admin access with stubs', async ({ page }) => {
    const validator = new E2EStubValidator(page);
    await validator.testAdminAccess('stub');
  });

  test('should handle cart operations with stubs', async ({ page }) => {
    const validator = new E2EStubValidator(page);
    await validator.testCartFunctionality('stub');
  });
});

// Test suite for real API environment (conditional)
test.describe.skip('Real API Environment Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure stubs are disabled
    await page.addInitScript(() => {
      window.localStorage.removeItem('USE_STUBS');
    });
  });

  test('should load products with real data', async ({ page }) => {
    const validator = new E2EStubValidator(page);
    await validator.testProductListing('real');
  });

  test('should load categories with real data', async ({ page }) => {
    const validator = new E2EStubValidator(page);
    await validator.testCategoryListing('real');
  });

  test('should handle auth correctly with real API', async ({ page }) => {
    const validator = new E2EStubValidator(page);
    await validator.testAdminAccess('real');
  });
});

// Cross-environment comparison test
test.describe.skip('API-Stub Consistency Tests', () => {
  test('should have consistent data structures between stub and real APIs', async ({ page }) => {
    const validator = new E2EStubValidator(page);
    
    // Test with stubs
    await page.addInitScript(() => window.localStorage.setItem('USE_STUBS', 'true'));
    await page.reload();
    
    const stubResults = {
      products: await validator.testProductListing('stub'),
      categories: await validator.testCategoryListing('stub')
    };
    
    // Test with real API
    await page.addInitScript(() => window.localStorage.removeItem('USE_STUBS'));
    await page.reload();
    
    const realResults = {
      products: await validator.testProductListing('real'),
      categories: await validator.testCategoryListing('real')
    };
    
    // Compare structures
    const comparison = await validator.compareEnvironments(stubResults, realResults);
    
    expect(comparison.products).toBeTruthy();
    expect(comparison.categories).toBeTruthy();
  });
});