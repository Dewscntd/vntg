import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { withAuth } from '@/lib/api/middleware';
import { successResponse, handleDatabaseError, handleNotFound } from '@/lib/api/index';

// GET /api/orders - Get user's orders with optional filtering
export async function GET(req: NextRequest) {
  return withAuth(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const userId = session.user.id;
      const { searchParams } = new URL(req.url);

      // Get query parameters
      const paymentIntentId = searchParams.get('payment_intent_id');
      const status = searchParams.get('status');
      const limit = parseInt(searchParams.get('limit') || '10');
      const offset = parseInt(searchParams.get('offset') || '0');

      let query = supabase
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
              image_url
            )
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (paymentIntentId) {
        query = query.eq('payment_intent_id', paymentIntentId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: orders, error } = await query;

      if (error) {
        throw error;
      }

      // Get total count for pagination
      let countQuery = supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (paymentIntentId) {
        countQuery = countQuery.eq('payment_intent_id', paymentIntentId);
      }

      if (status) {
        countQuery = countQuery.eq('status', status);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error('Error getting order count:', countError);
      }

      return successResponse({
        orders: orders || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit,
        },
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return handleDatabaseError(error as Error);
    }
  });
}
