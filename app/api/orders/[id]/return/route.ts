import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { withAuth } from '@/lib/api/middleware';
import { 
  successResponse, 
  errorResponse,
  handleDatabaseError,
  handleNotFound 
} from '@/lib/api/index';

// POST /api/orders/[id]/return - Request order return
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const userId = session.user.id;
      const orderId = params.id;
      
      const body = await req.json();
      const { reason } = body;

      if (!reason || reason.trim().length === 0) {
        return errorResponse('Return reason is required', 400);
      }

      // Verify the order belongs to the user and can be returned
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('id, status, created_at')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !order) {
        return handleNotFound('Order not found');
      }

      // Check if order can be returned (only delivered orders within return window)
      if (order.status !== 'delivered') {
        return errorResponse(
          'Only delivered orders can be returned.',
          400
        );
      }

      // Check return window (30 days)
      const orderDate = new Date(order.created_at);
      const returnDeadline = new Date(orderDate.getTime() + (30 * 24 * 60 * 60 * 1000));
      const now = new Date();

      if (now > returnDeadline) {
        return errorResponse(
          'Return window has expired. Returns must be requested within 30 days of delivery.',
          400
        );
      }

      // Check if return request already exists
      const { data: existingReturn, error: returnCheckError } = await supabase
        .from('return_requests')
        .select('id, status')
        .eq('order_id', orderId)
        .single();

      if (returnCheckError && returnCheckError.code !== 'PGRST116') {
        throw returnCheckError;
      }

      if (existingReturn) {
        return errorResponse(
          `A return request already exists for this order with status: ${existingReturn.status}`,
          400
        );
      }

      // Create return request
      const { data: returnRequest, error: createError } = await supabase
        .from('return_requests')
        .insert({
          order_id: orderId,
          user_id: userId,
          reason: reason.trim(),
          status: 'pending',
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Send return request email to admin
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/return-request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            returnRequestId: returnRequest.id,
            reason,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send return request email:', emailError);
        // Don't fail the return request if email fails
      }

      return successResponse({
        message: 'Return request submitted successfully',
        returnRequestId: returnRequest.id,
        status: returnRequest.status,
      });

    } catch (error) {
      console.error('Error creating return request:', error);
      return handleDatabaseError(error);
    }
  });
}
