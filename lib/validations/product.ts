import { z } from 'zod';

// Base product schema
export const productSchema = z.object({
  name: z.string().min(1, { message: 'Product name is required' }),
  description: z.string().nullable().optional(),
  price: z.number().min(0, { message: 'Price must be a positive number' }),
  discount_percent: z.number().min(0).max(100).default(0),
  image_url: z.string().url({ message: 'Invalid image URL' }).or(z.literal('')).nullable().optional(),
  category_id: z.string().uuid({ message: 'Invalid category ID' }).nullable().optional(),
  inventory_count: z
    .number()
    .int()
    .min(0, { message: 'Inventory count must be a non-negative integer' })
    .default(0),
  is_featured: z.boolean().default(false),
  specifications: z.record(z.string()).optional().default({}),
  stripe_product_id: z.string().nullable().optional(),
});

// Schema for creating a new product
export const createProductSchema = productSchema;

// Schema for updating an existing product
export const updateProductSchema = productSchema.partial();

// Schema for product query parameters
export const productQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  orderBy: z.enum(['name', 'price', 'created_at', 'updated_at']).default('created_at'),
  orderDirection: z.enum(['asc', 'desc']).default('desc'),
  category_id: z.string().uuid({ message: 'Invalid category ID' }).optional(),
  is_featured: z.boolean().optional(),
  search: z.string().optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
});

// Types
export type Product = z.infer<typeof productSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
