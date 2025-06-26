'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  ShoppingCart,
  User,
  Package,
  DollarSign,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Clock,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'order' | 'user' | 'product' | 'payment' | 'system';
  action: string;
  description: string;
  user?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
  metadata?: {
    order_id?: string;
    product_id?: string;
    user_id?: string;
    amount?: number;
    status?: string;
  };
  timestamp: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  loading?: boolean;
  limit?: number;
}

export function RecentActivity({ activities, loading, limit = 10 }: RecentActivityProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getActivityConfig = (type: ActivityItem['type'], action: string) => {
    switch (type) {
      case 'order':
        return {
          icon: ShoppingCart,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          link: action.includes('created')
            ? `/admin/orders/${action.split(' ')[0]}`
            : '/admin/orders',
        };
      case 'user':
        return {
          icon: action.includes('registered') ? UserPlus : User,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          link: '/admin/users',
        };
      case 'product':
        return {
          icon: action.includes('created') ? Package : action.includes('updated') ? Edit : Trash2,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          link: '/admin/products',
        };
      case 'payment':
        return {
          icon: DollarSign,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          link: '/admin/orders',
        };
      case 'system':
        return {
          icon: Activity,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          link: '/admin',
        };
      default:
        return {
          icon: Activity,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          link: '/admin',
        };
    }
  };

  const displayActivities = activities.slice(0, limit);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                  </div>
                  <div className="h-3 w-16 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          Recent Activity
        </CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity) => {
            const config = getActivityConfig(activity.type, activity.action);
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className="flex items-start space-x-4 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                {/* Activity Icon */}
                <div className={`rounded-full p-2 ${config.bgColor} flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>

                {/* Activity Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="mt-1 text-sm text-gray-600">{activity.description}</p>

                      {/* User Info */}
                      {activity.user && (
                        <div className="mt-2 flex items-center">
                          {activity.user.avatar_url ? (
                            <img
                              src={activity.user.avatar_url}
                              alt={activity.user.name}
                              className="mr-2 h-6 w-6 rounded-full"
                            />
                          ) : (
                            <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                              <User className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                          <span className="text-xs text-gray-500">{activity.user.name}</span>
                        </div>
                      )}

                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="mt-2 flex items-center space-x-3">
                          {activity.metadata.amount && (
                            <Badge variant="outline" className="text-xs">
                              {formatCurrency(activity.metadata.amount)}
                            </Badge>
                          )}
                          {activity.metadata.status && (
                            <Badge
                              variant={
                                activity.metadata.status === 'completed'
                                  ? 'default'
                                  : activity.metadata.status === 'pending'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className="text-xs"
                            >
                              {activity.metadata.status}
                            </Badge>
                          )}
                          {activity.metadata.order_id && (
                            <Link
                              href={`/admin/orders/${activity.metadata.order_id}`}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              #{activity.metadata.order_id.slice(0, 8)}
                            </Link>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="ml-4 flex-shrink-0 text-xs text-gray-500">
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Activity Summary */}
        <div className="mt-6 border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
            {['order', 'user', 'product', 'payment'].map((type) => {
              const count = activities.filter((a) => a.type === type).length;
              const config = getActivityConfig(type as ActivityItem['type'], '');
              const Icon = config.icon;

              return (
                <div key={type} className="flex flex-col items-center">
                  <div className={`rounded-lg p-2 ${config.bgColor} mb-2`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{count}</p>
                  <p className="text-xs capitalize text-gray-600">{type}s</p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
