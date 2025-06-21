import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { trackingService } from '@/lib/shipping/carriers';
import { withAuth, withValidation } from '@/lib/api/middleware';
import { 
  successResponse, 
  errorResponse,
  handleDatabaseError,
  handleNotFound 
} from '@/lib/api/index';
import { z } from 'zod';

const createShipmentSchema = z.object({
  carrier: z.enum(['ups', 'fedex', 'usps', 'dhl']),
  serviceType: z.string().optional(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  shippingCost: z.number().optional(),
  weight: z.number().optional(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
    unit: z.enum(['in', 'cm']),
  }).optional(),
});

// GET /api/orders/[id]/shipments - Get shipments for an order
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const orderId = params.id;
      const userId = session.user.id;

      // Verify order belongs to user (unless admin)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, user_id')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return handleNotFound('Order not found');
      }

      // Check if user owns the order or is admin
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (order.user_id !== userId && user?.role !== 'admin') {
        return errorResponse('Access denied', 403);
      }

      // Get shipments for the order
      const { data: shipments, error: shipmentsError } = await supabase
        .from('shipments')
        .select(`
          *,
          tracking_events (
            timestamp,
            status,
            description,
            location,
            city,
            state,
            country
          )
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (shipmentsError) {
        throw shipmentsError;
      }

      return successResponse({
        shipments: shipments || [],
      });

    } catch (error) {
      console.error('Error fetching shipments:', error);
      return handleDatabaseError(error);
    }
  });
}

// POST /api/orders/[id]/shipments - Create a new shipment (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(req, (req, session) => 
    withValidation(req, createShipmentSchema, async (req, validData) => {
      try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const orderId = params.id;
        const userId = session.user.id;

        // Check if user is admin
        const { data: user } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();

        if (user?.role !== 'admin') {
          return errorResponse('Admin access required', 403);
        }

        // Verify order exists
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('id, shipping_address, status')
          .eq('id', orderId)
          .single();

        if (orderError || !order) {
          return handleNotFound('Order not found');
        }

        // Generate tracking number if not provided
        const trackingNumber = validData.trackingNumber || 
          trackingService.generateTrackingNumber(validData.carrier);

        // Create shipment
        const { data: shipment, error: shipmentError } = await supabase
          .from('shipments')
          .insert({
            order_id: orderId,
            tracking_number: trackingNumber,
            carrier: validData.carrier,
            service_type: validData.serviceType,
            estimated_delivery: validData.estimatedDelivery,
            shipping_cost: validData.shippingCost,
            weight: validData.weight,
            dimensions: validData.dimensions,
            shipping_address: order.shipping_address,
            status: 'pending',
          })
          .select()
          .single();

        if (shipmentError) {
          throw shipmentError;
        }

        // Create initial tracking event
        await supabase
          .from('tracking_events')
          .insert({
            shipment_id: shipment.id,
            timestamp: new Date().toISOString(),
            status: 'pending',
            description: 'Shipment created',
            location: 'Origin Facility',
          });

        // Update order status to processing if it's still pending
        if (order.status === 'pending') {
          await supabase
            .from('orders')
            .update({ status: 'processing' })
            .eq('id', orderId);
        }

        // Send shipment notification
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/shipment-created`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId,
              shipmentId: shipment.id,
              trackingNumber,
            }),
          });
        } catch (notificationError) {
          console.error('Failed to send shipment notification:', notificationError);
        }

        return successResponse(shipment, 201);

      } catch (error) {
        console.error('Error creating shipment:', error);
        return handleDatabaseError(error);
      }
    })
  );
}
