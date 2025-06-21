'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Star, 
  MessageSquare, 
  RotateCcw,
  ExternalLink
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
  className 
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
                <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden">
                  {item.products.image_url ? (
                    <Image
                      src={item.products.image_url}
                      alt={item.products.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link 
                        href={`/products/${item.products.id}`}
                        className="group"
                      >
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {item.products.name}
                          <ExternalLink className="inline h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h4>
                      </Link>
                      
                      {item.products.categories && (
                        <p className="text-sm text-gray-500 mt-1">
                          {item.products.categories.name}
                        </p>
                      )}
                      
                      {item.products.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {item.products.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(item.price)} each
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right ml-4">
                      <p className="font-semibold text-lg">
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
                    <div className="flex items-center space-x-2 mt-4">
                      {canReorder && onReorderItem && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReorderItem(item.products.id, item.quantity)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reorder
                        </Button>
                      )}
                      
                      {canReview && onReviewItem && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReviewItem(item.products.id)}
                        >
                          <Star className="h-4 w-4 mr-1" />
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
              
              {index < items.length - 1 && (
                <Separator className="mt-6" />
              )}
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
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className={cn('bg-gray-50 rounded-lg p-4', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">
          Items Summary
        </span>
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

export function CompactOrderItems({ 
  items, 
  maxItems = 3, 
  className 
}: CompactOrderItemsProps) {
  const displayItems = items.slice(0, maxItems);
  const remainingCount = items.length - maxItems;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {displayItems.map((item) => (
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
          <span className="text-xs text-gray-600 font-medium">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
}
