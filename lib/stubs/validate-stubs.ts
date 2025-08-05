// Generated API Schema Validation for Stubs
// This file contains runtime validation for stub data

import { mockProducts, mockCategories, mockUser, mockAdminUser } from './mock-data';
import { 
  ProductSchema, 
  CategorySchema,
  UserSchema
} from '../validation/api-schema-validator';

export function validateStubData() {
  const results = {
    products: [] as any[],
    categories: [] as any[],
    users: [] as any[],
    valid: true
  };

  console.log('🔍 Validating stub data schemas...\n');

  // Validate mock products
  console.log('📦 Validating mock products...');
  for (const product of mockProducts) {
    const validation = ProductSchema.safeParse(product);
    if (!validation.success) {
      console.error(`❌ Invalid product stub: ${product.id}`);
      validation.error.issues.forEach(issue => {
        console.error(`   → ${issue.path.join('.')}: ${issue.message}`);
      });
      results.valid = false;
      results.products.push({
        id: product.id,
        errors: validation.error.issues
      });
    } else {
      console.log(`✅ Product ${product.id}: Valid`);
    }
  }

  // Validate mock categories
  console.log('\n📂 Validating mock categories...');
  for (const category of mockCategories) {
    const validation = CategorySchema.safeParse(category);
    if (!validation.success) {
      console.error(`❌ Invalid category stub: ${category.id}`);
      validation.error.issues.forEach(issue => {
        console.error(`   → ${issue.path.join('.')}: ${issue.message}`);
      });
      results.valid = false;
      results.categories.push({
        id: category.id,
        errors: validation.error.issues
      });
    } else {
      console.log(`✅ Category ${category.id}: Valid`);
    }
  }

  // Validate mock users
  console.log('\n👤 Validating mock users...');
  const users = [mockUser, mockAdminUser];
  for (const user of users) {
    const validation = UserSchema.safeParse(user);
    if (!validation.success) {
      console.error(`❌ Invalid user stub: ${user.id}`);
      validation.error.issues.forEach(issue => {
        console.error(`   → ${issue.path.join('.')}: ${issue.message}`);
      });
      results.valid = false;
      results.users.push({
        id: user.id,
        errors: validation.error.issues
      });
    } else {
      console.log(`✅ User ${user.id}: Valid`);
    }
  }

  console.log('\n' + '='.repeat(50));
  if (results.valid) {
    console.log('🎉 All stub data is valid!');
  } else {
    console.error('❌ Stub validation failed. Fix errors above.');
    console.log('\n💡 Tips:');
    console.log('   - Check mock-data.ts for schema mismatches');
    console.log('   - Run "npm run sync:api-stubs" to auto-fix issues');
    console.log('   - Update TypeScript types if needed');
  }
  console.log('='.repeat(50));

  return results;
}

// Export for use in other modules
export { validateStubData as default };

// Auto-validate in development when stubs are enabled
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  // Only run in server-side contexts to avoid browser console spam
  if (process.env.NEXT_PUBLIC_USE_STUBS === 'true') {
    // Delay validation to ensure all modules are loaded
    setTimeout(() => {
      try {
        validateStubData();
      } catch (error) {
        console.warn('⚠️ Stub validation skipped:', error.message);
      }
    }, 1000);
  }
}