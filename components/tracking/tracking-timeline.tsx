'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle, Clock, AlertCircle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingEvent {
  timestamp: string;
  status: string;
  description: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus: string;
  className?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600 bg-yellow-100',
    label: 'Pending',
  },
  in_transit: {
    icon: Truck,
    color: 'text-blue-600 bg-blue-100',
    label: 'In Transit',
  },
  delivered: {
    icon: CheckCircle,
    color: 'text-green-600 bg-green-100',
    label: 'Delivered',
  },
  exception: {
    icon: AlertCircle,
    color: 'text-red-600 bg-red-100',
    label: 'Exception',
  },
  returned: {
    icon: Package,
    color: 'text-gray-600 bg-gray-100',
    label: 'Returned',
  },
};

export function TrackingTimeline({ events, currentStatus, className }: TrackingTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return { Icon, color: config.color };
  };

  const formatLocation = (event: TrackingEvent) => {
    const parts = [event.location, event.city, event.state, event.country].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Tracking Timeline</span>
          <Badge
            variant="secondary"
            className={statusConfig[currentStatus as keyof typeof statusConfig]?.color}
          >
            {statusConfig[currentStatus as keyof typeof statusConfig]?.label || currentStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute bottom-0 left-6 top-0 w-0.5 bg-gray-200"></div>

          <div className="space-y-6">
            {sortedEvents.map((event, index) => {
              const { Icon, color } = getStatusIcon(event.status);
              const { date, time } = formatDate(event.timestamp);
              const location = formatLocation(event);
              const isLatest = index === 0;

              return (
                <div
                  key={`${event.timestamp}-${event.status}`}
                  className="relative flex items-start space-x-4"
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white shadow-sm',
                      color,
                      isLatest && 'ring-2 ring-blue-500 ring-offset-2'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Event content */}
                  <div className="min-w-0 flex-1 pb-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{event.description}</h4>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{date}</p>
                        <p className="text-xs text-gray-500">{time}</p>
                      </div>
                    </div>

                    {location && (
                      <div className="mt-1 flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-600">{location}</p>
                      </div>
                    )}

                    <Badge variant="outline" className="mt-2 text-xs">
                      {event.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {sortedEvents.length === 0 && (
          <div className="py-8 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No tracking events</h3>
            <p className="text-gray-600">
              Tracking information will appear here once the package is shipped.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TrackingProgressProps {
  status: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  className?: string;
}

export function TrackingProgress({
  status,
  estimatedDelivery,
  actualDelivery,
  className,
}: TrackingProgressProps) {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'in_transit', label: 'In Transit', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const getCurrentStep = () => {
    switch (status) {
      case 'pending':
        return 0;
      case 'in_transit':
        return 1;
      case 'delivered':
        return 2;
      case 'exception':
        return 1; // Show as in transit with exception
      default:
        return 0;
    }
  };

  const currentStep = getCurrentStep();
  const isException = status === 'exception';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Delivery Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.key} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                      {
                        'border-green-600 bg-green-600 text-white': isCompleted,
                        'border-blue-600 bg-blue-600 text-white': isCurrent && !isException,
                        'border-red-600 bg-red-600 text-white': isCurrent && isException,
                        'border-gray-300 bg-gray-100 text-gray-400': !isCompleted && !isCurrent,
                      }
                    )}
                  >
                    <StepIcon className="h-5 w-5" />
                  </div>

                  <div className="mt-2 text-center">
                    <p
                      className={cn('text-sm font-medium', {
                        'text-green-600': isCompleted,
                        'text-blue-600': isCurrent && !isException,
                        'text-red-600': isCurrent && isException,
                        'text-gray-500': !isCompleted && !isCurrent,
                      })}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>

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

        {/* Delivery information */}
        <div className="space-y-2">
          {estimatedDelivery && !actualDelivery && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estimated Delivery:</span>
              <span className="font-medium">
                {new Date(estimatedDelivery).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}

          {actualDelivery && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivered:</span>
              <span className="font-medium text-green-600">
                {new Date(actualDelivery).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}

          {isException && (
            <div className="mt-4 rounded-lg bg-red-50 p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">
                  There's an issue with your delivery. Please contact customer support.
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
