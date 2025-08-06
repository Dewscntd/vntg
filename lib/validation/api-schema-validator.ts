/**
 * API Schema Validator
 *
 * This module provides runtime validation to ensure that stub responses
 * match the expected API response schemas. It can be used in:
 * - Development to catch schema mismatches early
 * - Tests to validate API consistency
 * - CI/CD to prevent deployment of inconsistent stubs
 */

import { z } from 'zod';

// Define expected API response schemas
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  category_id: z.string().nullable(),
  image_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  inventory_count: z.number(),
  is_featured: z.boolean(),
  stripe_product_id: z.string().nullable(),
});

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  parent_id: z.string().nullable(),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  created_at: z.string(),
  updated_at: z.string(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  role: z.enum(['customer', 'admin']),
  is_verified: z.boolean().optional(),
  avatar_url: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  preferences: z.record(z.any()).optional(),
});

export const CartItemSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  product_id: z.string(),
  quantity: z.number().min(1),
  created_at: z.string(),
  updated_at: z.string(),
});

// API Response wrapper schemas
export const APIResponseSchema = z.object({
  status: z.literal('success'),
  data: z.any(),
});

export const ProductListResponseSchema = APIResponseSchema.extend({
  data: z.object({
    products: z.array(ProductSchema),
    pagination: z.object({
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
    }),
  }),
});

export const CategoryListResponseSchema = APIResponseSchema.extend({
  data: z.object({
    categories: z.array(CategorySchema),
    pagination: z.object({
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
    }),
  }),
});

export const ProductDetailResponseSchema = APIResponseSchema.extend({
  data: ProductSchema.extend({
    categories: z
      .object({
        id: z.string(),
        name: z.string(),
      })
      .nullable()
      .optional(),
  }),
});

export const CategoryDetailResponseSchema = APIResponseSchema.extend({
  data: CategorySchema.extend({
    subcategories: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    ),
    products: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        image_url: z.string().nullable(),
      })
    ),
  }),
});

export class APISchemaValidator {
  private validationResults: {
    endpoint: string;
    schema: string;
    valid: boolean;
    errors?: any[];
    data?: any;
  }[] = [];

  async validateEndpoint(url: string, expectedSchema: z.ZodSchema, schemaName: string) {
    try {
      console.log(`🔍 Validating ${url} against ${schemaName} schema...`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const validation = expectedSchema.safeParse(data);

      if (validation.success) {
        console.log(`✅ ${url} - Schema validation passed`);
        this.validationResults.push({
          endpoint: url,
          schema: schemaName,
          valid: true,
          data: validation.data,
        });
        return { valid: true, data: validation.data };
      } else {
        console.log(`❌ ${url} - Schema validation failed`);
        console.log('Errors:', validation.error.issues);

        this.validationResults.push({
          endpoint: url,
          schema: schemaName,
          valid: false,
          errors: validation.error.issues,
          data,
        });

        return {
          valid: false,
          errors: validation.error.issues,
          data,
        };
      }
    } catch (error) {
      console.log(`💥 ${url} - Request failed: ${error instanceof Error ? error.message : error}`);

      this.validationResults.push({
        endpoint: url,
        schema: schemaName,
        valid: false,
        errors: [{ message: error instanceof Error ? error.message : String(error) }],
      });

      return {
        valid: false,
        errors: [{ message: error instanceof Error ? error.message : String(error) }],
      };
    }
  }

  async validateAllEndpoints(baseUrl: string = 'http://localhost:3000/api') {
    console.log('🚀 Starting comprehensive API schema validation...\n');

    const validations = [
      // Products endpoints
      {
        url: `${baseUrl}/products?limit=5`,
        schema: ProductListResponseSchema,
        name: 'ProductListResponse',
      },
      {
        url: `${baseUrl}/products/prod-1`,
        schema: ProductDetailResponseSchema,
        name: 'ProductDetailResponse',
      },

      // Categories endpoints
      {
        url: `${baseUrl}/categories?limit=5`,
        schema: CategoryListResponseSchema,
        name: 'CategoryListResponse',
      },
      {
        url: `${baseUrl}/categories/cat-1`,
        schema: CategoryDetailResponseSchema,
        name: 'CategoryDetailResponse',
      },
    ];

    const results = [];

    for (const validation of validations) {
      const result = await this.validateEndpoint(
        validation.url,
        validation.schema,
        validation.name
      );

      results.push({
        ...validation,
        result,
      });

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  }

  generateStubValidationFile() {
    const timestamp = new Date().toISOString();

    return `// Generated API Schema Validation for Stubs
// Generated: ${timestamp}
// This file contains runtime validation for stub data

import { mockProducts, mockCategories } from './mock-data';
import { 
  ProductSchema, 
  CategorySchema,
  ProductListResponseSchema,
  CategoryListResponseSchema 
} from '../validation/api-schema-validator';

export function validateStubData() {
  const results = {
    products: [],
    categories: [],
    valid: true
  };

  // Validate mock products
  console.log('🔍 Validating mock products...');
  for (const product of mockProducts) {
    const validation = ProductSchema.safeParse(product);
    if (!validation.success) {
      console.error('❌ Invalid product stub:', product.id, validation.error);
      results.valid = false;
      results.products.push({
        id: product.id,
        errors: validation.error.issues
      });
    }
  }

  // Validate mock categories
  console.log('🔍 Validating mock categories...');
  for (const category of mockCategories) {
    const validation = CategorySchema.safeParse(category);
    if (!validation.success) {
      console.error('❌ Invalid category stub:', category.id, validation.error);
      results.valid = false;
      results.categories.push({
        id: category.id,
        errors: validation.error.issues
      });
    }
  }

  if (results.valid) {
    console.log('✅ All stub data is valid!');
  } else {
    console.error('❌ Stub validation failed. Check errors above.');
  }

  return results;
}

// Auto-validate in development
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_STUBS === 'true') {
  validateStubData();
}
`;
  }

  getValidationSummary() {
    const total = this.validationResults.length;
    const passed = this.validationResults.filter((r) => r.valid).length;
    const failed = total - passed;
    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return {
      total,
      passed,
      failed,
      successRate,
      results: this.validationResults,
    };
  }

  generateReport() {
    const summary = this.getValidationSummary();

    return `# API Schema Validation Report

Generated: ${new Date().toISOString()}

## Summary
- **Total Validations**: ${summary.total}
- **Passed**: ${summary.passed}
- **Failed**: ${summary.failed}
- **Success Rate**: ${summary.successRate}%

## Results

${summary.results
  .map(
    (result) => `
### ${result.endpoint}
- **Schema**: ${result.schema}
- **Status**: ${result.valid ? '✅ PASSED' : '❌ FAILED'}
${result.errors ? `- **Errors**: ${result.errors.map((e) => e.message || JSON.stringify(e)).join(', ')}` : ''}
`
  )
  .join('')}

## Recommendations

${
  summary.failed > 0
    ? `
- Update stub data to match schema requirements
- Review API response structures
- Update TypeScript types if schema has changed
- Run \`npm run sync:api-stubs\` to auto-generate fixes
`
    : 'All schemas are valid! 🎉'
}
`;
  }
}

// Utility function for quick validation
export async function validateAPIStubSync(baseUrl?: string) {
  const validator = new APISchemaValidator();
  const results = await validator.validateAllEndpoints(baseUrl);

  console.log('\n📊 VALIDATION SUMMARY');
  console.log('='.repeat(50));

  const summary = validator.getValidationSummary();
  console.log(`✅ Passed: ${summary.passed}/${summary.total}`);
  console.log(`❌ Failed: ${summary.failed}/${summary.total}`);
  console.log(`📈 Success Rate: ${summary.successRate}%`);

  if (summary.failed > 0) {
    console.log('\n❌ FAILED VALIDATIONS:');
    summary.results
      .filter((r) => !r.valid)
      .forEach((r) => {
        console.log(`\n${r.endpoint} (${r.schema})`);
        if (r.errors) {
          r.errors.forEach((error) => {
            console.log(`  → ${error.message || JSON.stringify(error)}`);
          });
        }
      });
  }

  return validator;
}

// Schemas are already exported above
