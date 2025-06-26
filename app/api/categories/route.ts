import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { categoryQuerySchema, createCategorySchema } from '@/lib/validations/category';
import { withQueryValidation, withValidation, withAdmin } from '@/lib/api/middleware';
import { successResponse, handleServerError, handleDatabaseError } from '@/lib/api/index';

// GET /api/categories - Get all categories with filtering and pagination
export async function GET(req: NextRequest) {
  return withQueryValidation(req, categoryQuerySchema, async (req, query) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const { limit, offset, orderBy, orderDirection, parent_id, search } = query;

      // Start building the query
      let dbQuery = supabase
        .from('categories')
        .select('*, parent:parent_id(id, name)', { count: 'exact' });

      // Apply filters
      if (parent_id !== undefined) {
        dbQuery = dbQuery.eq('parent_id', parent_id);
      }

      if (search) {
        dbQuery = dbQuery.ilike('name', `%${search}%`);
      }

      // Apply ordering
      dbQuery = dbQuery.order(orderBy || 'name', { ascending: orderDirection === 'asc' });

      // Apply pagination
      dbQuery = dbQuery.range(offset || 0, (offset || 0) + (limit || 10) - 1);

      // Execute the query
      const { data: categories, count, error } = await dbQuery;

      if (error) {
        throw error;
      }

      return successResponse({
        categories,
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

// POST /api/categories - Create a new category (admin only)
export async function POST(req: NextRequest) {
  return withAdmin(req, (req, session) =>
    withValidation(req, createCategorySchema, async (req, validData) => {
      try {
        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Insert the new category
        const { data: category, error } = await supabase
          .from('categories')
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

        return successResponse(category, 201);
      } catch (error) {
        return handleDatabaseError(error as Error);
      }
    })
  );
}
