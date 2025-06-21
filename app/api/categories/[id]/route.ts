import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { updateCategorySchema } from '@/lib/validations/category';
import { withValidation, withAdmin } from '@/lib/api/middleware';
import { 
  successResponse, 
  handleServerError, 
  handleDatabaseError, 
  handleNotFound 
} from '@/lib/api/index';

// GET /api/categories/[id] - Get a single category by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { id } = params;

    // Get the category with its parent
    const { data: category, error } = await supabase
      .from('categories')
      .select('*, parent:parent_id(id, name)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return handleNotFound(`Category with ID ${id} not found`);
      }
      throw error;
    }

    // Get subcategories
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('parent_id', id);

    if (subcategoriesError) {
      throw subcategoriesError;
    }

    // Get products in this category
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, image_url')
      .eq('category_id', id)
      .limit(10);

    if (productsError) {
      throw productsError;
    }

    return successResponse({
      ...category,
      subcategories: subcategories || [],
      products: products || [],
    });
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

// PUT /api/categories/[id] - Update a category (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(req, (req, session) => 
    withValidation(req, updateCategorySchema, async (req, validData) => {
      try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { id } = params;

        // Check if category exists
        const { data: existingCategory, error: checkError } = await supabase
          .from('categories')
          .select('id')
          .eq('id', id)
          .single();

        if (checkError) {
          if (checkError.code === 'PGRST116') {
            return handleNotFound(`Category with ID ${id} not found`);
          }
          throw checkError;
        }

        // Prevent circular references in parent_id
        if (validData.parent_id === id) {
          return handleDatabaseError(new Error('A category cannot be its own parent'));
        }

        // Update the category
        const { data: category, error } = await supabase
          .from('categories')
          .update({
            ...validData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return successResponse(category);
      } catch (error) {
        return handleDatabaseError(error as Error);
      }
    })
  );
}

// DELETE /api/categories/[id] - Delete a category (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const { id } = params;

      // Check if category exists
      const { data: existingCategory, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          return handleNotFound(`Category with ID ${id} not found`);
        }
        throw checkError;
      }

      // Check if category has subcategories
      const { data: subcategories, error: subcategoriesError } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', id);

      if (subcategoriesError) {
        throw subcategoriesError;
      }

      if (subcategories && subcategories.length > 0) {
        return handleDatabaseError(
          new Error('Cannot delete category with subcategories. Remove subcategories first.')
        );
      }

      // Check if category has products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id);

      if (productsError) {
        throw productsError;
      }

      if (products && products.length > 0) {
        return handleDatabaseError(
          new Error('Cannot delete category with products. Remove products first or reassign them to another category.')
        );
      }

      // Delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return successResponse({ message: `Category with ID ${id} deleted successfully` });
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}
