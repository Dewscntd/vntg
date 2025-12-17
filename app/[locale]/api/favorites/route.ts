import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { withAuth } from '@/lib/api/middleware';
import { successResponse, handleDatabaseError, errorResponse } from '@/lib/api/index';

// GET /api/favorites - Get the current user's favorites
export async function GET(req: NextRequest) {
  return withAuth(req, async (req, session) => {
    try {
      const supabase = createServerClient();
      const userId = session.user.id;

      // Get favorite items with product details
      const { data: favoriteItems, error } = await supabase
        .from('favorites')
        .select(
          `
          id,
          product_id,
          created_at,
          products (
            id,
            name,
            price,
            image_url,
            inventory_count,
            discount_percent
          )
        `
        )
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Transform items to use 'product' (singular) instead of 'products' (Supabase join format)
      const transformedItems = (favoriteItems || []).map((item: any) => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products;
        return {
          id: item.id,
          product_id: item.product_id,
          created_at: item.created_at,
          product: product || null,
        };
      });

      return successResponse({
        items: transformedItems,
        count: transformedItems.length,
      });
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}

// POST /api/favorites - Add a product to favorites
export async function POST(req: NextRequest) {
  return withAuth(req, async (req, session) => {
    try {
      const supabase = createServerClient();
      const userId = session.user.id;
      const body = await req.json();
      const { product_id } = body;

      if (!product_id) {
        return errorResponse('Product ID is required', 400);
      }

      // Check if already favorited
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', product_id)
        .single();

      if (existing) {
        return errorResponse('Product already in favorites', 400, 'ALREADY_FAVORITED');
      }

      // Add to favorites
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          product_id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return successResponse(data);
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}

// DELETE /api/favorites - Remove a product from favorites
export async function DELETE(req: NextRequest) {
  return withAuth(req, async (req, session) => {
    try {
      const supabase = createServerClient();
      const userId = session.user.id;
      const body = await req.json();
      const { product_id } = body;

      if (!product_id) {
        return errorResponse('Product ID is required', 400);
      }

      // Remove from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', product_id);

      if (error) {
        throw error;
      }

      return successResponse({ message: 'Removed from favorites' });
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}
