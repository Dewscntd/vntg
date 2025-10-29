'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderCard } from '@/components/orders/order-card';
import {
  User,
  Package,
  CreditCard,
  MapPin,
  Settings,
  ShoppingBag,
  Clock,
  CheckCircle,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  order_items: any[];
}

export default function AccountDashboard() {
  const { session, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session) return;

      try {
        // Fetch recent orders
        const ordersResponse = await fetch('/api/orders?limit=3');
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setRecentOrders(ordersData.orders || []);
        }

        // Calculate stats from orders
        const allOrdersResponse = await fetch('/api/orders?limit=100');
        if (allOrdersResponse.ok) {
          const allOrdersData = await allOrdersResponse.json();
          const orders = allOrdersData.orders || [];

          const dashboardStats: DashboardStats = {
            totalOrders: orders.length,
            pendingOrders: orders.filter(
              (o: any) => o.status === 'pending' || o.status === 'processing'
            ).length,
            completedOrders: orders.filter((o: any) => o.status === 'delivered').length,
            totalSpent: orders.reduce((sum: number, order: any) => sum + order.total, 0),
          };

          setStats(dashboardStats);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Please sign in</h2>
          <p className="mb-4 text-gray-600">You need to be signed in to access your account.</p>
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back,{' '}
            {user?.user_metadata?.full_name ||
              user?.user_metadata?.name ||
              user?.email?.split('@')[0] ||
              'there'}
            !
          </h1>
          <p className="mt-2 text-gray-600">Manage your orders, profile, and account settings.</p>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ShoppingBag className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CreditCard className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats.totalSpent.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Recent Orders</span>
                  </CardTitle>
                  <Link href="/account/orders">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 rounded-lg bg-gray-200"></div>
                      </div>
                    ))}
                  </div>
                ) : recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order as any}
                        className="border-0 bg-gray-50 shadow-none"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">No orders yet</h3>
                    <p className="mb-4 text-gray-600">Start shopping to see your orders here.</p>
                    <Link href="/products">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">
                    {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <Link href="/account/settings">
                  <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/account/orders" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    Order History
                  </Button>
                </Link>

                <Link href="/account/addresses" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <MapPin className="mr-2 h-4 w-4" />
                    Address Book
                  </Button>
                </Link>

                <Link href="/account/settings" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Button>
                </Link>

                <Link href="/products" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
