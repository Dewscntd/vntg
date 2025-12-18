import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { collectionFormSchema, generateSlug, CollectionWithProducts } from '@/types/collections';
import { withAdmin } from '@/lib/api/middleware';
import { successResponse, handleDatabaseError } from '@/lib/api/index';
import { USE_STUBS } from '@/lib/stubs';
import {
  MOCK_COLLECTIONS,
  MOCK_COLLECTION_PRODUCTS,
  MOCK_PRODUCTS,
} from '@/lib/stubs/comprehensive-mock-data';

// In-memory store for stub mode mutations
let stubCollections = [...MOCK_COLLECTIONS];
let stubCollectionProducts = [...MOCK_COLLECTION_PRODUCTS];

// GET /api/admin/collections/[id] - Get single collection with products
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (USE_STUBS) {
    const collection = stubCollections.find((c) => c.id === id);

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    const collectionProductItems = stubCollectionProducts
      .filter((cp) => cp.collection_id === id)
      .sort((a, b) => a.display_order - b.display_order);

    const products = collectionProductItems.map((cp) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === cp.product_id);
      return {
        ...cp,
        product: product
          ? {
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url,
              inventory_count: product.inventory_count,
              is_featured: product.is_featured,
            }
          : {
              id: cp.product_id,
              name: 'Unknown Product',
              price: 0,
              image_url: null,
              inventory_count: 0,
              is_featured: false,
            },
      };
    });

    return successResponse({
      ...collection,
      products,
      product_count: products.length,
    });
  }

  return withAdmin(req, async (req, session) => {
    try {
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient<Database>({
        cookies: () => cookieStore as any,
      });

      // Get collection
      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();

      if (collectionError) {
        if (collectionError.code === 'PGRST116') {
          return NextResponse.json(
            { success: false, error: 'Collection not found' },
            { status: 404 }
          );
        }
        throw collectionError;
      }

      // Get collection products with product details
      const { data: collectionProducts, error: productsError } = await supabase
        .from('collection_products')
        .select(
          `
          id,
          collection_id,
          product_id,
          display_order,
          created_at,
          updated_at,
          products (
            id,
            name,
            price,
            image_url,
            inventory_count,
            is_featured
          )
        `
        )
        .eq('collection_id', id)
        .order('display_order', { ascending: true });

      if (productsError) throw productsError;

      // Transform to expected format
      const products = (collectionProducts || []).map((cp: any) => ({
        id: cp.id,
        collection_id: cp.collection_id,
        product_id: cp.product_id,
        display_order: cp.display_order,
        created_at: cp.created_at,
        updated_at: cp.updated_at,
        product: cp.products,
      }));

      return successResponse({
        ...collection,
        products,
        product_count: products.length,
      });
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}

// PATCH /api/admin/collections/[id] - Update collection
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (USE_STUBS) {
    try {
      const body = await req.json();
      const collectionIndex = stubCollections.findIndex((c) => c.id === id);

      if (collectionIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Collection not found' },
          { status: 404 }
        );
      }

      // Partial validation
      const validated = collectionFormSchema.partial().safeParse(body);

      if (!validated.success) {
        return NextResponse.json(
          { success: false, error: validated.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const updates = validated.data;

      // Check for duplicate slug if updating
      if (updates.slug) {
        const slugExists = stubCollections.some(
          (c) => c.slug === updates.slug && c.id !== id
        );
        if (slugExists) {
          return NextResponse.json(
            { success: false, error: 'A collection with this slug already exists' },
            { status: 400 }
          );
        }
      }

      // Auto-generate slug from name if name changes but slug doesn't
      if (updates.name && !updates.slug) {
        const newSlug = generateSlug(updates.name);
        const slugExists = stubCollections.some(
          (c) => c.slug === newSlug && c.id !== id
        );
        if (!slugExists) {
          updates.slug = newSlug;
        }
      }

      stubCollections[collectionIndex] = {
        ...stubCollections[collectionIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      } as any;

      const collectionProductItems = stubCollectionProducts
        .filter((cp) => cp.collection_id === id)
        .sort((a, b) => a.display_order - b.display_order);

      const products = collectionProductItems.map((cp) => {
        const product = MOCK_PRODUCTS.find((p) => p.id === cp.product_id);
        return {
          ...cp,
          product: product
            ? {
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                inventory_count: product.inventory_count,
                is_featured: product.is_featured,
              }
            : null,
        };
      });

      return successResponse({
        ...stubCollections[collectionIndex],
        products,
        product_count: products.length,
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }
  }

  return withAdmin(req, async (req, session) => {
    try {
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient<Database>({
        cookies: () => cookieStore as any,
      });

      const body = await req.json();
      const validated = collectionFormSchema.partial().safeParse(body);

      if (!validated.success) {
        return NextResponse.json(
          { success: false, error: validated.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const updates = validated.data;

      // Check for duplicate slug if updating
      if (updates.slug) {
        const { data: existing } = await supabase
          .from('collections')
          .select('id')
          .eq('slug', updates.slug)
          .neq('id', id)
          .single();

        if (existing) {
          return NextResponse.json(
            { success: false, error: 'A collection with this slug already exists' },
            { status: 400 }
          );
        }
      }

      const { data: collection, error } = await supabase
        .from('collections')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { success: false, error: 'Collection not found' },
            { status: 404 }
          );
        }
        throw error;
      }

      // Get updated product count
      const { count } = await supabase
        .from('collection_products')
        .select('*', { count: 'exact', head: true })
        .eq('collection_id', id);

      return successResponse({
        ...collection,
        products: [],
        product_count: count || 0,
      });
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}

// DELETE /api/admin/collections/[id] - Delete collection
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (USE_STUBS) {
    const collectionIndex = stubCollections.findIndex((c) => c.id === id);

    if (collectionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    stubCollections.splice(collectionIndex, 1);
    stubCollectionProducts = stubCollectionProducts.filter(
      (cp) => cp.collection_id !== id
    );

    return successResponse({ message: 'Collection deleted successfully' });
  }

  return withAdmin(req, async (req, session) => {
    try {
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient<Database>({
        cookies: () => cookieStore as any,
      });

      // Delete collection (cascade will handle collection_products)
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { success: false, error: 'Collection not found' },
            { status: 404 }
          );
        }
        throw error;
      }

      return successResponse({ message: 'Collection deleted successfully' });
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}
