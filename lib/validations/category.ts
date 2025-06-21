import { z } from 'zod';

// Base category schema
export const categorySchema = z.object({
  name: z.string().min(1, { message: 'Category name is required' }),
  description: z.string().nullable().optional(),
  parent_id: z.string().uuid({ message: 'Invalid parent category ID' }).nullable().optional(),
});

// Schema for creating a new category
export const createCategorySchema = categorySchema;

// Schema for updating an existing category
export const updateCategorySchema = categorySchema.partial();

// Schema for category query parameters
export const categoryQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  orderBy: z.enum(['name', 'created_at', 'updated_at']).default('name'),
  orderDirection: z.enum(['asc', 'desc']).default('asc'),
  parent_id: z.string().uuid({ message: 'Invalid parent category ID' }).nullable().optional(),
  search: z.string().optional(),
});

// Types
export type Category = z.infer<typeof categorySchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
