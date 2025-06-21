// Test user credentials
export const testUsers = {
  customer: {
    email: 'customer@test.com',
    password: 'testpassword123',
    name: 'Test Customer',
  },
  admin: {
    email: 'admin@test.com',
    password: 'adminpassword123',
    name: 'Test Admin',
  },
}

// Test product data
export const testProducts = [
  {
    id: 'test-product-1',
    name: 'Test Product 1',
    description: 'A great test product for automated testing',
    price: 29.99,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    category: 'Electronics',
    inventory_count: 10,
  },
  {
    id: 'test-product-2',
    name: 'Test Product 2',
    description: 'Another excellent test product',
    price: 49.99,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    category: 'Fashion',
    inventory_count: 5,
  },
  {
    id: 'test-product-3',
    name: 'Test Product 3',
    description: 'The best test product you can find',
    price: 19.99,
    image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500',
    category: 'Home',
    inventory_count: 15,
  },
]

// Test shipping address
export const testShippingAddress = {
  firstName: 'John',
  lastName: 'Doe',
  address: '123 Test Street',
  city: 'Test City',
  state: 'CA',
  zipCode: '12345',
  country: 'US',
}

// Test payment methods (Stripe test cards)
export const testPaymentMethods = {
  validCard: {
    number: '4242424242424242',
    expiry: '12/34',
    cvc: '123',
    name: 'John Doe',
  },
  declinedCard: {
    number: '4000000000000002',
    expiry: '12/34',
    cvc: '123',
    name: 'John Doe',
  },
  insufficientFunds: {
    number: '4000000000009995',
    expiry: '12/34',
    cvc: '123',
    name: 'John Doe',
  },
}

// Test categories
export const testCategories = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
  },
  {
    id: 'fashion',
    name: 'Fashion',
    description: 'Clothing and accessories',
  },
  {
    id: 'home',
    name: 'Home',
    description: 'Home and garden items',
  },
]

// Test order data
export const testOrder = {
  items: [
    {
      product_id: 'test-product-1',
      quantity: 2,
    },
    {
      product_id: 'test-product-2',
      quantity: 1,
    },
  ],
  shippingAddress: testShippingAddress,
  shippingMethod: 'standard',
  paymentMethod: testPaymentMethods.validCard,
}

// Helper functions for test data
export const getRandomTestProduct = () => {
  return testProducts[Math.floor(Math.random() * testProducts.length)]
}

export const getRandomTestUser = () => {
  return Math.random() > 0.5 ? testUsers.customer : testUsers.admin
}

export const generateTestEmail = () => {
  const timestamp = Date.now()
  return `test-${timestamp}@example.com`
}

export const generateTestUser = () => ({
  email: generateTestEmail(),
  password: 'testpassword123',
  name: `Test User ${Date.now()}`,
})

// Test URLs
export const testUrls = {
  home: '/',
  products: '/products',
  cart: '/cart',
  checkout: '/checkout',
  login: '/auth/login',
  register: '/auth/register',
  account: '/account',
  admin: '/admin',
}

// Test selectors (data-testid attributes)
export const testSelectors = {
  // Navigation
  navCart: '[data-testid="nav-cart"]',
  navUser: '[data-testid="nav-user"]',
  navLogo: '[data-testid="nav-logo"]',
  
  // Product listing
  productCard: '[data-testid="product-card"]',
  productTitle: '[data-testid="product-title"]',
  productPrice: '[data-testid="product-price"]',
  addToCartButton: '[data-testid="add-to-cart"]',
  
  // Cart
  cartItem: '[data-testid="cart-item"]',
  cartTotal: '[data-testid="cart-total"]',
  cartQuantity: '[data-testid="cart-quantity"]',
  removeFromCart: '[data-testid="remove-from-cart"]',
  checkoutButton: '[data-testid="checkout-button"]',
  
  // Forms
  emailInput: '[data-testid="email-input"]',
  passwordInput: '[data-testid="password-input"]',
  submitButton: '[data-testid="submit-button"]',
  
  // Checkout
  shippingForm: '[data-testid="shipping-form"]',
  paymentForm: '[data-testid="payment-form"]',
  placeOrderButton: '[data-testid="place-order"]',
  
  // Loading states
  loadingSpinner: '[data-testid="loading-spinner"]',
  skeleton: '[data-testid="skeleton"]',
  
  // Notifications
  toast: '[data-testid="toast"]',
  errorMessage: '[data-testid="error-message"]',
  successMessage: '[data-testid="success-message"]',
}
