import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { productQuerySchema } from '@/lib/validations/product';
import { createProductSchema } from '@/lib/validations/product';
import { withQueryValidation, withValidation, withAdmin } from '@/lib/api/middleware';
import { successResponse, handleServerError, handleDatabaseError } from '@/lib/api/index';

// GET /api/products - Get all products with filtering and pagination
export async function GET(req: NextRequest) {
  return withQueryValidation(req, productQuerySchema, async (req, query) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const { 
        limit, 
        offset, 
        orderBy, 
        orderDirection, 
        category_id, 
        is_featured,
        search,
        min_price,
        max_price
      } = query;

      // Start building the query
      let dbQuery = supabase
        .from('products')
        .select('*, categories(id, name)', { count: 'exact' });

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
      dbQuery = dbQuery.order(orderBy, { ascending: orderDirection === 'asc' });

      // Apply pagination
      dbQuery = dbQuery.range(offset, offset + limit - 1);

      // Execute the query
      const { data: products, count, error } = await dbQuery;

      if (error) {
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
        const supabase = createRouteHandlerClient<Database>({ cookies });
        
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
