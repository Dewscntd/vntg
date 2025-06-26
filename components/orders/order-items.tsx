'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Star, MessageSquare, RotateCcw, ExternalLink } from 'lucide-react';
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

interface OrderItemsProps {
  items: OrderItem[];
  orderStatus: string;
  onReorderItem?: (productId: string, quantity: number) => void;
  onReviewItem?: (productId: string) => void;
  showActions?: boolean;
  className?: string;
}

export function OrderItems({
  items,
  orderStatus,
  onReorderItem,
  onReviewItem,
  showActions = true,
  className,
}: OrderItemsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const canReorder = orderStatus === 'delivered' || orderStatus === 'cancelled';
  const canReview = orderStatus === 'delivered';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Order Items ({items.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-start space-x-4">
                {/* Product Image */}
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                  {item.products.image_url ? (
                    <Image
                      src={item.products.image_url}
                      alt={item.products.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/products/${item.products.id}`} className="group">
                        <h4 className="font-medium text-gray-900 transition-colors group-hover:text-blue-600">
                          {item.products.name}
                          <ExternalLink className="ml-1 inline h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        </h4>
                      </Link>

                      {item.products.categories && (
                        <p className="mt-1 text-sm text-gray-500">
                          {item.products.categories.name}
                        </p>
                      )}

                      {item.products.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                          {item.products.description}
                        </p>
                      )}

                      <div className="mt-2 flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(item.price)} each
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="ml-4 text-right">
                      <p className="text-lg font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-500">
                          {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {showActions && (
                    <div className="mt-4 flex items-center space-x-2">
                      {canReorder && onReorderItem && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReorderItem(item.products.id, item.quantity)}
                        >
                          <RotateCcw className="mr-1 h-4 w-4" />
                          Reorder
                        </Button>
                      )}

                      {canReview && onReviewItem && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReviewItem(item.products.id)}
                        >
                          <Star className="mr-1 h-4 w-4" />
                          Write Review
                        </Button>
                      )}

                      <Link href={`/products/${item.products.id}`}>
                        <Button variant="ghost" size="sm">
                          View Product
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {index < items.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface OrderItemsSummaryProps {
  items: OrderItem[];
  className?: string;
}

export function OrderItemsSummary({ items, className }: OrderItemsSummaryProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className={cn('rounded-lg bg-gray-50 p-4', className)}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">Items Summary</span>
        <Badge variant="secondary">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
      </div>
    </div>
  );
}

interface CompactOrderItemsProps {
  items: OrderItem[];
  maxItems?: number;
  className?: string;
}

export function CompactOrderItems({ items, maxItems = 3, className }: CompactOrderItemsProps) {
  const displayItems = items.slice(0, maxItems);
  const remainingCount = items.length - maxItems;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {displayItems.map((item) => (
        <div key={item.id} className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
          {item.products.image_url ? (
            <Image
              src={item.products.image_url}
              alt={item.products.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              <Package className="h-4 w-4 text-gray-400" />
            </div>
          )}
          {item.quantity > 1 && (
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
              {item.quantity}
            </div>
          )}
        </div>
      ))}

      {remainingCount > 0 && (
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100">
          <span className="text-xs font-medium text-gray-600">+{remainingCount}</span>
        </div>
      )}
    </div>
  );
}
