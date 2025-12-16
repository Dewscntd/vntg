import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { categoryQuerySchema, createCategorySchema } from '@/lib/validations/category';
import { withQueryValidation, withValidation, withAdmin } from '@/lib/api/middleware';
import { successResponse, handleServerError, handleDatabaseError } from '@/lib/api/index';
import { USE_STUBS, mockCategories } from '@/lib/stubs';

// GET /api/categories - Get all categories with filtering and pagination
export async function GET(req: NextRequest) {
  // Handle stub mode
  if (USE_STUBS) {
    try {
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const search = url.searchParams.get('search');

      let categories = [...mockCategories];

      // Apply search filter
      if (search) {
        categories = categories.filter(
          (cat) =>
            cat.name.toLowerCase().includes(search.toLowerCase()) ||
            cat.description?.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Apply pagination
      const paginatedCategories = categories.slice(offset, offset + limit);

      return successResponse({
        categories: paginatedCategories,
        pagination: {
          total: categories.length,
          limit,
          offset,
        },
      });
    } catch (error) {
      return handleServerError(error as Error);
    }
  }

  return withQueryValidation(req, categoryQuerySchema, async (req, query) => {
    try {
      const cookieStore = await cookies();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore as any });
      const { limit, offset, orderBy, orderDirection, parent_id, search } = query;

      // Start building the query
      let dbQuery = supabase
        .from('categories')
        .select('*, parent:parent_id(id, name)', { count: 'exact' });

      // Apply filters
      if (parent_id !== undefined && parent_id !== null) {
        dbQuery = dbQuery.eq('parent_id', parent_id as string);
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
        const cookieStore = await cookies();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore as any });

        // Insert the new category
        const { data: category, error } = await supabase
          .from('categories')
          .insert({
            ...validData,
          } as any)
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
