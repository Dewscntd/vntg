import { loginSchema, registerSchema, resetPasswordSchema } from '@/lib/validations/auth';
import { productSchema, createProductSchema, updateProductSchema } from '@/lib/validations/product';
import {
  shippingAddressSchema,
  billingAddressSchema,
  createOrderSchema,
} from '@/lib/validations/checkout';

describe('Validation Schemas', () => {
  describe('Auth Validations', () => {
    describe('loginSchema', () => {
      it('should validate correct login data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'password123',
        };

        const result = loginSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject invalid email', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'password123',
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid email address');
        }
      });

      it('should reject short password', () => {
        const invalidData = {
          email: 'test@example.com',
          password: '123',
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
        }
      });

      it('should reject missing fields', () => {
        const invalidData = {};

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(2);
        }
      });
    });

    describe('registerSchema', () => {
      it('should validate correct registration data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          fullName: 'John Doe',
        };

        const result = registerSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject mismatched passwords', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'different123',
          fullName: 'John Doe',
        };

        const result = registerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Passwords do not match');
        }
      });

      it('should reject missing full name', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          fullName: '',
        };

        const result = registerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Full name is required');
        }
      });
    });

    describe('resetPasswordSchema', () => {
      it('should validate correct email', () => {
        const validData = { email: 'test@example.com' };

        const result = resetPasswordSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject invalid email', () => {
        const invalidData = { email: 'invalid-email' };

        const result = resetPasswordSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Product Validations', () => {
    describe('productSchema', () => {
      it('should validate correct product data', () => {
        const validData = {
          name: 'Test Product',
          description: 'A test product',
          price: 29.99,
          image_url: 'https://example.com/image.jpg',
          category_id: '123e4567-e89b-12d3-a456-426614174000',
          inventory_count: 10,
        };

        const result = productSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject negative price', () => {
        const invalidData = {
          name: 'Test Product',
          price: -10,
        };

        const result = productSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Price must be a positive number');
        }
      });

      it('should reject invalid image URL', () => {
        const invalidData = {
          name: 'Test Product',
          price: 29.99,
          image_url: 'not-a-url',
        };

        const result = productSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Invalid image URL');
        }
      });

      it('should reject negative inventory count', () => {
        const invalidData = {
          name: 'Test Product',
          price: 29.99,
          inventory_count: -5,
        };

        const result = productSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Inventory count must be a non-negative integer'
          );
        }
      });

      it('should set default values', () => {
        const minimalData = {
          name: 'Test Product',
          price: 29.99,
        };

        const result = productSchema.safeParse(minimalData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.inventory_count).toBe(0);
          expect(result.data.is_featured).toBe(false);
        }
      });
    });
  });

  describe('Checkout Validations', () => {
    describe('shippingAddressSchema', () => {
      it('should validate correct shipping address', () => {
        const validData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'US',
        };

        const result = shippingAddressSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject short ZIP code', () => {
        const invalidData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '123',
          country: 'US',
        };

        const result = shippingAddressSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          const zipCodeError = result.error.issues.find((issue) => issue.path.includes('zipCode'));
          expect(zipCodeError?.message).toBe('ZIP code must be at least 5 characters');
        }
      });

      it('should reject missing required fields', () => {
        const invalidData = {
          firstName: 'John',
        };

        const result = shippingAddressSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(1);
        }
      });
    });

    describe('createOrderSchema', () => {
      it('should validate correct order data', () => {
        const validData = {
          shippingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            address: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            country: 'US',
          },
          paymentMethodId: 'pm_test_123',
          shippingMethod: 'standard' as const,
        };

        const result = createOrderSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject invalid shipping method', () => {
        const invalidData = {
          shippingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            address: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            country: 'US',
          },
          paymentMethodId: 'pm_test_123',
          shippingMethod: 'invalid',
        };

        const result = createOrderSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject long notes', () => {
        const longNotes = 'a'.repeat(501);
        const invalidData = {
          shippingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            address: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            country: 'US',
          },
          paymentMethodId: 'pm_test_123',
          shippingMethod: 'standard' as const,
          notes: longNotes,
        };

        const result = createOrderSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          const notesError = result.error.issues.find((issue) => issue.path.includes('notes'));
          expect(notesError?.message).toBe('Notes too long');
        }
      });
    });
  });
});
