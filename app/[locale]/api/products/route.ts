import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { productQuerySchema } from '@/lib/validations/product';
import { createProductSchema } from '@/lib/validations/product';
import { withQueryValidation, withValidation, withAdmin } from '@/lib/api/middleware';
import { successResponse, handleServerError, handleDatabaseError } from '@/lib/api/index';
import { USE_STUBS, mockProducts } from '@/lib/stubs';

// GET /api/products - Get all products with filtering and pagination
export async function GET(req: NextRequest) {
  // Handle stub mode
  if (USE_STUBS) {
    try {
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const search = url.searchParams.get('search');
      const category_id = url.searchParams.get('category_id');
      const is_featured = url.searchParams.get('is_featured');
      const min_price = url.searchParams.get('min_price');
      const max_price = url.searchParams.get('max_price');

      let products = [...mockProducts];

      // Apply filters
      if (category_id) {
        products = products.filter((p) => p.category_id === category_id);
      }

      if (is_featured !== null) {
        const featuredValue = is_featured === 'true';
        products = products.filter((p) => p.is_featured === featuredValue);
      }

      if (min_price) {
        const minPrice = parseFloat(min_price);
        products = products.filter((p) => p.price >= minPrice);
      }

      if (max_price) {
        const maxPrice = parseFloat(max_price);
        products = products.filter((p) => p.price <= maxPrice);
      }

      if (search) {
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Apply pagination
      const paginatedProducts = products.slice(offset, offset + limit);

      return successResponse({
        products: paginatedProducts,
        pagination: {
          total: products.length,
          limit,
          offset,
        },
      });
    } catch (error) {
      return handleServerError(error as Error);
    }
  }

  return withQueryValidation(req, productQuerySchema, async (req, query) => {
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
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
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

        // Insert the new product
        const { data: product, error } = await supabase
          .from('products')
          .insert({
            ...validData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
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
