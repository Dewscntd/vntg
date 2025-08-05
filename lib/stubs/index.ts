// Development Stubs Configuration
// Set NEXT_PUBLIC_USE_STUBS=true in .env.local to enable stubs for local development

export const USE_STUBS = true; // Temporarily force stubs for development

console.log('🔍 Environment check:', {
  NEXT_PUBLIC_USE_STUBS: process.env.NEXT_PUBLIC_USE_STUBS,
  USE_STUBS,
});

// Basic stubs
export * from './supabase-stub';
export * from './stripe-stub';
export * from './mock-data';

// Enhanced functionality
export * from './extensive-mock-data';
export * from './enhanced-supabase-stub';
export * from './error-scenarios';
export * from './cart-order-flows';
export * from './admin-mocks';
export * from './file-upload-simulation';

// Conditional exports based on stub usage
export const createSupabaseStub = USE_STUBS 
  ? require('./enhanced-supabase-stub').createEnhancedSupabaseStub
  : require('./supabase-stub').createSupabaseStub;

// Make testing utilities available globally in development
if (typeof window !== 'undefined' && USE_STUBS) {
  const { errorTestUtils } = require('./error-scenarios');
  const { mockCheckoutFlow } = require('./cart-order-flows');
  const { mockAdminAnalytics, mockAdminProductManager, mockAdminOrderManager } = require('./admin-mocks');
  const { mockFileUploadManager } = require('./file-upload-simulation');
  
  (window as any).mockingUtils = {
    errorTestUtils,
    checkoutFlow: mockCheckoutFlow,
    admin: {
      analytics: mockAdminAnalytics,
      products: mockAdminProductManager,
      orders: mockAdminOrderManager,
    },
    fileUpload: mockFileUploadManager,
  };
  
  console.log('🔧 Enhanced mocking utilities available at window.mockingUtils');
  console.log('📊 Available utilities:', Object.keys((window as any).mockingUtils));
}