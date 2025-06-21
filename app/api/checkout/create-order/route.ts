import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { getServerStripe } from '@/lib/stripe/server';
import { createOrderSchema } from '@/lib/validations/checkout';
import { withAuth, withValidation, withPaymentSecurity } from '@/lib/api/middleware';
import { 
  successResponse, 
  errorResponse,
  handleDatabaseError 
} from '@/lib/api/index';

// POST /api/checkout/create-order - Create an order after successful payment
export async function POST(req: NextRequest) {
  return withPaymentSecurity(req, (req, session) =>
    withValidation(req, createOrderSchema, async (req, validData) => {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const userId = session.user.id;
      
      try {
        const { 
          shippingAddress, 
          billingAddress, 
          paymentMethodId, 
          shippingMethod,
          notes 
        } = validData;

        // Start a database transaction
        const { data: orderData, error: orderError } = await supabase.rpc(
          'create_order_with_items',
          {
            p_user_id: userId,
            p_shipping_address: shippingAddress,
            p_billing_address: billingAddress || shippingAddress,
            p_payment_method_id: paymentMethodId,
            p_shipping_method: shippingMethod,
            p_notes: notes || null,
          }
        );

        if (orderError) {
          throw orderError;
        }

        if (!orderData || orderData.length === 0) {
          return errorResponse('Failed to create order', 500);
        }

        const order = orderData[0];

        // Send order confirmation email
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/order-confirmation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: order.id,
              userEmail: shippingAddress.email,
            }),
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the order creation if email fails
        }

        return successResponse({
          orderId: order.id,
          orderNumber: order.order_number,
          status: order.status,
          total: order.total,
          estimatedDelivery: order.estimated_delivery,
        });

      } catch (error: any) {
        console.error('Order creation error:', error);
        return handleDatabaseError(error);
      }
    })
  );
}
