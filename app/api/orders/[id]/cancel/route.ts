import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { withAuth } from '@/lib/api/middleware';
import {
  successResponse,
  errorResponse,
  handleDatabaseError,
  handleNotFound,
} from '@/lib/api/index';

// POST /api/orders/[id]/cancel - Cancel an order
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const userId = session.user.id;
      const orderId = params.id;

      const body = await req.json().catch(() => ({}));
      const { reason } = body;

      // Verify the order belongs to the user and can be cancelled
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select(
          `
          id,
          status,
          payment_intent_id,
          order_items (
            product_id,
            quantity
          )
        `
        )
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !order) {
        return handleNotFound('Order not found');
      }

      // Check if order can be cancelled
      if (!['pending', 'processing'].includes(order.status)) {
        return errorResponse(
          'Order cannot be cancelled. Only pending and processing orders can be cancelled.',
          400
        );
      }

      // Start transaction to cancel order and restore inventory
      const { error: updateError } = await supabase.rpc('cancel_order_with_inventory_restore', {
        p_order_id: orderId,
        p_user_id: userId,
        p_reason: reason || null,
      });

      if (updateError) {
        throw updateError;
      }

      // TODO: Cancel payment intent if exists
      if (order.payment_intent_id) {
        try {
          // This would require Stripe server-side integration
          // For now, we'll handle this in the webhook
          console.log('Payment intent cancellation needed:', order.payment_intent_id);
        } catch (paymentError) {
          console.error('Error cancelling payment:', paymentError);
          // Don't fail the order cancellation if payment cancellation fails
        }
      }

      // Send cancellation email
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/order-cancelled`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            reason,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
        // Don't fail the cancellation if email fails
      }

      return successResponse({
        message: 'Order cancelled successfully',
        orderId,
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      return handleDatabaseError(error as Error);
    }
  });
}
