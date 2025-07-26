'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getSizesForCategory } from '@/lib/data/product-options';
import { useTranslations } from '@/lib/hooks/use-translations';

interface SizeSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  category?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export function SizeSelector({
  value,
  onValueChange,
  category = '',
  className,
  required,
  disabled,
}: SizeSelectorProps) {
  const { isHebrew } = useTranslations();
  
  // Get appropriate sizes based on category
  const availableSizes = getSizesForCategory(category);
  
  // Group sizes for better display
  const groupedSizes = {
    kids: availableSizes.filter(s => s.category === 'kids'),
    clothing: availableSizes.filter(s => s.category === 'clothing'),
    pants: availableSizes.filter(s => s.category === 'pants'),
    shoes: availableSizes.filter(s => s.category === 'shoes'),
  };

  const handleSizeSelect = (sizeValue: string) => {
    if (disabled) return;
    onValueChange?.(sizeValue === value ? '' : sizeValue);
  };

  const renderSizeGroup = (sizes: typeof availableSizes, groupName: string) => {
    if (sizes.length === 0) return null;

    return (
      <div key={groupName} className="space-y-2">
        {groupName !== 'clothing' && (
          <Label className="text-xs text-muted-foreground">
            {groupName === 'kids' && (isHebrew ? 'מידות ילדים' : 'Kids')}
            {groupName === 'pants' && (isHebrew ? 'מידות מכנסיים' : 'Pants')}
            {groupName === 'shoes' && (isHebrew ? 'מידות נעליים' : 'Shoes')}
          </Label>
        )}
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Button
              key={size.value}
              type="button"
              variant={value === size.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSizeSelect(size.value)}
              disabled={disabled}
              className={cn(
                'min-w-[2.5rem] h-8 text-xs',
                value === size.value && 'ring-2 ring-primary ring-offset-1'
              )}
            >
              {size.label.split(' / ')[0]} {/* Show first part of label */}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-3', className)}>
      <Label>
        {isHebrew ? 'מידה' : 'Size'}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="space-y-4">
        {Object.entries(groupedSizes).map(([groupName, sizes]) => 
          renderSizeGroup(sizes, groupName)
        )}
      </div>
      
      {value && (
        <div className="text-sm text-muted-foreground">
          {isHebrew ? 'נבחר: ' : 'Selected: '}
          <span className="font-medium">{value}</span>
        </div>
      )}
    </div>
  );
}

export default SizeSelector;