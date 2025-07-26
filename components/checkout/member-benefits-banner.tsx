'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Gift, Clock, Shield } from 'lucide-react';

interface MemberBenefitsBannerProps {
  onCreateAccount?: () => void;
  className?: string;
}

export function MemberBenefitsBanner({ onCreateAccount, className }: MemberBenefitsBannerProps) {
  const quickBenefits = [
    {
      icon: <Clock className="h-4 w-4" />,
      text: 'Express checkout',
    },
    {
      icon: <Gift className="h-4 w-4" />,
      text: 'Member pricing',
    },
    {
      icon: <Star className="h-4 w-4" />,
      text: 'Order tracking',
    },
    {
      icon: <Shield className="h-4 w-4" />,
      text: 'Purchase protection',
    },
  ];

  return (
    <div
      className={`rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Member Benefits
            </Badge>
            <span className="text-sm font-medium text-gray-700">
              Join thousands of happy customers
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {quickBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-1">
                <span className="text-blue-600">{benefit.icon}</span>
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        {onCreateAccount && (
          <div className="ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateAccount}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Create Account
            </Button>
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        ✨ Free to join • No membership fees • Instant benefits
      </div>
    </div>
  );
}
