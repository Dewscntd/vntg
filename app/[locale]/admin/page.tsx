'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { AdminLayout } from '@/components/admin/admin-layout';
import { MetricsOverview } from '@/components/admin/widgets/metrics-overview';
import { SalesChart } from '@/components/admin/widgets/sales-chart';
import { TopProducts } from '@/components/admin/widgets/top-products';
import { InventoryAlerts } from '@/components/admin/widgets/inventory-alerts';
import { RecentActivity } from '@/components/admin/widgets/recent-activity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
import { apiUrl } from '@/lib/utils/api';
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  Eye,
  Plus,
  Activity,
  AlertTriangle,
} from 'lucide-react';

interface DashboardMetrics {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  conversionRate: number;
  averageOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;
  recentOrders: Array<{
    id: string;
    customer_name: string;
    total: number;
    status: string;
    created_at: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    image_url?: string;
    sales_count: number;
    revenue: number;
    views?: number;
    conversion_rate?: number;
    inventory_count?: number;
    category?: string;
  }>;
  salesData: Array<{
    period: string;
    revenue: number;
    orders: number;
    customers: number;
    date: string;
  }>;
  inventoryAlerts: Array<{
    id: string;
    name: string;
    image_url?: string;
    inventory_count: number;
    category?: string;
    last_sale_date?: string;
    sales_velocity?: number;
    days_until_stockout?: number;
    reorder_point?: number;
    status: 'out_of_stock' | 'low_stock' | 'critical' | 'slow_moving';
  }>;
  recentActivity: Array<{
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
  }>;
}

export default function AdminDashboard() {
  const { session, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      // For local development with stubs, grant admin access directly regardless of session
      if (process.env.NEXT_PUBLIC_USE_STUBS === 'true') {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(apiUrl('/api/user/profile'));

        if (response.ok) {
          const userData = await response.json();
          // Check both userData.role and userData.user.role
          const userRole = userData.role || userData.user?.role;
          setIsAdmin(userRole === 'admin');
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [session]);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      if (!isAdmin) return;

      try {
        setMetricsLoading(true);

        // Fetch dashboard metrics from multiple endpoints
        const [productsRes, ordersRes, usersRes, analyticsRes] = await Promise.all([
          fetch(apiUrl('/api/products?limit=1')),
          fetch(apiUrl('/api/orders?limit=10')),
          fetch(apiUrl('/api/admin/users?limit=1')),
          fetch(apiUrl('/api/analytics/metrics')),
        ]);

        const [productsData, ordersData, usersData, analyticsData] = await Promise.all([
          productsRes.ok ? productsRes.json() : { data: { total: 0 } },
          ordersRes.ok ? ordersRes.json() : { data: { orders: [], total: 0 } },
          usersRes.ok ? usersRes.json() : { data: { total: 0 } },
          analyticsRes.ok ? analyticsRes.json() : { data: { totalRevenue: 0 } },
        ]);

        // Calculate additional metrics
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyOrders =
          ordersData.data?.orders?.filter((o: any) => {
            const orderDate = new Date(o.created_at);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
          }) || [];

        const monthlyRevenue = monthlyOrders.reduce(
          (sum: number, order: any) => sum + order.total,
          0
        );
        const averageOrderValue =
          ordersData.data?.orders?.length > 0
            ? (analyticsData.data?.totalRevenue || 0) / ordersData.data.orders.length
            : 0;

        // Mock enhanced data for demonstration
        const dashboardMetrics: DashboardMetrics = {
          totalProducts: productsData.data?.total || 0,
          totalOrders: ordersData.data?.total || 0,
          totalUsers: usersData.data?.total || 0,
          totalRevenue: analyticsData.data?.totalRevenue || 0,
          pendingOrders:
            ordersData.data?.orders?.filter((o: any) => o.status === 'pending').length || 0,
          lowStockProducts: 5,
          monthlyRevenue,
          monthlyOrders: monthlyOrders.length,
          conversionRate: 3.2,
          averageOrderValue,
          revenueGrowth: 12.5,
          orderGrowth: 8.3,
          userGrowth: 15.7,
          recentOrders: ordersData.data?.orders?.slice(0, 5) || [],
          topProducts: [
            {
              id: '1',
              name: 'Vintage Leather Jacket',
              image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
              sales_count: 45,
              revenue: 4500,
              views: 1250,
              conversion_rate: 3.6,
              inventory_count: 8,
              category: 'Outerwear',
            },
            {
              id: '2',
              name: 'Classic Denim Jeans',
              image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
              sales_count: 38,
              revenue: 3800,
              views: 980,
              conversion_rate: 3.9,
              inventory_count: 15,
              category: 'Bottoms',
            },
            {
              id: '3',
              name: 'Retro Sunglasses',
              image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
              sales_count: 32,
              revenue: 1600,
              views: 750,
              conversion_rate: 4.3,
              inventory_count: 3,
              category: 'Accessories',
            },
          ],
          salesData: [
            { period: 'Mon', revenue: 1200, orders: 12, customers: 8, date: '2024-01-15' },
            { period: 'Tue', revenue: 1800, orders: 18, customers: 12, date: '2024-01-16' },
            { period: 'Wed', revenue: 2200, orders: 22, customers: 15, date: '2024-01-17' },
            { period: 'Thu', revenue: 1900, orders: 19, customers: 13, date: '2024-01-18' },
            { period: 'Fri', revenue: 2800, orders: 28, customers: 20, date: '2024-01-19' },
            { period: 'Sat', revenue: 3200, orders: 32, customers: 25, date: '2024-01-20' },
            { period: 'Sun', revenue: 2100, orders: 21, customers: 16, date: '2024-01-21' },
          ],
          inventoryAlerts: [
            {
              id: '1',
              name: 'Vintage Band T-Shirt',
              image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
              inventory_count: 0,
              category: 'Apparel',
              status: 'out_of_stock',
              last_sale_date: '2024-01-20',
            },
            {
              id: '2',
              name: 'Retro Sunglasses',
              inventory_count: 3,
              category: 'Accessories',
              status: 'critical',
              days_until_stockout: 2,
              sales_velocity: 1.5,
            },
            {
              id: '3',
              name: 'Classic Sneakers',
              inventory_count: 8,
              category: 'Footwear',
              status: 'low_stock',
              days_until_stockout: 5,
              sales_velocity: 1.6,
            },
          ],
          recentActivity: [
            {
              id: '1',
              type: 'order',
              action: 'New order received',
              description: 'Order #ORD-001 for $125.99',
              user: { name: 'John Doe', email: 'john@example.com' },
              metadata: { order_id: 'ORD-001', amount: 125.99, status: 'pending' },
              timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            },
            {
              id: '2',
              type: 'user',
              action: 'New user registered',
              description: 'Sarah Johnson created an account',
              user: { name: 'Sarah Johnson', email: 'sarah@example.com' },
              timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            },
            {
              id: '3',
              type: 'product',
              action: 'Product updated',
              description: 'Vintage Leather Jacket inventory updated',
              metadata: { product_id: 'PROD-001' },
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            },
          ],
        };

        setMetrics(dashboardMetrics);
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Please sign in</h2>
          <p className="mb-4 text-gray-600">You need to be signed in to access the admin panel.</p>
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="mb-4 text-gray-600">You don't have permission to access the admin panel.</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-gray-600">Manage your e-commerce platform</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  View Store
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Metrics Overview */}
        <div className="mb-8">
          <MetricsOverview
            data={
              metrics || {
                totalProducts: 0,
                totalOrders: 0,
                totalUsers: 0,
                totalRevenue: 0,
                pendingOrders: 0,
                lowStockProducts: 0,
              }
            }
            loading={metricsLoading}
          />
        </div>

        {/* Sales Chart */}
        <div className="mb-8">
          <SalesChart data={metrics?.salesData || []} loading={metricsLoading} />
        </div>

        {/* Enhanced Widgets Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TopProducts
            products={metrics?.topProducts || []}
            loading={metricsLoading}
            showRevenue={true}
            showViews={true}
            limit={5}
          />
          <InventoryAlerts
            alerts={metrics?.inventoryAlerts || []}
            loading={metricsLoading}
            limit={8}
          />
        </div>

        {/* Activity and Quick Actions */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity
              activities={metrics?.recentActivity || []}
              loading={metricsLoading}
              limit={10}
            />
          </div>
          <div>
            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/products/new">
                  <Button className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Product
                  </Button>
                </Link>
                <Link href="/admin/orders?status=pending">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="mr-2 h-4 w-4" />
                    Process Orders
                    {metrics?.pendingOrders && metrics.pendingOrders > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {metrics.pendingOrders}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/admin/products?filter=low_stock">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Restock Items
                    {metrics?.lowStockProducts && metrics.lowStockProducts > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {metrics.lowStockProducts}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/admin/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Management Overview */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Package className="mr-2 h-5 w-5" />
                Product Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{metrics?.totalProducts || 0}</p>
                <p className="text-sm text-gray-600">Total Products</p>
              </div>
              <Link href="/admin/products">
                <Button variant="outline" className="w-full">
                  Manage Catalog
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Order Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{metrics?.totalOrders || 0}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              <Link href="/admin/orders">
                <Button variant="outline" className="w-full">
                  Manage Orders
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="mr-2 h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{metrics?.totalUsers || 0}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full">
                  Manage Users
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Activity className="mr-2 h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 rounded-lg bg-green-50 p-3">
                  <div className="mx-auto h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-green-600">Online</p>
              </div>
              <div className="text-center">
                <div className="mb-2 rounded-lg bg-green-50 p-3">
                  <div className="mx-auto h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <p className="text-sm font-medium">Payments</p>
                <p className="text-xs text-green-600">Connected</p>
              </div>
              <div className="text-center">
                <div className="mb-2 rounded-lg bg-green-50 p-3">
                  <div className="mx-auto h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-xs text-green-600">Active</p>
              </div>
              <div className="text-center">
                <div className="mb-2 rounded-lg bg-blue-50 p-3">
                  <div className="mx-auto h-3 w-3 rounded-full bg-blue-500"></div>
                </div>
                <p className="text-sm font-medium">API</p>
                <p className="text-xs text-blue-600">Healthy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
