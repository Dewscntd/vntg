// Error scenarios and edge cases for comprehensive testing
export interface ErrorScenario {
  id: string;
  name: string;
  description: string;
  trigger: () => boolean;
  error: { message: string; code?: string; statusCode?: number };
}

export const errorScenarios: ErrorScenario[] = [
  {
    id: 'network_timeout',
    name: 'Network Timeout',
    description: 'Simulates network timeout errors',
    trigger: () => Math.random() < 0.02,
    error: {
      message: 'Request timeout',
      code: 'TIMEOUT',
      statusCode: 408,
    },
  },
  {
    id: 'server_error',
    name: 'Internal Server Error',
    description: 'Simulates 500 server errors',
    trigger: () => Math.random() < 0.01,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    },
  },
  {
    id: 'rate_limit',
    name: 'Rate Limit Exceeded',
    description: 'Simulates rate limiting',
    trigger: () => Math.random() < 0.005,
    error: {
      message: 'Too many requests',
      code: 'RATE_LIMIT',
      statusCode: 429,
    },
  },
  {
    id: 'auth_expired',
    name: 'Authentication Expired',
    description: 'Simulates expired authentication tokens',
    trigger: () => Math.random() < 0.008,
    error: {
      message: 'Authentication token expired',
      code: 'AUTH_EXPIRED',
      statusCode: 401,
    },
  },
  {
    id: 'insufficient_permissions',
    name: 'Insufficient Permissions',
    description: 'Simulates permission denied errors',
    trigger: () => Math.random() < 0.01,
    error: {
      message: 'Insufficient permissions',
      code: 'PERMISSION_DENIED',
      statusCode: 403,
    },
  },
  {
    id: 'payment_declined',
    name: 'Payment Declined',
    description: 'Simulates payment failures',
    trigger: () => Math.random() < 0.15, // Higher rate for payment testing
    error: {
      message: 'Your card was declined',
      code: 'CARD_DECLINED',
      statusCode: 402,
    },
  },
  {
    id: 'inventory_insufficient',
    name: 'Insufficient Inventory',
    description: 'Simulates out of stock scenarios',
    trigger: () => Math.random() < 0.05,
    error: {
      message: 'Insufficient inventory',
      code: 'OUT_OF_STOCK',
      statusCode: 400,
    },
  },
  {
    id: 'validation_error',
    name: 'Validation Error',
    description: 'Simulates data validation failures',
    trigger: () => Math.random() < 0.03,
    error: {
      message: 'Invalid data provided',
      code: 'VALIDATION_ERROR',
      statusCode: 422,
    },
  },
];

// Edge case test data
export const edgeCaseData = {
  // Products with edge cases
  extremeProducts: [
    {
      id: 'edge-prod-1',
      name: 'Product with Very Long Name That Exceeds Normal Display Limits and Contains Special Characters!@#$%^&*()',
      description:
        'This is an extremely long description that tests how the UI handles overflow text. '.repeat(
          10
        ),
      price: 0.01, // Minimum price
      stock_quantity: 0, // Out of stock
      rating: null, // No rating
      review_count: 0, // No reviews
      images: [], // No images
      tags: [], // No tags
    },
    {
      id: 'edge-prod-2',
      name: '',
      description: '',
      price: 999999.99, // Maximum price
      stock_quantity: 999999, // Maximum stock
      rating: 5.0,
      review_count: 999999,
      images: Array(50).fill('https://picsum.photos/400/400'), // Many images
      tags: Array(100).fill('tag'), // Many tags
    },
  ],

  // Users with edge cases
  extremeUsers: [
    {
      id: 'edge-user-1',
      email:
        'user.with.very.long.email.address.that.tests.display.limits@extremely.long.domain.name.example.com',
      first_name: 'VeryLongFirstNameThatExceedsNormalLimits',
      last_name: 'EvenLongerLastNameThatDefinitelyExceedsDisplayLimits',
      phone: '+1234567890123456789', // Very long phone
    },
    {
      id: 'edge-user-2',
      email: 'a@b.c', // Minimal email
      first_name: 'A',
      last_name: 'B',
      phone: null, // No phone
    },
  ],

  // Orders with edge cases
  extremeOrders: [
    {
      id: 'edge-order-1',
      total: 0.01, // Minimum order
      currency: 'USD',
      status: 'cancelled',
      items: [], // Empty order
    },
    {
      id: 'edge-order-2',
      total: 999999.99, // Maximum order
      currency: 'JPY', // Different currency
      status: 'refunded',
      items: Array(100).fill({}), // Many items
    },
  ],
};

// Test scenarios for different user states
export const userStateScenarios = {
  // New user with no activity
  newUser: {
    id: 'scenario-new-user',
    email: 'newuser@example.com',
    first_name: 'New',
    last_name: 'User',
    created_at: new Date().toISOString(),
    orders: [],
    cart_items: [],
    is_verified: false,
  },

  // Power user with lots of activity
  powerUser: {
    id: 'scenario-power-user',
    email: 'poweruser@example.com',
    first_name: 'Power',
    last_name: 'User',
    created_at: new Date('2020-01-01').toISOString(),
    orders: Array(50).fill({}),
    cart_items: Array(20).fill({}),
    is_verified: true,
  },

  // Suspended user
  suspendedUser: {
    id: 'scenario-suspended-user',
    email: 'suspended@example.com',
    first_name: 'Suspended',
    last_name: 'User',
    role: 'suspended',
    is_verified: true,
  },
};

// Network condition simulation
export const networkConditions = {
  offline: {
    name: 'Offline',
    delay: 0,
    errorRate: 1.0, // 100% failure
    error: { message: 'Network unavailable', code: 'NETWORK_ERROR' },
  },
  slow3g: {
    name: 'Slow 3G',
    delay: 2000, // 2 second delay
    errorRate: 0.1, // 10% failure rate
    error: { message: 'Connection timeout', code: 'TIMEOUT' },
  },
  fast3g: {
    name: 'Fast 3G',
    delay: 500, // 500ms delay
    errorRate: 0.05, // 5% failure rate
  },
  wifi: {
    name: 'WiFi',
    delay: 100, // 100ms delay
    errorRate: 0.01, // 1% failure rate
  },
  fiber: {
    name: 'Fiber',
    delay: 20, // 20ms delay
    errorRate: 0.001, // 0.1% failure rate
  },
};

// Browser state scenarios
export const browserStateScenarios = {
  lowMemory: {
    name: 'Low Memory',
    description: 'Simulates low memory conditions',
    effects: {
      imageLoadFailure: 0.3,
      slowRender: 2000,
      cacheDisabled: true,
    },
  },
  oldBrowser: {
    name: 'Old Browser',
    description: 'Simulates older browser limitations',
    effects: {
      featureUnavailable: ['webp', 'modern-css'],
      slowJavaScript: 1.5,
    },
  },
  mobileBrowser: {
    name: 'Mobile Browser',
    description: 'Simulates mobile browser constraints',
    effects: {
      touchOnly: true,
      smallScreen: true,
      limitedBandwidth: true,
    },
  },
};

// Utility functions for error testing
export const errorTestUtils = {
  // Force a specific error scenario
  forceError: (scenarioId: string) => {
    const scenario = errorScenarios.find((s) => s.id === scenarioId);
    if (scenario) {
      // Override the trigger to always return true
      scenario.trigger = () => true;
      console.log(`Forcing error scenario: ${scenario.name}`);
    }
  },

  // Reset all error scenarios to normal probability
  resetErrors: () => {
    errorScenarios.forEach((scenario) => {
      // Reset triggers to original probabilities
      switch (scenario.id) {
        case 'network_timeout':
          scenario.trigger = () => Math.random() < 0.02;
          break;
        case 'server_error':
          scenario.trigger = () => Math.random() < 0.01;
          break;
        // ... reset other scenarios
      }
    });
    console.log('Error scenarios reset to normal probabilities');
  },

  // Set custom error rate for all scenarios
  setGlobalErrorRate: (rate: number) => {
    errorScenarios.forEach((scenario) => {
      scenario.trigger = () => Math.random() < rate;
    });
    console.log(`Global error rate set to ${rate * 100}%`);
  },

  // Log error statistics
  logErrorStats: () => {
    console.table(
      errorScenarios.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
      }))
    );
  },
};

// Make error utilities available globally for testing
if (typeof window !== 'undefined') {
  (window as any).errorTestUtils = errorTestUtils;
  (window as any).errorScenarios = errorScenarios;
  console.log('Error testing utilities available at window.errorTestUtils');
}
