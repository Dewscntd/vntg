'use client';

import React from 'react';
import { useCheckout } from '@/lib/context/checkout-context';
import { cn } from '@/lib/utils';
import { Check, ShoppingBag, CreditCard, Eye, CheckCircle } from 'lucide-react';

interface CheckoutLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const steps = [
  {
    id: 0,
    name: 'Shipping',
    description: 'Delivery information',
    icon: ShoppingBag,
  },
  {
    id: 1,
    name: 'Payment',
    description: 'Payment method',
    icon: CreditCard,
  },
  {
    id: 2,
    name: 'Review',
    description: 'Order review',
    icon: Eye,
  },
  {
    id: 3,
    name: 'Confirmation',
    description: 'Order complete',
    icon: CheckCircle,
  },
];

export function CheckoutLayout({ children, className }: CheckoutLayoutProps) {
  const { currentStep } = useCheckout();

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {steps.map((step, stepIdx) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                const isUpcoming = currentStep < step.id;

                return (
                  <li key={step.name} className="flex-1">
                    <div className="flex items-center">
                      {/* Step indicator */}
                      <div className="flex items-center">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full border-2',
                            {
                              'border-green-600 bg-green-600': isCompleted,
                              'border-blue-600 bg-blue-600': isCurrent,
                              'border-gray-300 bg-white': isUpcoming,
                            }
                          )}
                        >
                          {isCompleted ? (
                            <Check className="h-5 w-5 text-white" />
                          ) : (
                            <step.icon
                              className={cn('h-5 w-5', {
                                'text-white': isCurrent,
                                'text-gray-400': isUpcoming,
                              })}
                            />
                          )}
                        </div>
                        <div className="ml-4 min-w-0 flex-1">
                          <p
                            className={cn('text-sm font-medium', {
                              'text-green-600': isCompleted,
                              'text-blue-600': isCurrent,
                              'text-gray-500': isUpcoming,
                            })}
                          >
                            {step.name}
                          </p>
                          <p className="text-sm text-gray-500">{step.description}</p>
                        </div>
                      </div>

                      {/* Connector line */}
                      {stepIdx < steps.length - 1 && (
                        <div
                          className={cn(
                            'ml-4 h-0.5 w-full',
                            {
                              'bg-green-600': currentStep > step.id,
                              'bg-gray-300': currentStep <= step.id,
                            }
                          )}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Checkout form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {children}
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <CheckoutSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

// Checkout sidebar component
function CheckoutSidebar() {
  const { orderSummary } = useCheckout();

  if (!orderSummary) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${orderSummary.subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">${orderSummary.shipping.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">${orderSummary.tax.toFixed(2)}</span>
        </div>
        
        {orderSummary.discount && orderSummary.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="text-green-600">-${orderSummary.discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="border-t pt-3">
          <div className="flex justify-between text-base font-medium">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">${orderSummary.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-xs text-gray-500">
        <p>Shipping and taxes calculated at checkout</p>
      </div>
    </div>
  );
}
