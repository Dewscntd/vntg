import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { Database } from '@/types/supabase';
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

// Validation schemas
const addProductsSchema = z.object({
  product_ids: z.array(z.string().uuid()).min(1, 'At least one product is required'),
});

const reorderProductsSchema = z.object({
  products: z.array(
    z.object({
      product_id: z.string().uuid(),
      display_order: z.number().int().min(0),
    })
  ),
});

const removeProductSchema = z.object({
  product_id: z.string().uuid(),
});

// GET /api/admin/collections/[id]/products - Get collection products
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
          : null,
      };
    });

    return successResponse({ products });
  }

  return withAdmin(req, async (req, session) => {
    try {
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient<Database>({
        cookies: () => cookieStore as any,
      });

      // Verify collection exists
      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .select('id')
        .eq('id', id)
        .single();

      if (collectionError || !collection) {
        return NextResponse.json(
          { success: false, error: 'Collection not found' },
          { status: 404 }
        );
      }

      // Get collection products with product details
      const { data: collectionProducts, error } = await supabase
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

      if (error) throw error;

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

      return successResponse({ products });
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}

// POST /api/admin/collections/[id]/products - Add products to collection
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (USE_STUBS) {
    try {
      const body = await req.json();
      const validated = addProductsSchema.safeParse(body);

      if (!validated.success) {
        return NextResponse.json(
          { success: false, error: validated.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { product_ids } = validated.data;

      const collection = stubCollections.find((c) => c.id === id);
      if (!collection) {
        return NextResponse.json(
          { success: false, error: 'Collection not found' },
          { status: 404 }
        );
      }

      // Get current max display_order for the collection
      const currentProducts = stubCollectionProducts.filter(
        (cp) => cp.collection_id === id
      );
      let maxOrder = currentProducts.reduce(
        (max, cp) => Math.max(max, cp.display_order),
        -1
      );

      const addedProducts: any[] = [];

      for (const productId of product_ids) {
        // Check if product exists
        const product = MOCK_PRODUCTS.find((p) => p.id === productId);
        if (!product) continue;

        // Check if already in collection
        const exists = stubCollectionProducts.some(
          (cp) => cp.collection_id === id && cp.product_id === productId
        );
        if (exists) continue;

        maxOrder++;
        const newEntry = {
          id: `80000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, '0')}${Math.random().toString(36).substr(2, 4)}`,
          collection_id: id,
          product_id: productId,
          display_order: maxOrder,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        stubCollectionProducts.push(newEntry as any);
        addedProducts.push({
          ...newEntry,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            inventory_count: product.inventory_count,
            is_featured: product.is_featured,
          },
        });
      }

      return successResponse({ added: addedProducts }, 201);
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
      const validated = addProductsSchema.safeParse(body);

      if (!validated.success) {
        return NextResponse.json(
          { success: false, error: validated.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { product_ids } = validated.data;

      // Verify collection exists
      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .select('id')
        .eq('id', id)
        .single();

      if (collectionError || !collection) {
        return NextResponse.json(
          { success: false, error: 'Collection not found' },
          { status: 404 }
        );
      }

      // Get current max display_order
      const { data: maxOrderData } = await supabase
        .from('collection_products')
        .select('display_order')
        .eq('collection_id', id)
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      let maxOrder = maxOrderData?.display_order ?? -1;

      // Prepare inserts (filter out duplicates and non-existent products)
      const inserts = [];
      for (const productId of product_ids) {
        // Check if product exists
        const { data: product } = await supabase
          .from('products')
          .select('id')
          .eq('id', productId)
          .single();

        if (!product) continue;

        // Check if already in collection
        const { data: existing } = await supabase
          .from('collection_products')
          .select('id')
          .eq('collection_id', id)
          .eq('product_id', productId)
          .single();

        if (existing) continue;

        maxOrder++;
        inserts.push({
          collection_id: id,
          product_id: productId,
          display_order: maxOrder,
        });
      }

      if (inserts.length === 0) {
        return successResponse({ added: [] }, 201);
      }

      const { data: addedProducts, error } = await supabase
        .from('collection_products')
        .insert(inserts)
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
        );

      if (error) throw error;

      // Transform response
      const added = (addedProducts || []).map((cp: any) => ({
        id: cp.id,
        collection_id: cp.collection_id,
        product_id: cp.product_id,
        display_order: cp.display_order,
        created_at: cp.created_at,
        updated_at: cp.updated_at,
        product: cp.products,
      }));

      return successResponse({ added }, 201);
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}

// PATCH /api/admin/collections/[id]/products - Reorder products in collection
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (USE_STUBS) {
    try {
      const body = await req.json();
      const validated = reorderProductsSchema.safeParse(body);

      if (!validated.success) {
        return NextResponse.json(
          { success: false, error: validated.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { products } = validated.data;

      const collection = stubCollections.find((c) => c.id === id);
      if (!collection) {
        return NextResponse.json(
          { success: false, error: 'Collection not found' },
          { status: 404 }
        );
      }

      // Update display_order for each product
      for (const { product_id, display_order } of products) {
        const cpIndex = stubCollectionProducts.findIndex(
          (cp) => cp.collection_id === id && cp.product_id === product_id
        );
        if (cpIndex !== -1) {
          stubCollectionProducts[cpIndex] = {
            ...stubCollectionProducts[cpIndex],
            display_order,
            updated_at: new Date().toISOString(),
          };
        }
      }

      // Return updated products
      const updatedProducts = stubCollectionProducts
        .filter((cp) => cp.collection_id === id)
        .sort((a, b) => a.display_order - b.display_order)
        .map((cp) => {
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

      return successResponse({ products: updatedProducts });
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
      const validated = reorderProductsSchema.safeParse(body);

      if (!validated.success) {
        return NextResponse.json(
          { success: false, error: validated.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { products } = validated.data;

      // Verify collection exists
      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .select('id')
        .eq('id', id)
        .single();

      if (collectionError || !collection) {
        return NextResponse.json(
          { success: false, error: 'Collection not found' },
          { status: 404 }
        );
      }

      // Update display_order for each product
      for (const { product_id, display_order } of products) {
        await supabase
          .from('collection_products')
          .update({ display_order, updated_at: new Date().toISOString() })
          .eq('collection_id', id)
          .eq('product_id', product_id);
      }

      // Return updated products
      const { data: updatedProducts, error } = await supabase
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

      if (error) throw error;

      // Transform response
      const transformed = (updatedProducts || []).map((cp: any) => ({
        id: cp.id,
        collection_id: cp.collection_id,
        product_id: cp.product_id,
        display_order: cp.display_order,
        created_at: cp.created_at,
        updated_at: cp.updated_at,
        product: cp.products,
      }));

      return successResponse({ products: transformed });
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}

// DELETE /api/admin/collections/[id]/products - Remove product from collection
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const productId = url.searchParams.get('product_id');

  if (!productId) {
    return NextResponse.json(
      { success: false, error: 'product_id is required' },
      { status: 400 }
    );
  }

  if (USE_STUBS) {
    const collection = stubCollections.find((c) => c.id === id);
    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    const cpIndex = stubCollectionProducts.findIndex(
      (cp) => cp.collection_id === id && cp.product_id === productId
    );

    if (cpIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found in collection' },
        { status: 404 }
      );
    }

    stubCollectionProducts.splice(cpIndex, 1);

    return successResponse({ message: 'Product removed from collection' });
  }

  return withAdmin(req, async (req, session) => {
    try {
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient<Database>({
        cookies: () => cookieStore as any,
      });

      // Verify collection exists
      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .select('id')
        .eq('id', id)
        .single();

      if (collectionError || !collection) {
        return NextResponse.json(
          { success: false, error: 'Collection not found' },
          { status: 404 }
        );
      }

      const { error } = await supabase
        .from('collection_products')
        .delete()
        .eq('collection_id', id)
        .eq('product_id', productId);

      if (error) throw error;

      return successResponse({ message: 'Product removed from collection' });
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}
