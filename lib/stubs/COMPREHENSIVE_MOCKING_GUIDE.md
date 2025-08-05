# Comprehensive Mocking Guide for Local Development

This guide covers the extensive mocking system for VNTG e-commerce platform local development.

## 🚀 Quick Start

1. **Enable stubs in `.env.local`:**
   ```env
   NEXT_PUBLIC_USE_STUBS=true
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Access browser utilities:**
   ```javascript
   // Available in browser console
   window.mockingUtils.errorTestUtils.logErrorStats()
   window.mockingUtils.checkoutFlow.cart.addToCart('user-001', 'prod-001', 2)
   ```

## 📊 Available Mock Data

### Products (15+ realistic products)
- **Electronics**: iPhone 15 Pro, MacBook Air M3, Sony WH-1000XM5, Samsung QLED TV, Nintendo Switch
- **Clothing**: Levi's 501 Jeans, Nike Air Force 1, Patagonia Down Jacket
- **Home & Garden**: KitchenAid Mixer, Dyson V15 Vacuum
- **Sports & Fitness**: Peloton Bike+, YETI Tumbler
- **Books & Media**: Bestselling novels and media content
- **Health & Beauty**: CeraVe skincare products
- **Toys & Games**: LEGO Architecture sets
- **Automotive**: Michelin performance tires

### Users (4 different personas)
- **Regular User**: john.doe@example.com / password123
- **Admin User**: admin@vntg.com / admin123
- **Power User**: High activity, many orders
- **New User**: Recently registered, minimal activity

### Categories (8 comprehensive categories)
- Electronics, Clothing, Home & Garden, Sports & Fitness
- Books & Media, Health & Beauty, Toys & Games, Automotive

## 🔍 Advanced Query Simulation

### Database Operations
```javascript
// Enhanced querying with filters, pagination, sorting
const { data: products } = await supabase
  .from('products')
  .select('*')
  .gte('price', 100)
  .lte('price', 500)
  .like('name', '%iPhone%')
  .order('created_at', { ascending: false })
  .limit(10);

// Pagination support
const { data: pagedProducts } = await supabase
  .from('products')
  .select('*')
  .range(0, 19); // First 20 items

// Search functionality
const { data: searchResults } = await supabase
  .rpc('search_products', {
    query: 'wireless headphones',
    category_id: 'cat-1',
    limit: 20
  });
```

### Real-time Subscriptions
```javascript
// Mock real-time updates
const subscription = supabase
  .channel('products')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
    console.log('Product updated:', payload);
  })
  .subscribe();
```

## 🛒 Cart & Checkout Flow

### Cart Management
```javascript
const checkout = window.mockingUtils.checkoutFlow;

// Add items to cart
await checkout.cart.addToCart('user-001', 'prod-001', 2);

// Update quantities
await checkout.cart.updateQuantity('user-001', 'cart-item-id', 3);

// Save for later
await checkout.cart.saveForLater('user-001', 'cart-item-id');

// Apply coupons
await checkout.cart.applyCoupon('user-001', 'SAVE20'); // 20% off
```

### Complete Checkout Process
```javascript
const checkoutData = {
  shipping_address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'US'
  },
  billing_address: { /* same as shipping */ },
  payment_method: {
    card_number: '4242424242424242', // Success
    // card_number: '4000000000000002', // Decline
    exp_month: 12,
    exp_year: 2025,
    cvc: '123'
  },
  shipping_method: 'standard'
};

const result = await checkout.completeCheckout('user-001', checkoutData);
```

## 🔴 Error Scenarios & Testing

### Available Error Types
- **Network Timeout**: 2% probability
- **Server Error**: 1% probability  
- **Rate Limiting**: 0.5% probability
- **Auth Expired**: 0.8% probability
- **Payment Declined**: 15% probability
- **Insufficient Inventory**: 5% probability
- **Validation Error**: 3% probability

### Error Testing Utilities
```javascript
const errorUtils = window.mockingUtils.errorTestUtils;

// View all error scenarios
errorUtils.logErrorStats();

// Force specific errors for testing
errorUtils.forceError('payment_declined');
errorUtils.forceError('network_timeout');

// Set global error rate
errorUtils.setGlobalErrorRate(0.1); // 10% error rate

// Reset to normal
errorUtils.resetErrors();
```

### Test Payment Cards
```javascript
const testCards = {
  '4242424242424242': 'Success',
  '4000000000000002': 'Card declined',
  '4000000000000069': 'Expired card',
  '4000000000000127': 'Incorrect CVC',
  '4000000000000119': 'Processing error'
};
```

## 👥 Admin Functionality

### Dashboard Analytics
```javascript
const admin = window.mockingUtils.admin;

// Get dashboard statistics
const stats = await admin.analytics.getDashboardStats();
console.log('Revenue:', stats.overview.total_revenue);

// Get revenue chart data
const chartData = await admin.analytics.getRevenueChart('30d');
```

### Product Management
```javascript
// Get all products with filters
const products = await admin.products.getAllProducts(
  { category: 'cat-1', status: 'active' },
  { page: 1, limit: 20 }
);

// Create new product
const newProduct = await admin.products.createProduct({
  name: 'New Product',
  price: 99.99,
  category_id: 'cat-1',
  // ... other fields
});

// Bulk operations
await admin.products.bulkUpdatePrices([
  { id: 'prod-001', price: 999.99, compare_price: 1099.99 }
]);
```

### Order Management
```javascript
// Get orders with filters
const orders = await admin.orders.getAllOrders(
  { status: 'pending', payment_status: 'paid' },
  { page: 1, limit: 20 }
);

// Update order status
await admin.orders.updateOrderStatus('order-id', 'processing', 'Order confirmed');

// Add tracking
await admin.orders.addTrackingInfo('order-id', 'TRK123456', 'UPS');

// Process refund
await admin.orders.processRefund('order-id', 100.00, 'Customer request');
```

## 📁 File Upload Simulation

### Basic File Upload
```javascript
const fileManager = window.mockingUtils.fileUpload;

// Upload with progress tracking
const file = document.querySelector('input[type="file"]').files[0];
const result = await fileManager.uploadFile(file, {
  bucket: 'product-images',
  path: `products/${Date.now()}-${file.name}`,
  progressCallback: (progress) => console.log(`Upload: ${progress}%`),
  validationRules: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['jpg', 'jpeg', 'png', 'webp'],
    imageMaxDimensions: { width: 4000, height: 4000 }
  }
});
```

### Batch Upload
```javascript
const files = Array.from(document.querySelector('input[type="file"]').files);
const results = await fileManager.uploadMultipleFiles(files, {
  bucket: 'product-images',
  path: 'products',
  batchProgressCallback: (fileIndex, progress, totalFiles) => {
    console.log(`File ${fileIndex + 1}/${totalFiles}: ${progress}%`);
  }
});
```

### Image Processing
```javascript
// Resize image
const resized = await fileManager.resizeImage(file, { width: 800, height: 600 }, 0.8);

// Generate thumbnails
const thumbnails = await fileManager.generateThumbnails(file, [
  { width: 150, height: 150, suffix: 'thumb' },
  { width: 400, height: 400, suffix: 'medium' },
  { width: 800, height: 800, suffix: 'large' }
]);
```

## 🔧 Network Condition Simulation

### Available Network Conditions
```javascript
const conditions = {
  offline: { delay: 0, errorRate: 1.0 },
  slow3g: { delay: 2000, errorRate: 0.1 },
  fast3g: { delay: 500, errorRate: 0.05 },
  wifi: { delay: 100, errorRate: 0.01 },
  fiber: { delay: 20, errorRate: 0.001 }
};

// Apply network condition (theoretical - would need implementation)
// setNetworkCondition('slow3g');
```

## 📈 Edge Cases & Stress Testing

### Extreme Data Scenarios
- Products with very long names and descriptions
- Users with minimal/maximal data
- Orders with zero/maximum values
- Images with no URLs or many URLs
- Tags with empty/excessive arrays

### User State Scenarios
```javascript
const scenarios = {
  newUser: 'No activity, unverified email',
  powerUser: '50+ orders, verified, high engagement',
  suspendedUser: 'Account suspended',
  edgeUser: 'Extreme data values'
};
```

## 🐛 Debugging Tips

### Console Logs
- All stub operations log to console
- Realistic delays show operation timing
- Error scenarios log when triggered
- File uploads show progress and completion

### Browser DevTools
- Network tab shows simulated API calls
- Console shows detailed stub operation logs
- Application tab shows localStorage cart data
- Performance tab shows simulated delays

### Testing Workflows
1. **Cart Flow**: Add items → Update quantities → Apply coupon → Checkout
2. **Error Handling**: Force errors → Test recovery → Reset to normal
3. **Admin Operations**: View dashboard → Manage products → Process orders
4. **File Upload**: Upload images → Validate → Process → Generate thumbnails

## 🎯 Best Practices

### For UI Development
- Test with realistic data volumes (15+ products)
- Validate error states with forced error scenarios
- Test loading states with simulated delays
- Verify responsive behavior with edge case data

### For Testing
- Use different user personas for various scenarios
- Test complete checkout flows end-to-end
- Validate admin workflows with bulk operations
- Test file upload edge cases and errors

### For Performance
- Monitor simulated delays match real-world expectations
- Test with large datasets (100+ items when needed)
- Validate pagination and infinite scroll behaviors
- Test memory usage with extensive mock data

## 🔄 Switching Between Modes

### Enable Stubs
```env
NEXT_PUBLIC_USE_STUBS=true
```

### Disable Stubs (Use Real APIs)
```env
NEXT_PUBLIC_USE_STUBS=false
# or remove the line entirely
```

Changes take effect after restarting the development server.

---

This comprehensive mocking system enables full-featured local development without external dependencies, realistic testing scenarios, and comprehensive error handling validation.