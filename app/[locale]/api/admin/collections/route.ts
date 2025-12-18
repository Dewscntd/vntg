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
  getCollectionsWithProducts,
} from '@/lib/stubs/comprehensive-mock-data';

// In-memory store for stub mode mutations
let stubCollections = [...MOCK_COLLECTIONS];
let stubCollectionProducts = [...MOCK_COLLECTION_PRODUCTS];

// GET /api/admin/collections - List all collections
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');
  const limit = parseInt(url.searchParams.get('limit') || '25');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  if (USE_STUBS) {
    let collections = getCollectionsWithProducts();

    // Apply filters
    if (status && status !== 'all') {
      collections = collections.filter((c) => c.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      collections = collections.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.slug.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by display_order
    collections.sort((a, b) => a.display_order - b.display_order);

    const total = collections.length;
    const paginatedCollections = collections.slice(offset, offset + limit);

    return successResponse({
      collections: paginatedCollections,
      total,
      limit,
      offset,
      hasMore: total > offset + limit,
    });
  }

  return withAdmin(req, async (req, session) => {
    try {
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient<Database>({
        cookies: () => cookieStore as any,
      });

      // Build query
      let query = supabase
        .from('collections')
        .select('*', { count: 'exact' })
        .order('display_order', { ascending: true })
        .range(offset, offset + limit - 1);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
      }

      const { data: collections, error, count } = await query;

      if (error) throw error;

      // Fetch product counts for each collection
      const collectionsWithCounts: CollectionWithProducts[] = await Promise.all(
        (collections || []).map(async (collection) => {
          const { count: productCount } = await supabase
            .from('collection_products')
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', collection.id);

          return {
            ...collection,
            products: [],
            product_count: productCount || 0,
          };
        })
      );

      return successResponse({
        collections: collectionsWithCounts,
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      });
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}

// POST /api/admin/collections - Create a new collection
export async function POST(req: NextRequest) {
  if (USE_STUBS) {
    try {
      const body = await req.json();
      const validated = collectionFormSchema.safeParse(body);

      if (!validated.success) {
        return NextResponse.json(
          { success: false, error: validated.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { name, description, image_url, status, display_order, metadata } = validated.data;
      const slug = validated.data.slug || generateSlug(name);

      // Check for duplicate slug
      if (stubCollections.some((c) => c.slug === slug)) {
        return NextResponse.json(
          { success: false, error: 'A collection with this slug already exists' },
          { status: 400 }
        );
      }

      const newCollection = {
        id: `70000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, '0')}`,
        name,
        slug,
        description: description || null,
        image_url: image_url || null,
        status: status || 'draft',
        display_order: display_order ?? stubCollections.length,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      stubCollections.push(newCollection as any);

      return successResponse(
        {
          ...newCollection,
          products: [],
          product_count: 0,
        },
        201
      );
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }
  }

  return withAdmin(req, async (req, session) => {
    try {
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient<Database>({
        cookies: () => cookieStore as any,
      });

      const body = await req.json();
      const validated = collectionFormSchema.safeParse(body);

      if (!validated.success) {
        return NextResponse.json(
          { success: false, error: validated.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { name, description, image_url, status, display_order, metadata } = validated.data;
      const slug = validated.data.slug || generateSlug(name);

      // Check for duplicate slug
      const { data: existing } = await supabase
        .from('collections')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'A collection with this slug already exists' },
          { status: 400 }
        );
      }

      // Get next display_order if not provided
      let finalDisplayOrder = display_order;
      if (finalDisplayOrder === undefined) {
        const { data: lastCollection } = await supabase
          .from('collections')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1)
          .single();

        finalDisplayOrder = (lastCollection?.display_order ?? 0) + 1;
      }

      const { data: collection, error } = await supabase
        .from('collections')
        .insert({
          name,
          slug,
          description,
          image_url,
          status: status || 'draft',
          display_order: finalDisplayOrder,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) throw error;

      return successResponse(
        {
          ...collection,
          products: [],
          product_count: 0,
        },
        201
      );
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}
