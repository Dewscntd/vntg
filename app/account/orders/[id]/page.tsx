'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/context/cart-context';
import { Button } from '@/components/ui/button';
import { OrderDetails } from '@/components/orders/order-details';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total: number;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  shipping_address: any;
  payment_intent_id?: string;
  notes?: string;
  order_items: any[];
  summary?: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const { addItem } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.id as string;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!session || !orderId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/orders/${orderId}`);

        if (response.ok) {
          const orderData = await response.json();
          setOrder(orderData);
        } else if (response.status === 404) {
          setError('Order not found');
        } else {
          setError('Failed to load order details');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('An error occurred while loading the order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [session, orderId]);

  const handleReorder = async (orderIdToReorder: string) => {
    if (!order) return;

    try {
      // Add all items from the order to cart
      for (const item of order.order_items) {
        await addItem(item.products.id, item.quantity);
      }

      // Redirect to cart
      router.push('/cart');
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Failed to reorder. Please try again.');
    }
  };

  const handleCancel = async (orderIdToCancel: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await fetch(`/api/orders/${orderIdToCancel}/cancel`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh order data
        const updatedResponse = await fetch(`/api/orders/${orderIdToCancel}`);
        if (updatedResponse.ok) {
          const updatedOrder = await updatedResponse.json();
          setOrder(updatedOrder);
        }
        alert('Order cancelled successfully.');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to cancel order. Please contact support.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };

  const handleReturn = async (orderIdToReturn: string, reason?: string) => {
    try {
      const response = await fetch(`/api/orders/${orderIdToReturn}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        // Refresh order data
        const updatedResponse = await fetch(`/api/orders/${orderIdToReturn}`);
        if (updatedResponse.ok) {
          const updatedOrder = await updatedResponse.json();
          setOrder(updatedOrder);
        }
        alert(
          'Return request submitted successfully. We will contact you with return instructions.'
        );
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit return request. Please contact support.');
      }
    } catch (error) {
      console.error('Error submitting return request:', error);
      alert('Failed to submit return request. Please try again.');
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Please sign in</h2>
          <p className="mb-4 text-gray-600">You need to be signed in to view order details.</p>
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/account/orders">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 rounded-lg bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/account/orders">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </Link>
          </div>

          <div className="py-12 text-center">
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">
              {error || 'Order not found'}
            </h2>
            <p className="mb-6 text-gray-600">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <div className="space-x-4">
              <Link href="/account/orders">
                <Button variant="outline">View All Orders</Button>
              </Link>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/account/orders">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
        </div>

        {/* Order Details */}
        <OrderDetails
          order={order}
          onReorder={handleReorder}
          onCancel={handleCancel}
          onReturn={handleReturn}
        />
      </div>
    </div>
  );
}
