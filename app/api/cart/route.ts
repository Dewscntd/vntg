import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { withAuth } from '@/lib/api/middleware';
import { successResponse, handleDatabaseError } from '@/lib/api/index';

// GET /api/cart - Get the current user's cart
export async function GET(req: NextRequest) {
  return withAuth(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const userId = session.user.id;

      // Get cart items with product details
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(
          `
          id,
          quantity,
          product_id,
          products (
            id,
            name,
            price,
            image_url,
            inventory_count
          )
        `
        )
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Calculate total
      const total =
        cartItems?.reduce((sum, item) => {
          const products = Array.isArray(item.products) ? item.products[0] : item.products;
          const price = products?.price || 0;
          return sum + price * item.quantity;
        }, 0) || 0;

      return successResponse({
        items: cartItems || [],
        total,
        itemCount: cartItems?.length || 0,
      });
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}
