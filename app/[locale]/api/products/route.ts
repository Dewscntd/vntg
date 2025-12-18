import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { productQuerySchema } from '@/lib/validations/product';
import { createProductSchema } from '@/lib/validations/product';
import { withQueryValidation, withValidation, withAdmin } from '@/lib/api/middleware';
import { successResponse, handleServerError, handleDatabaseError } from '@/lib/api/index';
import { USE_STUBS, mockFashionProducts, mockSeasonalConfig } from '@/lib/stubs';
import { FashionProduct } from '@/types/shop';

// GET /api/products - Get all products with filtering and pagination
export async function GET(req: NextRequest) {
  // Handle stub mode
  if (USE_STUBS) {
    try {
      const url = new URL(req.url);

      // Support both offset-based and page-based pagination
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const offset = url.searchParams.get('offset')
        ? parseInt(url.searchParams.get('offset') || '0')
        : (page - 1) * limit;

      const search = url.searchParams.get('search');
      const category_id = url.searchParams.get('category_id');
      const is_featured = url.searchParams.get('is_featured');
      const min_price = url.searchParams.get('min_price');
      const max_price = url.searchParams.get('max_price');
      const sort = url.searchParams.get('sort') || 'newest';

      // NEW: Fashion-specific filters
      const gender = url.searchParams.get('gender');
      const clothing_type = url.searchParams.get('clothing_type');
      const in_stock = url.searchParams.get('inStock');
      const is_new = url.searchParams.get('new');
      const is_sale = url.searchParams.get('sale');

      let products: FashionProduct[] = [...mockFashionProducts];

      // Filter by active season (from config)
      // Only show products from the current active season
      products = products.filter(
        (p) =>
          (p.season === mockSeasonalConfig.active_season || p.season === 'all-season') &&
          p.collection_year === mockSeasonalConfig.active_year
      );

      // Apply gender filter (CRITICAL for shop page)
      if (gender) {
        products = products.filter((p) => p.gender === gender);
      }

      // Apply clothing type filter
      if (clothing_type) {
        products = products.filter((p) => p.clothing_type === clothing_type);
      }

      // Apply category filter
      if (category_id) {
        products = products.filter((p) => p.category_id === category_id);
      }

      // Apply featured filter
      if (is_featured !== null) {
        const featuredValue = is_featured === 'true';
        products = products.filter((p) => p.is_featured === featuredValue);
      }

      // Apply price filters
      if (min_price) {
        const minPrice = parseFloat(min_price);
        products = products.filter((p) => p.price >= minPrice);
      }

      if (max_price) {
        const maxPrice = parseFloat(max_price);
        products = products.filter((p) => p.price <= maxPrice);
      }

      // Apply stock filter
      if (in_stock === 'true') {
        products = products.filter((p) => p.inventory_count > 0);
      }

      // Apply new filter
      if (is_new === 'true') {
        products = products.filter((p) => p.is_new === true);
      }

      // Apply sale filter
      if (is_sale === 'true') {
        products = products.filter((p) => p.is_sale === true);
      }

      // Apply search
      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower) ||
            p.material?.toLowerCase().includes(searchLower) ||
            p.clothing_type.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      switch (sort) {
        case 'price-asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'name-asc':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          products.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'newest':
        default:
          products.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          break;
      }

      // Calculate pagination metadata
      const total = products.length;
      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      // Apply pagination
      const paginatedProducts = products.slice(offset, offset + limit);

      return successResponse({
        products: paginatedProducts,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasMore,
          offset,
        },
        activeCollection: {
          season: mockSeasonalConfig.active_season,
          year: mockSeasonalConfig.active_year,
        },
      });
    } catch (error) {
      return handleServerError(error as Error);
    }
  }

  return withQueryValidation(req, productQuerySchema, async (req, query) => {
    try {
      const cookieStore = await cookies();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore as any });
      const {
        limit,
        offset,
        orderBy,
        orderDirection,
        category_id,
        is_featured,
        search,
        min_price,
        max_price,
      } = query;

      // Start building the query - simplified to avoid join issues
      let dbQuery = supabase.from('products').select('*', { count: 'exact' });

      // Apply filters
      if (category_id) {
        dbQuery = dbQuery.eq('category_id', category_id);
      }

      if (is_featured !== undefined) {
        dbQuery = dbQuery.eq('is_featured', is_featured);
      }

      if (min_price !== undefined) {
        dbQuery = dbQuery.gte('price', min_price);
      }

      if (max_price !== undefined) {
        dbQuery = dbQuery.lte('price', max_price);
      }

      if (search) {
        dbQuery = dbQuery.ilike('name', `%${search}%`);
      }

      // Apply ordering
      dbQuery = dbQuery.order(orderBy || 'created_at', { ascending: orderDirection === 'asc' });

      // Apply pagination
      dbQuery = dbQuery.range(offset || 0, (offset || 0) + (limit || 10) - 1);

      // Execute the query
      const { data: products, count, error } = await dbQuery;

      if (error) {
        console.error('Supabase query error:', error);
        console.error('Query details:', {
          category_id,
          is_featured,
          min_price,
          max_price,
          search,
          orderBy,
          orderDirection,
          limit,
          offset,
        });
        throw error;
      }

      return successResponse({
        products,
        pagination: {
          total: count || 0,
          limit,
          offset,
        },
      });
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}

// POST /api/products - Create a new product (admin only)
export async function POST(req: NextRequest) {
  return withAdmin(req, (req, session) =>
    withValidation(req, createProductSchema, async (req, validData) => {
      try {
        const cookieStore = await cookies();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore as any });

        // Insert the new product
        const { data: product, error } = await supabase
          .from('products')
          .insert({
            ...validData,
          } as any)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return successResponse(product, 201);
      } catch (error) {
        return handleDatabaseError(error as Error);
      }
    })
  );
}
