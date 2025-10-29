import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { updateProductSchema } from '@/lib/validations/product';
import { withValidation, withAdmin } from '@/lib/api/middleware';
import {
  successResponse,
  handleServerError,
  handleDatabaseError,
  handleNotFound,
} from '@/lib/api/index';
import { USE_STUBS, mockProducts, mockCategories } from '@/lib/stubs';

// GET /api/products/[id] - Get a single product by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  // Handle stub mode
  if (USE_STUBS) {
    try {
      // Find the product in mock data
      const product = mockProducts.find((prod) => prod.id === id);

      if (!product) {
        return handleNotFound(`Product with ID ${id} not found`);
      }

      // Find the category for this product
      const category = mockCategories.find((cat) => cat.id === product.category_id);

      return successResponse({
        ...product,
        categories: category ? { id: category.id, name: category.name } : null,
      });
    } catch (error) {
      return handleServerError(error as Error);
    }
  }

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get the product with its category
    const { data: product, error } = await supabase
      .from('products')
      .select('*, categories(id, name)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return handleNotFound(`Product with ID ${id} not found`);
      }
      throw error;
    }

    return successResponse(product);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

// PUT /api/products/[id] - Update a product (admin only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withAdmin(req, (req, session) =>
    withValidation(req, updateProductSchema, async (req, validData) => {
      try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { id } = params;

        // Check if product exists
        const { data: existingProduct, error: checkError } = await supabase
          .from('products')
          .select('id')
          .eq('id', id)
          .single();

        if (checkError) {
          if (checkError.code === 'PGRST116') {
            return handleNotFound(`Product with ID ${id} not found`);
          }
          throw checkError;
        }

        // Update the product
        const { data: product, error } = await supabase
          .from('products')
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

        return successResponse(product);
      } catch (error) {
        return handleDatabaseError(error as Error);
      }
    })
  );
}

// DELETE /api/products/[id] - Delete a product (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return withAdmin(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const { id } = params;

      // Check if product exists
      const { data: existingProduct, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          return handleNotFound(`Product with ID ${id} not found`);
        }
        throw checkError;
      }

      // Delete the product
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) {
        throw error;
      }

      return successResponse({ message: `Product with ID ${id} deleted successfully` });
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}
