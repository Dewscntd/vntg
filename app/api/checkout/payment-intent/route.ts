import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { getServerStripe } from '@/lib/stripe/server';
import { createPaymentIntentSchema } from '@/lib/validations/checkout';
import { withAuth, withValidation, withPaymentSecurity } from '@/lib/api/middleware';
import { 
  successResponse, 
  errorResponse,
  handleDatabaseError 
} from '@/lib/api/index';

// POST /api/checkout/payment-intent - Create a payment intent
export async function POST(req: NextRequest) {
  return withPaymentSecurity(req, (req, session) =>
    withValidation(req, createPaymentIntentSchema, async (req, validData) => {
      try {
        const stripe = getServerStripe();
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const userId = session.user.id;
        const { amount, currency = 'usd', orderId, metadata = {} } = validData;

        // Validate minimum amount (50 cents for USD)
        if (amount < 50) {
          return errorResponse('Amount must be at least $0.50', 400);
        }

        // Get user's cart to validate the amount
        const { data: cartItems, error: cartError } = await supabase
          .from('cart_items')
          .select(`
            quantity,
            products (
              id,
              name,
              price,
              inventory_count
            )
          `)
          .eq('user_id', userId);

        if (cartError) {
          throw cartError;
        }

        // Calculate expected total from cart
        const cartTotal = cartItems?.reduce((sum, item) => {
          const price = item.products?.price || 0;
          return sum + (price * item.quantity);
        }, 0) || 0;

        // Add shipping and tax (simplified calculation)
        const shipping = 0; // Free shipping for now
        const tax = cartTotal * 0.08; // 8% tax
        const expectedTotal = Math.round((cartTotal + shipping + tax) * 100);

        // Validate amount matches expected total (with small tolerance for rounding)
        if (Math.abs(amount - expectedTotal) > 5) {
          return errorResponse('Invalid amount', 400);
        }

        // Check inventory for all items
        for (const item of cartItems || []) {
          if (!item.products) continue;
          
          if (item.products.inventory_count < item.quantity) {
            return errorResponse(
              `Insufficient inventory for ${item.products.name}`, 
              400
            );
          }
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency,
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            userId,
            orderId: orderId || '',
            cartItemCount: cartItems?.length.toString() || '0',
            ...metadata,
          },
          description: `Order for ${cartItems?.length || 0} items`,
        });

        // Store payment intent reference in database
        const { error: dbError } = await supabase
          .from('payment_intents')
          .insert({
            id: paymentIntent.id,
            user_id: userId,
            amount,
            currency,
            status: paymentIntent.status,
            client_secret: paymentIntent.client_secret,
            metadata: paymentIntent.metadata,
          });

        if (dbError) {
          console.error('Error storing payment intent:', dbError);
          // Don't fail the request if we can't store in DB
        }

        return successResponse({
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        });

      } catch (error: any) {
        console.error('Payment intent creation error:', error);
        
        if (error.type === 'StripeCardError') {
          return errorResponse(error.message, 400);
        }
        
        if (error.type === 'StripeInvalidRequestError') {
          return errorResponse('Invalid payment request', 400);
        }
        
        return handleDatabaseError(error);
      }
    })
  );
}

// GET /api/checkout/payment-intent/[id] - Retrieve payment intent
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(req, async (req, session) => {
    try {
      const stripe = getServerStripe();
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const userId = session.user.id;
      const paymentIntentId = params.id;

      // Verify the payment intent belongs to the user
      const { data: dbPaymentIntent, error: dbError } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('id', paymentIntentId)
        .eq('user_id', userId)
        .single();

      if (dbError || !dbPaymentIntent) {
        return errorResponse('Payment intent not found', 404);
      }

      // Get latest status from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Update status in database if changed
      if (paymentIntent.status !== dbPaymentIntent.status) {
        await supabase
          .from('payment_intents')
          .update({ status: paymentIntent.status })
          .eq('id', paymentIntentId);
      }

      return successResponse({
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        clientSecret: paymentIntent.client_secret,
        metadata: paymentIntent.metadata,
      });

    } catch (error: any) {
      console.error('Payment intent retrieval error:', error);
      return handleDatabaseError(error);
    }
  });
}
