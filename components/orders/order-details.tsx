'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { OrderStatus } from '@/components/orders/order-status';
import { OrderActions } from '@/components/orders/order-actions';
import {
  Package,
  MapPin,
  CreditCard,
  Calendar,
  DollarSign,
  Truck,
  Phone,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: {
    id: string;
    name: string;
    description?: string;
    image_url: string | null;
    category_id?: string;
    categories?: {
      id: string;
      name: string;
    };
  };
}

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
  order_items: OrderItem[];
  summary?: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

interface OrderDetailsProps {
  order: Order;
  onReorder?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  onReturn?: (orderId: string) => void;
  className?: string;
}

export function OrderDetails({
  order,
  onReorder,
  onCancel,
  onReturn,
  className,
}: OrderDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{order.order_number}</CardTitle>
              <p className="mt-1 text-gray-600">Placed on {formatDate(order.created_at)}</p>
            </div>
            <OrderStatus status={order.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold">{formatCurrency(order.total)}</p>
              </div>
            </div>

            {order.estimated_delivery && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Estimated Delivery</p>
                  <p className="font-semibold">
                    {new Date(order.estimated_delivery).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Items</p>
                <p className="font-semibold">{order.order_items.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Actions */}
      <OrderActions order={order} onReorder={onReorder} onCancel={onCancel} onReturn={onReturn} />

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Order Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items.map((item, index) => (
              <div key={item.id}>
                <div className="flex items-center space-x-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                    {item.products.image_url ? (
                      <Image
                        src={item.products.image_url}
                        alt={item.products.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-medium text-gray-900">{item.products.name}</h4>
                    {item.products.categories && (
                      <p className="text-sm text-gray-500">{item.products.categories.name}</p>
                    )}
                    <div className="mt-1 flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(item.price)} each
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>

                {index < order.order_items.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      {order.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.summary.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {order.summary.shipping === 0 ? 'Free' : formatCurrency(order.summary.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(order.summary.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.summary.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Shipping Address</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">
              {order.shipping_address.firstName} {order.shipping_address.lastName}
            </p>
            <p>{order.shipping_address.address}</p>
            {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
            <p>
              {order.shipping_address.city}, {order.shipping_address.state}{' '}
              {order.shipping_address.zipCode}
            </p>
            <p>{order.shipping_address.country}</p>

            <Separator className="my-3" />

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>{order.shipping_address.email}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>{order.shipping_address.phone}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Credit/Debit Card</span>
            <Badge variant="secondary">Paid</Badge>
          </div>
          {order.payment_intent_id && (
            <p className="mt-2 text-xs text-gray-500">Payment ID: {order.payment_intent_id}</p>
          )}
        </CardContent>
      </Card>

      {/* Order Notes */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Order Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
