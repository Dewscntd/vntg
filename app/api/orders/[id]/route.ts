import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { withAuth } from '@/lib/api/middleware';
import { successResponse, handleDatabaseError, handleNotFound } from '@/lib/api/index';

// GET /api/orders/[id] - Get a specific order
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const userId = session.user.id;
      const orderId = params.id;

      const { data: order, error } = await supabase
        .from('orders')
        .select(
          `
          id,
          order_number,
          status,
          total,
          shipping_address,
          payment_intent_id,
          estimated_delivery,
          notes,
          created_at,
          updated_at,
          order_items (
            id,
            quantity,
            price,
            products (
              id,
              name,
              description,
              image_url,
              category_id,
              categories (
                id,
                name
              )
            )
          )
        `
        )
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return handleNotFound('Order not found');
        }
        throw error;
      }

      // Calculate order summary
      const subtotal =
        order.order_items?.reduce((sum, item) => {
          return sum + item.price * item.quantity;
        }, 0) || 0;

      const shipping = 0; // Calculate based on shipping method
      const tax = subtotal * 0.08; // 8% tax
      const total = order.total;

      const orderWithSummary = {
        ...order,
        summary: {
          subtotal,
          shipping,
          tax,
          total,
        },
        itemCount: order.order_items?.length || 0,
      };

      return successResponse(orderWithSummary);
    } catch (error) {
      console.error('Error fetching order:', error);
      return handleDatabaseError(error as Error);
    }
  });
}

// PUT /api/orders/[id] - Update order (limited fields for customers)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const userId = session.user.id;
      const orderId = params.id;
      const body = await req.json();

      // Only allow certain fields to be updated by customers
      const allowedFields = ['notes'];
      const updateData: any = {};

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return successResponse({ message: 'No valid fields to update' });
      }

      // Verify order belongs to user
      const { data: existingOrder, error: fetchError } = await supabase
        .from('orders')
        .select('id, status')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return handleNotFound('Order not found');
        }
        throw fetchError;
      }

      // Only allow updates to orders that are not completed or cancelled
      if (existingOrder.status === 'completed' || existingOrder.status === 'cancelled') {
        return successResponse(
          {
            message: 'Cannot update completed or cancelled orders',
          },
          400
        );
      }

      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return successResponse(updatedOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      return handleDatabaseError(error as Error);
    }
  });
}
