import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { removeFromCartSchema } from '@/lib/validations/cart';
import { withAuth, withValidation } from '@/lib/api/middleware';
import { successResponse, handleDatabaseError, handleNotFound } from '@/lib/api/index';

// DELETE /api/cart/remove - Remove an item from the cart
export async function DELETE(req: NextRequest) {
  return withAuth(req, (req, session) =>
    withValidation(req, removeFromCartSchema, async (req, validData) => {
      try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const userId = session.user.id;
        const { id } = validData;

        // Check if cart item exists and belongs to the user
        const { data: cartItem, error: cartItemError } = await supabase
          .from('cart_items')
          .select('id')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (cartItemError) {
          if (cartItemError.code === 'PGRST116') {
            return handleNotFound(`Cart item with ID ${id} not found or does not belong to you`);
          }
          throw cartItemError;
        }

        // Delete the cart item
        const { error } = await supabase.from('cart_items').delete().eq('id', id);

        if (error) {
          throw error;
        }

        return successResponse({
          message: `Item removed from cart successfully`,
          id,
        });
      } catch (error) {
        return handleDatabaseError(error as Error);
      }
    })
  );
}
