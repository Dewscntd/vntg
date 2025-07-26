'use client';

import { cn } from '@/lib/utils';

export interface ProductPriceProps {
  price: number;
  discount_percent?: number;
  original_price?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProductPrice({
  price,
  discount_percent,
  original_price,
  className,
  size = 'md',
}: ProductPriceProps) {
  // Calculate the sale price if there's a discount percentage
  const hasDiscount = !!discount_percent && discount_percent > 0;
  const salePrice = hasDiscount ? price - price * (discount_percent / 100) : price;

  // Use the original price if provided, otherwise calculate it from the discount
  const displayOriginalPrice = original_price || (hasDiscount ? price : undefined);

  // Format prices as Israeli Shekels
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-medium', sizeClasses[size])}>{formatPrice(salePrice)}</span>

      {displayOriginalPrice && displayOriginalPrice !== salePrice && (
        <span className="text-sm text-muted-foreground line-through">
          {formatPrice(displayOriginalPrice)}
        </span>
      )}

      {hasDiscount && (
        <span className="text-xs font-medium text-red-500">{discount_percent}% הנחה</span>
      )}
    </div>
  );
}
