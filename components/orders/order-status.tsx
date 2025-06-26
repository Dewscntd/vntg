'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Package, Truck, CheckCircle, X, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

interface OrderStatusProps {
  status: OrderStatus;
  showIcon?: boolean;
  showTracker?: boolean;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    description: 'Order received and being processed',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    step: 0,
  },
  processing: {
    label: 'Processing',
    description: 'Order is being prepared for shipment',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Package,
    step: 1,
  },
  shipped: {
    label: 'Shipped',
    description: 'Order has been shipped and is on its way',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Truck,
    step: 2,
  },
  delivered: {
    label: 'Delivered',
    description: 'Order has been successfully delivered',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    step: 3,
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Order has been cancelled',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: X,
    step: -1,
  },
  returned: {
    label: 'Returned',
    description: 'Order has been returned',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: RotateCcw,
    step: -1,
  },
};

const trackingSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export function OrderStatus({
  status,
  showIcon = true,
  showTracker = false,
  className,
}: OrderStatusProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  if (showTracker && status !== 'cancelled' && status !== 'returned') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center space-x-2">
          {showIcon && <StatusIcon className="h-5 w-5" />}
          <Badge className={config.color}>{config.label}</Badge>
        </div>

        <OrderTracker currentStatus={status} />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {showIcon && <StatusIcon className="h-5 w-5" />}
      <Badge className={config.color}>{config.label}</Badge>
    </div>
  );
}

interface OrderTrackerProps {
  currentStatus: OrderStatus;
  className?: string;
}

export function OrderTracker({ currentStatus, className }: OrderTrackerProps) {
  const currentStep = statusConfig[currentStatus]?.step ?? 0;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {trackingSteps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index <= currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === trackingSteps.length - 1;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                    {
                      'border-green-600 bg-green-600 text-white': isCompleted,
                      'border-blue-600 bg-blue-600 text-white': isCurrent && !isCompleted,
                      'border-gray-300 bg-gray-100 text-gray-400': !isCompleted && !isCurrent,
                    }
                  )}
                >
                  <StepIcon className="h-5 w-5" />
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn('text-sm font-medium', {
                      'text-green-600': isCompleted,
                      'text-blue-600': isCurrent && !isCompleted,
                      'text-gray-500': !isCompleted && !isCurrent,
                    })}
                  >
                    {step.label}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn('mx-4 h-0.5 flex-1 transition-colors', {
                    'bg-green-600': index < currentStep,
                    'bg-gray-300': index >= currentStep,
                  })}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <Badge
      className={cn(config.color, sizeClasses[size], 'flex items-center space-x-1', className)}
    >
      <StatusIcon
        className={cn(size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')}
      />
      <span>{config.label}</span>
    </Badge>
  );
}

export function getStatusDescription(status: OrderStatus): string {
  return statusConfig[status]?.description || '';
}

export function getStatusColor(status: OrderStatus): string {
  return statusConfig[status]?.color || '';
}

export function canCancelOrder(status: OrderStatus): boolean {
  return status === 'pending' || status === 'processing';
}

export function canReturnOrder(status: OrderStatus): boolean {
  return status === 'delivered';
}

export function canReorderOrder(status: OrderStatus): boolean {
  return status === 'delivered' || status === 'cancelled';
}
