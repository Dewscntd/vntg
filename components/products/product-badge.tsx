'use client';

import { cn } from '@/lib/utils';

export type BadgeType = 'new' | 'sale' | 'out-of-stock' | 'featured';

export interface ProductBadgeProps {
  type: BadgeType;
  value?: number; // For sale badges to show discount percentage
  className?: string;
}

export function ProductBadge({ type, value, className }: ProductBadgeProps) {
  const badgeStyles = {
    new: 'bg-blue-500 text-white',
    sale: 'bg-red-500 text-white',
    'out-of-stock': 'bg-gray-500 text-white',
    featured: 'bg-amber-500 text-white',
  };

  const badgeText = {
    new: 'New',
    sale: value ? `${value}% Off` : 'Sale',
    'out-of-stock': 'Out of Stock',
    featured: 'Featured',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
        badgeStyles[type],
        className
      )}
    >
      {badgeText[type]}
    </div>
  );
}
