'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, Eye, ShoppingCart } from 'lucide-react';

interface TopProduct {
  id: string;
  name: string;
  image_url?: string;
  sales_count: number;
  revenue: number;
  views?: number;
  conversion_rate?: number;
  inventory_count?: number;
  category?: string;
}

interface TopProductsProps {
  products: TopProduct[];
  loading?: boolean;
  title?: string;
  showRevenue?: boolean;
  showViews?: boolean;
  limit?: number;
}

export function TopProducts({
  products,
  loading,
  title = 'Top Products',
  showRevenue = true,
  showViews = false,
  limit = 5,
}: TopProductsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const displayProducts = products.slice(0, limit);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-lg bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                  </div>
                  <div className="h-4 w-16 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-500">No product data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Package className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
        <Link href="/admin/products">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayProducts.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center space-x-4 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              {/* Rank */}
              <div className="flex-shrink-0">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    index === 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : index === 1
                        ? 'bg-gray-100 text-gray-800'
                        : index === 2
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {index + 1}
                </div>
              </div>

              {/* Product Image */}
              <div className="flex-shrink-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="min-w-0 flex-1">
                <Link href={`/admin/products/${product.id}/edit`}>
                  <h4 className="truncate font-medium text-gray-900 transition-colors hover:text-blue-600">
                    {product.name}
                  </h4>
                </Link>
                <div className="mt-1 flex items-center space-x-3">
                  <div className="flex items-center text-xs text-gray-500">
                    <ShoppingCart className="mr-1 h-3 w-3" />
                    {formatNumber(product.sales_count)} sold
                  </div>
                  {showViews && product.views && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Eye className="mr-1 h-3 w-3" />
                      {formatNumber(product.views)} views
                    </div>
                  )}
                  {product.category && (
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="text-right">
                {showRevenue && (
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(product.revenue)}
                  </div>
                )}
                <div className="mt-1 flex items-center justify-end space-x-2">
                  {product.conversion_rate && (
                    <div className="flex items-center text-xs text-green-600">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {product.conversion_rate.toFixed(1)}%
                    </div>
                  )}
                  {product.inventory_count !== undefined && (
                    <Badge
                      variant={product.inventory_count < 10 ? 'secondary' : 'outline'}
                      className={`text-xs ${
                        product.inventory_count < 10 ? 'bg-orange-100 text-orange-800' : ''
                      }`}
                    >
                      {product.inventory_count} left
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(displayProducts.reduce((sum, p) => sum + p.sales_count, 0))}
              </p>
              <p className="text-xs text-gray-600">Total Sales</p>
            </div>
            {showRevenue && (
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(displayProducts.reduce((sum, p) => sum + p.revenue, 0))}
                </p>
                <p className="text-xs text-gray-600">Total Revenue</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
