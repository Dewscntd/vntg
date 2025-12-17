import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { addToCartSchema } from '@/lib/validations/cart';
import { withAuth, withValidation } from '@/lib/api/middleware';
import {
  successResponse,
  handleDatabaseError,
  errorResponse,
  handleNotFound,
} from '@/lib/api/index';

// POST /api/cart/add - Add an item to the cart
export async function POST(req: NextRequest) {
  return withAuth(req, (req, session) =>
    withValidation(req, addToCartSchema, async (req, validData) => {
      try {
        const supabase = createServerClient();
        const userId = session.user.id;
        const { product_id, quantity } = validData;

        // Ensure quantity is defined (should be guaranteed by validation)
        if (quantity === undefined) {
          return errorResponse('Quantity is required', 400);
        }

        // Check if product exists and has sufficient inventory
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, inventory_count')
          .eq('id', product_id)
          .single();

        if (productError) {
          if (productError.code === 'PGRST116') {
            return handleNotFound(`Product with ID ${product_id} not found`);
          }
          throw productError;
        }

        if (product.inventory_count < quantity) {
          return errorResponse(
            `Not enough inventory. Only ${product.inventory_count} items available.`,
            400,
            'INSUFFICIENT_INVENTORY'
          );
        }

        // Check if the item is already in the cart
        const { data: existingItem, error: existingItemError } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', userId)
          .eq('product_id', product_id)
          .single();

        if (existingItemError && existingItemError.code !== 'PGRST116') {
          throw existingItemError;
        }

        let result;

        if (existingItem) {
          // Update existing cart item
          const newQuantity = existingItem.quantity + quantity;

          // Check if new quantity exceeds inventory
          if (newQuantity > product.inventory_count) {
            return errorResponse(
              `Cannot add ${quantity} more items. Only ${product.inventory_count - existingItem.quantity} more available.`,
              400,
              'INSUFFICIENT_INVENTORY'
            );
          }

          const { data, error } = await supabase
            .from('cart_items')
            .update({
              quantity: newQuantity,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingItem.id)
            .select()
            .single();

          if (error) {
            throw error;
          }

          result = data;
        } else {
          // Add new cart item
          const { data, error } = await supabase
            .from('cart_items')
            .insert({
              user_id: userId,
              product_id,
              quantity,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) {
            throw error;
          }

          result = data;
        }

        return successResponse(result, 201);
      } catch (error) {
        return handleDatabaseError(error as Error);
      }
    })
  );
}
