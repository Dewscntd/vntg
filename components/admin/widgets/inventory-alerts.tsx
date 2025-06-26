'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, XCircle, Clock, TrendingDown } from 'lucide-react';

interface InventoryAlert {
  id: string;
  name: string;
  image_url?: string;
  inventory_count: number;
  category?: string;
  last_sale_date?: string;
  sales_velocity?: number; // sales per day
  days_until_stockout?: number;
  reorder_point?: number;
  status: 'out_of_stock' | 'low_stock' | 'critical' | 'slow_moving';
}

interface InventoryAlertsProps {
  alerts: InventoryAlert[];
  loading?: boolean;
  limit?: number;
}

export function InventoryAlerts({ alerts, loading, limit = 10 }: InventoryAlertsProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getAlertConfig = (status: InventoryAlert['status']) => {
    switch (status) {
      case 'out_of_stock':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          badgeVariant: 'destructive' as const,
          label: 'Out of Stock',
          priority: 4,
        };
      case 'critical':
        return {
          icon: AlertTriangle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          badgeVariant: 'destructive' as const,
          label: 'Critical',
          priority: 3,
        };
      case 'low_stock':
        return {
          icon: AlertTriangle,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50',
          badgeVariant: 'secondary' as const,
          label: 'Low Stock',
          priority: 2,
        };
      case 'slow_moving':
        return {
          icon: TrendingDown,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          badgeVariant: 'outline' as const,
          label: 'Slow Moving',
          priority: 1,
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          badgeVariant: 'outline' as const,
          label: 'Unknown',
          priority: 0,
        };
    }
  };

  // Sort alerts by priority (highest first)
  const sortedAlerts = [...alerts]
    .sort((a, b) => getAlertConfig(b.status).priority - getAlertConfig(a.status).priority)
    .slice(0, limit);

  const alertCounts = alerts.reduce(
    (acc, alert) => {
      acc[alert.status] = (acc[alert.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Inventory Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-lg bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                  </div>
                  <div className="h-6 w-20 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sortedAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Inventory Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <p className="font-medium text-green-600">All Good!</p>
            <p className="text-sm text-gray-500">No inventory alerts at this time</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Inventory Alerts
          {alerts.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
        <Link href="/admin/products?filter=alerts">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {/* Alert Summary */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Object.entries(alertCounts).map(([status, count]) => {
            const config = getAlertConfig(status as InventoryAlert['status']);
            const Icon = config.icon;
            return (
              <div key={status} className={`rounded-lg p-3 ${config.bgColor}`}>
                <div className="flex items-center">
                  <Icon className={`mr-2 h-4 w-4 ${config.color}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{count}</p>
                    <p className="text-xs text-gray-600">{config.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alert List */}
        <div className="space-y-3">
          {sortedAlerts.map((alert) => {
            const config = getAlertConfig(alert.status);
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className="flex items-center space-x-4 rounded-lg border p-3 transition-colors hover:bg-gray-50"
              >
                {/* Alert Icon */}
                <div className={`rounded-lg p-2 ${config.bgColor}`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>

                {/* Product Image */}
                <div className="flex-shrink-0">
                  {alert.image_url ? (
                    <img
                      src={alert.image_url}
                      alt={alert.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/products/${alert.id}/edit`}>
                    <h4 className="truncate font-medium text-gray-900 transition-colors hover:text-blue-600">
                      {alert.name}
                    </h4>
                  </Link>
                  <div className="mt-1 flex items-center space-x-3">
                    <span className="text-xs text-gray-500">{alert.inventory_count} in stock</span>
                    {alert.category && (
                      <Badge variant="outline" className="text-xs">
                        {alert.category}
                      </Badge>
                    )}
                    {alert.days_until_stockout && alert.days_until_stockout > 0 && (
                      <span className="text-xs text-orange-600">
                        {alert.days_until_stockout} days left
                      </span>
                    )}
                  </div>
                </div>

                {/* Alert Status */}
                <div className="text-right">
                  <Badge variant={config.badgeVariant} className="mb-1">
                    {config.label}
                  </Badge>
                  {alert.last_sale_date && (
                    <p className="text-xs text-gray-500">
                      Last sale: {formatDate(alert.last_sale_date)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 border-t pt-4">
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/products?filter=out_of_stock">
              <Button variant="outline" size="sm">
                <XCircle className="mr-2 h-4 w-4" />
                Restock Out of Stock
              </Button>
            </Link>
            <Link href="/admin/products?filter=low_stock">
              <Button variant="outline" size="sm">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Review Low Stock
              </Button>
            </Link>
            <Link href="/admin/products?filter=slow_moving">
              <Button variant="outline" size="sm">
                <TrendingDown className="mr-2 h-4 w-4" />
                Promote Slow Movers
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
