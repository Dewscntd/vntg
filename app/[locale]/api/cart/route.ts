import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { withAuth } from '@/lib/api/middleware';
import { successResponse, handleDatabaseError } from '@/lib/api/index';

// GET /api/cart - Get the current user's cart
export async function GET(req: NextRequest) {
  return withAuth(req, async (req, session) => {
    try {
      const supabase = createServerClient();
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

      // Transform items to use 'product' (singular) instead of 'products' (Supabase join format)
      const transformedItems = (cartItems || []).map((item: any) => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products;
        return {
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          product: product || null,
        };
      });

      // Calculate total
      const total = transformedItems.reduce((sum: number, item: any) => {
        const price = item.product?.price || 0;
        const discount = item.product?.discount_percent || 0;
        const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;
        return sum + discountedPrice * item.quantity;
      }, 0);

      return successResponse({
        items: transformedItems,
        total,
        itemCount: transformedItems.length,
      });
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}
