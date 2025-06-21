'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  RotateCcw, 
  X, 
  Download, 
  MessageSquare, 
  MoreHorizontal,
  AlertTriangle,
  Package,
  Truck,
  Phone
} from 'lucide-react';
import { canCancelOrder, canReturnOrder, canReorderOrder } from './order-status';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total: number;
  created_at: string;
}

interface OrderActionsProps {
  order: Order;
  onReorder?: (orderId: string) => void;
  onCancel?: (orderId: string, reason?: string) => void;
  onReturn?: (orderId: string, reason?: string) => void;
  onDownloadInvoice?: (orderId: string) => void;
  onContactSupport?: (orderId: string) => void;
  className?: string;
}

export function OrderActions({
  order,
  onReorder,
  onCancel,
  onReturn,
  onDownloadInvoice,
  onContactSupport,
  className
}: OrderActionsProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canCancel = canCancelOrder(order.status);
  const canReturn = canReturnOrder(order.status);
  const canReorderItem = canReorderOrder(order.status);

  const handleCancel = async () => {
    if (!onCancel) return;
    
    setIsLoading(true);
    try {
      await onCancel(order.id, cancelReason);
      setCancelDialogOpen(false);
      setCancelReason('');
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!onReturn) return;
    
    setIsLoading(true);
    try {
      await onReturn(order.id, returnReason);
      setReturnDialogOpen(false);
      setReturnReason('');
    } catch (error) {
      console.error('Error returning order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = () => {
    if (onReorder) {
      onReorder(order.id);
    }
  };

  const handleDownloadInvoice = () => {
    if (onDownloadInvoice) {
      onDownloadInvoice(order.id);
    }
  };

  const handleContactSupport = () => {
    if (onContactSupport) {
      onContactSupport(order.id);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Primary Actions */}
          {canReorderItem && onReorder && (
            <Button onClick={handleReorder} className="flex-1 sm:flex-none">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reorder
            </Button>
          )}

          {canCancel && onCancel && (
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <X className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Order</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel order {order.order_number}? 
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cancel-reason">Reason for cancellation (optional)</Label>
                    <Textarea
                      id="cancel-reason"
                      placeholder="Please let us know why you're cancelling this order..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCancelDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Keep Order
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Cancelling...' : 'Cancel Order'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {canReturn && onReturn && (
            <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Package className="h-4 w-4 mr-2" />
                  Return Order
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Return Order</DialogTitle>
                  <DialogDescription>
                    Request a return for order {order.order_number}. 
                    Our team will review your request and provide return instructions.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="return-reason">Reason for return *</Label>
                    <Textarea
                      id="return-reason"
                      placeholder="Please describe the reason for your return..."
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setReturnDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReturn}
                    disabled={isLoading || !returnReason.trim()}
                  >
                    {isLoading ? 'Submitting...' : 'Submit Return Request'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Secondary Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onDownloadInvoice && (
                <DropdownMenuItem onClick={handleDownloadInvoice}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </DropdownMenuItem>
              )}
              
              {order.status === 'shipped' && (
                <DropdownMenuItem>
                  <Truck className="h-4 w-4 mr-2" />
                  Track Package
                </DropdownMenuItem>
              )}
              
              {onContactSupport && (
                <DropdownMenuItem onClick={handleContactSupport}>
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Support
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem>
                <MessageSquare className="h-4 w-4 mr-2" />
                Report Issue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status-specific actions */}
        {order.status === 'shipped' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Your order is on its way! Track your package for real-time updates.
              </span>
            </div>
          </div>
        )}

        {order.status === 'delivered' && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Order delivered! How was your experience?
                </span>
              </div>
              <Button size="sm" variant="outline">
                Leave Review
              </Button>
            </div>
          </div>
        )}

        {(order.status === 'cancelled' || order.status === 'returned') && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">
                {order.status === 'cancelled' 
                  ? 'Order cancelled. Refund processed within 3-5 business days.'
                  : 'Return processed. Refund will be issued once we receive the items.'
                }
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface QuickActionsProps {
  order: Order;
  onReorder?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  className?: string;
}

export function QuickActions({ order, onReorder, onCancel, className }: QuickActionsProps) {
  const canCancel = canCancelOrder(order.status);
  const canReorderItem = canReorderOrder(order.status);

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {canReorderItem && onReorder && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onReorder(order.id)}
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reorder
        </Button>
      )}
      
      {canCancel && onCancel && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCancel(order.id)}
          className="text-red-600 hover:text-red-700"
        >
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      )}
    </div>
  );
}
