'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/context/cart-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderCard } from '@/components/orders/order-card';
import { Search, Filter, Package, Calendar, SortAsc, SortDesc, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total: number;
  created_at: string;
  estimated_delivery?: string;
  order_items: any[];
}

interface OrderFilters {
  search: string;
  status: string;
  dateRange: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function OrderHistoryPage() {
  const { session } = useAuth();
  const { addItem } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: 'all',
    dateRange: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });

  const fetchOrders = async (newFilters?: Partial<OrderFilters>, newOffset = 0) => {
    if (!session) return;

    setLoading(true);
    try {
      const currentFilters = { ...filters, ...newFilters };
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: newOffset.toString(),
      });

      if (currentFilters.status !== 'all') {
        params.append('status', currentFilters.status);
      }

      const response = await fetch(`/api/orders?${params}`);
      if (response.ok) {
        const data = await response.json();

        // Filter and sort orders client-side for now
        let filteredOrders = data.orders || [];

        // Search filter
        if (currentFilters.search) {
          filteredOrders = filteredOrders.filter(
            (order: Order) =>
              order.order_number.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
              order.order_items.some((item: any) =>
                item.products?.name.toLowerCase().includes(currentFilters.search.toLowerCase())
              )
          );
        }

        // Date range filter
        if (currentFilters.dateRange !== 'all') {
          const now = new Date();
          const filterDate = new Date();

          switch (currentFilters.dateRange) {
            case 'week':
              filterDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              filterDate.setMonth(now.getMonth() - 1);
              break;
            case 'quarter':
              filterDate.setMonth(now.getMonth() - 3);
              break;
            case 'year':
              filterDate.setFullYear(now.getFullYear() - 1);
              break;
          }

          filteredOrders = filteredOrders.filter(
            (order: Order) => new Date(order.created_at) >= filterDate
          );
        }

        // Sort orders
        filteredOrders.sort((a: Order, b: Order) => {
          let aValue, bValue;

          switch (currentFilters.sortBy) {
            case 'total':
              aValue = a.total;
              bValue = b.total;
              break;
            case 'status':
              aValue = a.status;
              bValue = b.status;
              break;
            default:
              aValue = new Date(a.created_at).getTime();
              bValue = new Date(b.created_at).getTime();
          }

          if (currentFilters.sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        setOrders(newOffset === 0 ? filteredOrders : [...orders, ...filteredOrders]);
        setPagination({
          ...pagination,
          total: data.pagination?.total || filteredOrders.length,
          offset: newOffset,
          hasMore: data.pagination?.hasMore || false,
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [session]);

  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchOrders(newFilters, 0);
  };

  const handleReorder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const orderData = await response.json();

        // Add all items from the order to cart
        for (const item of orderData.order_items) {
          await addItem(item.products.id, item.quantity);
        }

        // Show success message or redirect to cart
        alert('Items added to cart successfully!');
      }
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Failed to reorder. Please try again.');
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh orders
        fetchOrders(filters, 0);
        alert('Order cancelled successfully.');
      } else {
        alert('Failed to cancel order. Please contact support.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };

  const loadMore = () => {
    fetchOrders(filters, pagination.offset + pagination.limit);
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Please sign in</h2>
          <p className="mb-4 text-gray-600">You need to be signed in to view your orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="mt-2 text-gray-600">View and manage all your orders.</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range */}
              <Select
                value={filters.dateRange}
                onValueChange={(value) => handleFilterChange('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last 3 Months</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Order Date</SelectItem>
                  <SelectItem value="total">Total Amount</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order */}
              <Button
                variant="outline"
                onClick={() =>
                  handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')
                }
                className="flex items-center space-x-2"
              >
                {filters.sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
                <span>{filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-6">
          {loading && orders.length === 0 ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 rounded-lg bg-gray-200"></div>
                </div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <>
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onReorder={handleReorder}
                  onCancel={handleCancel}
                />
              ))}

              {pagination.hasMore && (
                <div className="text-center">
                  <Button onClick={loadMore} disabled={loading} variant="outline">
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Load More Orders
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">No orders found</h3>
                <p className="mb-6 text-gray-600">
                  {filters.search || filters.status !== 'all' || filters.dateRange !== 'all'
                    ? 'Try adjusting your filters to see more orders.'
                    : "You haven't placed any orders yet. Start shopping to see your orders here."}
                </p>
                <Button onClick={() => (window.location.href = '/products')}>Start Shopping</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
