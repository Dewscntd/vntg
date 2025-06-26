import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { getServerStripe } from '@/lib/stripe/server';
import Stripe from 'stripe';

const stripe = getServerStripe();
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    console.error('Missing Stripe signature');
    return new Response('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object as Stripe.Dispute, supabase);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('Webhook handled successfully', { status: 200 });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response('Webhook handler failed', { status: 500 });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Payment succeeded:', paymentIntent.id);

  try {
    // Update payment intent status in database
    const { error: updateError } = await supabase
      .from('payment_intents')
      .update({
        status: 'succeeded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentIntent.id);

    if (updateError) {
      console.error('Error updating payment intent:', updateError);
    }

    // Update related order status
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('payment_intent_id', paymentIntent.id)
      .select('id, user_id');

    if (orderError) {
      console.error('Error updating order status:', orderError);
      return;
    }

    // Send order confirmation email if not already sent
    if (orders && orders.length > 0) {
      const order = orders[0];

      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/order-confirmation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.id,
            paymentIntentId: paymentIntent.id,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }
    }
  } catch (error) {
    console.error('Error in handlePaymentIntentSucceeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Payment failed:', paymentIntent.id);

  try {
    // Update payment intent status
    const { error: updateError } = await supabase
      .from('payment_intents')
      .update({
        status: 'requires_payment_method',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentIntent.id);

    if (updateError) {
      console.error('Error updating payment intent:', updateError);
    }

    // Update order status to cancelled (since payment failed)
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancellation_reason: 'Payment failed',
        updated_at: new Date().toISOString(),
      })
      .eq('payment_intent_id', paymentIntent.id)
      .select('id');

    if (orderError) {
      console.error('Error updating order status:', orderError);
      return;
    }

    // Restore inventory for failed payment orders
    if (orders && orders.length > 0) {
      for (const order of orders) {
        await restoreOrderInventory(order.id, supabase);
      }
    }

    // TODO: Send payment failure notification email
  } catch (error) {
    console.error('Error in handlePaymentIntentFailed:', error);
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Payment canceled:', paymentIntent.id);

  try {
    // Update payment intent status
    const { error: updateError } = await supabase
      .from('payment_intents')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentIntent.id);

    if (updateError) {
      console.error('Error updating payment intent:', updateError);
    }

    // Update order status to canceled and restore inventory
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('payment_intent_id', paymentIntent.id)
      .select('id');

    if (orderError) {
      console.error('Error updating order status:', orderError);
      return;
    }

    // Restore inventory for canceled orders
    if (orders && orders.length > 0) {
      for (const order of orders) {
        await restoreOrderInventory(order.id, supabase);
      }
    }
  } catch (error) {
    console.error('Error in handlePaymentIntentCanceled:', error);
  }
}

async function handleChargeDisputeCreated(dispute: Stripe.Dispute, supabase: any) {
  console.log('Dispute created:', dispute.id);

  try {
    // Log dispute for admin review
    const { error } = await supabase.from('disputes').insert({
      stripe_dispute_id: dispute.id,
      charge_id: dispute.charge,
      amount: dispute.amount,
      currency: dispute.currency,
      reason: dispute.reason,
      status: dispute.status,
      evidence_due_by: dispute.evidence_details.due_by
        ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
        : null,
      created_at: new Date(dispute.created * 1000).toISOString(),
    });

    if (error) {
      console.error('Error logging dispute:', error);
    }

    // TODO: Send admin notification about dispute
    // TODO: Update order status if needed
  } catch (error) {
    console.error('Error in handleChargeDisputeCreated:', error);
  }
}

async function restoreOrderInventory(orderId: string, supabase: any) {
  try {
    // Get order items
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);

    if (error || !orderItems) {
      console.error('Error fetching order items:', error);
      return;
    }

    // Restore inventory for each item using RPC function
    for (const item of orderItems) {
      const { error: updateError } = await supabase.rpc('restore_product_inventory', {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });

      if (updateError) {
        console.error('Error restoring inventory:', updateError);
      }
    }
  } catch (error) {
    console.error('Error in restoreOrderInventory:', error);
  }
}
