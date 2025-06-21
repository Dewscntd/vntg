'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/lib/context/checkout-context';
import { useCart } from '@/lib/context/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Mail, Download, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderConfirmationProps {
  orderId?: string;
  className?: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  estimatedDelivery: string;
  shippingAddress: any;
  items: any[];
}

export function OrderConfirmation({ orderId, className }: OrderConfirmationProps) {
  const router = useRouter();
  const { resetCheckout, shippingAddress, orderSummary } = useCheckout();
  const { clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const order = await response.json();
          setOrderDetails(order);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    // Clear cart and reset checkout state after successful order
    if (orderId) {
      clearCart();
      resetCheckout();
      setEmailSent(true);
    }
  }, [orderId, clearCart, resetCheckout]);

  const handleContinueShopping = () => {
    router.push('/products');
  };

  const handleViewOrder = () => {
    if (orderId) {
      router.push(`/account/orders/${orderId}`);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Success Header */}
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-600">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
      </div>

      {/* Order Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Order Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderDetails ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-medium">{orderDetails.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">
                    {new Date(orderDetails.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant="secondary">{orderDetails.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-medium">${orderDetails.total.toFixed(2)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Estimated Delivery</p>
                <p className="font-medium">{orderDetails.estimatedDelivery}</p>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-medium">{orderId || 'Processing...'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-medium">${orderSummary?.total.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipping Information */}
      {shippingAddress && (
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="font-medium">
                {shippingAddress.firstName} {shippingAddress.lastName}
              </p>
              <p>{shippingAddress.address}</p>
              {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
              <p>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
              </p>
              <p>{shippingAddress.country}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Confirmation */}
      {emailSent && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Confirmation Email Sent</p>
                <p className="text-sm text-gray-600">
                  We've sent a confirmation email to {shippingAddress?.email || 'your email address'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">1</span>
            </div>
            <div>
              <p className="font-medium">Order Processing</p>
              <p className="text-sm text-gray-600">
                We'll prepare your order for shipment within 1-2 business days.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">2</span>
            </div>
            <div>
              <p className="font-medium">Shipping Notification</p>
              <p className="text-sm text-gray-600">
                You'll receive a tracking number once your order ships.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">3</span>
            </div>
            <div>
              <p className="font-medium">Delivery</p>
              <p className="text-sm text-gray-600">
                Your order will be delivered to your specified address.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleContinueShopping} className="flex-1">
          Continue Shopping
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        
        {orderId && (
          <Button variant="outline" onClick={handleViewOrder} className="flex-1">
            View Order Details
          </Button>
        )}
        
        <Button variant="outline" className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download Receipt
        </Button>
      </div>

      {/* Support Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Need help with your order?
            </p>
            <div className="space-x-4">
              <Link 
                href="/support" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Contact Support
              </Link>
              <Link 
                href="/account/orders" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Track Orders
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
