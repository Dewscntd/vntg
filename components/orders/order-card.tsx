'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Eye, 
  RotateCcw,
  X,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: {
    id: string;
    name: string;
    image_url: string | null;
  };
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total: number;
  created_at: string;
  estimated_delivery?: string;
  order_items: OrderItem[];
}

interface OrderCardProps {
  order: Order;
  onReorder?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  processing: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800',
    icon: Package,
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-800',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: X,
  },
  returned: {
    label: 'Returned',
    color: 'bg-gray-100 text-gray-800',
    icon: RotateCcw,
  },
};

export function OrderCard({ order, onReorder, onCancel, className }: OrderCardProps) {
  const statusInfo = statusConfig[order.status];
  const StatusIcon = statusInfo.icon;
  const canCancel = order.status === 'pending' || order.status === 'processing';
  const canReorder = order.status === 'delivered' || order.status === 'cancelled';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getItemsPreview = () => {
    const maxItems = 3;
    const items = order.order_items.slice(0, maxItems);
    const remainingCount = order.order_items.length - maxItems;

    return (
      <div className="flex items-center space-x-2">
        {items.map((item, index) => (
          <div key={item.id} className="relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden">
            {item.products.image_url ? (
              <Image
                src={item.products.image_url}
                alt={item.products.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                <Package className="h-4 w-4 text-gray-400" />
              </div>
            )}
            {item.quantity > 1 && (
              <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {item.quantity}
              </div>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
            <span className="text-xs text-gray-600">+{remainingCount}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon className="h-5 w-5 text-gray-600" />
            <div>
              <h3 className="font-semibold text-lg">{order.order_number}</h3>
              <p className="text-sm text-gray-600">
                Ordered on {formatDate(order.created_at)}
              </p>
            </div>
          </div>
          <Badge className={statusInfo.color}>
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Items Preview */}
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">
            Items ({order.order_items.length})
          </p>
          {getItemsPreview()}
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="font-medium">${order.total.toFixed(2)}</span>
            </div>
            {order.estimated_delivery && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  Est. {formatDate(order.estimated_delivery)}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link href={`/account/orders/${order.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </Link>

          <div className="flex items-center space-x-2">
            {canReorder && onReorder && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReorder(order.id)}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reorder
              </Button>
            )}
            
            {canCancel && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(order.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Status-specific information */}
        {order.status === 'shipped' && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Your order has been shipped and is on its way!
              </span>
            </div>
          </div>
        )}

        {order.status === 'delivered' && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                Order delivered successfully. How was your experience?
              </span>
            </div>
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">
                This order was cancelled. Refund processed within 3-5 business days.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
