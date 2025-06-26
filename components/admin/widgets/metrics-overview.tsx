'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Eye,
  Percent,
} from 'lucide-react';

interface MetricsData {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  monthlyRevenue?: number;
  monthlyOrders?: number;
  conversionRate?: number;
  averageOrderValue?: number;
  revenueGrowth?: number;
  orderGrowth?: number;
  userGrowth?: number;
}

interface MetricsOverviewProps {
  data: MetricsData;
  loading?: boolean;
}

export function MetricsOverview({ data, loading }: MetricsOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="mb-2 h-4 w-1/2 rounded bg-gray-200"></div>
                <div className="mb-2 h-8 w-3/4 rounded bg-gray-200"></div>
                <div className="h-3 w-1/3 rounded bg-gray-200"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
      trend: data.revenueGrowth,
      subtitle: data.monthlyRevenue
        ? `${formatCurrency(data.monthlyRevenue)} this month`
        : 'All time',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Orders',
      value: formatNumber(data.totalOrders),
      icon: ShoppingCart,
      trend: data.orderGrowth,
      subtitle: data.pendingOrders > 0 ? `${data.pendingOrders} pending` : 'All orders',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      alert: data.pendingOrders > 0 ? data.pendingOrders : undefined,
    },
    {
      title: 'Total Products',
      value: formatNumber(data.totalProducts),
      icon: Package,
      subtitle: data.lowStockProducts > 0 ? `${data.lowStockProducts} low stock` : 'In catalog',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      alert: data.lowStockProducts > 0 ? data.lowStockProducts : undefined,
      alertType: 'warning' as const,
    },
    {
      title: 'Total Users',
      value: formatNumber(data.totalUsers),
      icon: Users,
      trend: data.userGrowth,
      subtitle: 'Registered customers',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Average Order Value',
      value: data.averageOrderValue ? formatCurrency(data.averageOrderValue) : formatCurrency(0),
      icon: TrendingUp,
      subtitle: 'Per order',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Conversion Rate',
      value: data.conversionRate ? `${data.conversionRate.toFixed(1)}%` : '0%',
      icon: Percent,
      subtitle: 'Visitors to customers',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Monthly Revenue',
      value: data.monthlyRevenue ? formatCurrency(data.monthlyRevenue) : formatCurrency(0),
      icon: DollarSign,
      trend: data.revenueGrowth,
      subtitle: 'This month',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Monthly Orders',
      value: data.monthlyOrders ? formatNumber(data.monthlyOrders) : '0',
      icon: Activity,
      trend: data.orderGrowth,
      subtitle: 'This month',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isPositiveTrend = metric.trend && metric.trend > 0;
        const isNegativeTrend = metric.trend && metric.trend < 0;

        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{metric.title}</CardTitle>
              <div className={`rounded-lg p-2 ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-1 text-2xl font-bold text-gray-900">{metric.value}</div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">{metric.subtitle}</p>

                {metric.trend !== undefined && (
                  <div
                    className={`flex items-center text-xs ${
                      isPositiveTrend
                        ? 'text-green-600'
                        : isNegativeTrend
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {isPositiveTrend ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : isNegativeTrend ? (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    ) : null}
                    {formatPercentage(metric.trend)}
                  </div>
                )}
              </div>

              {metric.alert && (
                <div className="mt-2">
                  <Badge
                    variant={metric.alertType === 'warning' ? 'secondary' : 'default'}
                    className={`text-xs ${
                      metric.alertType === 'warning'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {metric.alertType === 'warning' ? (
                      <AlertTriangle className="mr-1 h-3 w-3" />
                    ) : (
                      <Activity className="mr-1 h-3 w-3" />
                    )}
                    {metric.alert} {metric.alertType === 'warning' ? 'low stock' : 'pending'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
