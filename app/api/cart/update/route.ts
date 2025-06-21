import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { updateCartItemSchema } from '@/lib/validations/cart';
import { withAuth, withValidation } from '@/lib/api/middleware';
import { 
  successResponse, 
  handleDatabaseError, 
  errorResponse,
  handleNotFound 
} from '@/lib/api/index';

// PUT /api/cart/update - Update cart item quantity
export async function PUT(req: NextRequest) {
  return withAuth(req, (req, session) => 
    withValidation(req, updateCartItemSchema, async (req, validData) => {
      try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const userId = session.user.id;
        const { id, quantity } = validData;

        // Check if cart item exists and belongs to the user
        const { data: cartItem, error: cartItemError } = await supabase
          .from('cart_items')
          .select('id, product_id')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (cartItemError) {
          if (cartItemError.code === 'PGRST116') {
            return handleNotFound(`Cart item with ID ${id} not found or does not belong to you`);
          }
          throw cartItemError;
        }

        // Check if product has sufficient inventory
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, inventory_count')
          .eq('id', cartItem.product_id)
          .single();

        if (productError) {
          throw productError;
        }

        if (product.inventory_count < quantity) {
          return errorResponse(
            `Not enough inventory. Only ${product.inventory_count} items available.`,
            400,
            'INSUFFICIENT_INVENTORY'
          );
        }

        // Update cart item quantity
        const { data, error } = await supabase
          .from('cart_items')
          .update({
            quantity,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return successResponse(data);
      } catch (error) {
        return handleDatabaseError(error as Error);
      }
    })
  );
}
