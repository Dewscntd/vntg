import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { Resend } from 'resend';
import { successResponse, errorResponse, handleDatabaseError } from '@/lib/api/index';

// Lazy initialization to avoid build-time errors
const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(process.env.RESEND_API_KEY);
};

// POST /api/emails/order-confirmation - Send order confirmation email
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, userEmail, paymentIntentId } = body;

    if (!orderId && !paymentIntentId) {
      return errorResponse('Order ID or Payment Intent ID is required', 400);
    }

    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get order details
    let orderQuery = supabase.from('orders').select(`
        id,
        order_number,
        status,
        total,
        shipping_address,
        estimated_delivery,
        created_at,
        users (
          email,
          full_name
        ),
        order_items (
          quantity,
          price,
          products (
            name,
            image_url
          )
        )
      `);

    if (orderId) {
      orderQuery = orderQuery.eq('id', orderId);
    } else {
      orderQuery = orderQuery.eq('payment_intent_id', paymentIntentId);
    }

    const { data: order, error } = await orderQuery.single();

    if (error || !order) {
      console.error('Order not found:', error);
      return errorResponse('Order not found', 404);
    }

    // Extract email from order or use provided email
    const users = Array.isArray(order.users) ? order.users[0] : order.users;
    const recipientEmail = userEmail || users?.email || (order.shipping_address as any)?.email;

    if (!recipientEmail) {
      return errorResponse('No email address found', 400);
    }

    // Extract customer name
    const customerName =
      users?.full_name ||
      `${(order.shipping_address as any)?.firstName} ${(order.shipping_address as any)?.lastName}` ||
      'Valued Customer';

    // Calculate order summary
    const subtotal =
      order.order_items?.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0) || 0;

    const shipping = 0; // Calculate based on shipping method
    const tax = order.total - subtotal - shipping;

    // Generate email HTML
    const emailHtml = generateOrderConfirmationEmail({
      order,
      customerName,
      subtotal,
      shipping,
      tax,
    });

    // Send email
    const resend = getResendClient();
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Peakees <orders@peakees.com>',
      to: [recipientEmail],
      subject: `Order Confirmation - ${order.order_number}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      return errorResponse('Failed to send confirmation email', 500);
    }

    return successResponse({
      message: 'Order confirmation email sent successfully',
      emailId: emailData?.id,
      sentTo: recipientEmail,
    });
  } catch (error) {
    console.error('Error in order confirmation email:', error);
    return handleDatabaseError(error as Error);
  }
}

function generateOrderConfirmationEmail({
  order,
  customerName,
  subtotal,
  shipping,
  tax,
}: {
  order: any;
  customerName: string;
  subtotal: number;
  shipping: number;
  tax: number;
}) {
  const shippingAddress = order.shipping_address as any;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-weight: bold; font-size: 18px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase, ${customerName}</p>
        </div>
        
        <div class="content">
          <div class="order-details">
            <h2>Order Details</h2>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            ${order.estimated_delivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.estimated_delivery).toLocaleDateString()}</p>` : ''}
          </div>
          
          <div class="order-details">
            <h2>Items Ordered</h2>
            ${
              order.order_items
                ?.map(
                  (item: any) => `
              <div class="item">
                <div>
                  <strong>${item.products?.name}</strong><br>
                  <small>Quantity: ${item.quantity}</small>
                </div>
                <div>$${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            `
                )
                .join('') || ''
            }
            
            <div class="item">
              <div>Subtotal</div>
              <div>$${subtotal.toFixed(2)}</div>
            </div>
            <div class="item">
              <div>Shipping</div>
              <div>${shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</div>
            </div>
            <div class="item">
              <div>Tax</div>
              <div>$${tax.toFixed(2)}</div>
            </div>
            <div class="item total">
              <div>Total</div>
              <div>$${order.total.toFixed(2)}</div>
            </div>
          </div>
          
          <div class="order-details">
            <h2>Shipping Address</h2>
            <p>
              ${shippingAddress?.firstName} ${shippingAddress?.lastName}<br>
              ${shippingAddress?.address}<br>
              ${shippingAddress?.address2 ? `${shippingAddress.address2}<br>` : ''}
              ${shippingAddress?.city}, ${shippingAddress?.state} ${shippingAddress?.zipCode}<br>
              ${shippingAddress?.country}
            </p>
          </div>
          
          <div class="order-details">
            <h2>What's Next?</h2>
            <p>We'll send you a shipping confirmation email with tracking information once your order ships.</p>
            <p>You can track your order status anytime by visiting your account page.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for shopping with Peakees!</p>
          <p>If you have any questions, please contact our support team.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/support">Contact Support</a> | <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders">Track Orders</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
