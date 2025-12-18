import { z } from 'zod';
import { Database } from './supabase';

// Base types from database
export type Collection = Database['public']['Tables']['collections']['Row'];
export type CollectionInsert = Database['public']['Tables']['collections']['Insert'];
export type CollectionUpdate = Database['public']['Tables']['collections']['Update'];

export type CollectionProduct = Database['public']['Tables']['collection_products']['Row'];
export type CollectionProductInsert = Database['public']['Tables']['collection_products']['Insert'];
export type CollectionProductUpdate = Database['public']['Tables']['collection_products']['Update'];

// Extended types with relations
export type CollectionWithProducts = Collection & {
  products: CollectionProductWithDetails[];
  product_count: number;
};

export type CollectionProductWithDetails = CollectionProduct & {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    inventory_count: number;
    is_featured: boolean;
  };
};

// Status enum for type safety
export const CollectionStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

export type CollectionStatusType = (typeof CollectionStatus)[keyof typeof CollectionStatus];

// Zod validation schemas
export const collectionSlugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be less than 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only');

export const collectionFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  slug: collectionSlugSchema,
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  image_url: z.string().url('Must be a valid URL').optional().nullable(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  display_order: z.number().int().min(0).default(0),
  metadata: z.record(z.unknown()).default({}),
});

export const collectionProductOrderSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  display_order: z.number().int().min(0),
});

export const updateCollectionProductsSchema = z.object({
  collection_id: z.string().uuid('Invalid collection ID'),
  products: z.array(collectionProductOrderSchema),
});

// Form data types
export type CollectionFormData = z.infer<typeof collectionFormSchema>;
export type CollectionProductOrder = z.infer<typeof collectionProductOrderSchema>;
export type UpdateCollectionProductsData = z.infer<typeof updateCollectionProductsSchema>;

// API response types
export type CollectionListResponse = {
  collections: CollectionWithProducts[];
  total: number;
  page: number;
  pageSize: number;
};

export type CollectionResponse = {
  collection: CollectionWithProducts;
};

// Helper function to generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Status badge config for UI
export const statusConfig: Record<CollectionStatusType, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  archived: { label: 'Archived', color: 'bg-yellow-100 text-yellow-700' },
};
