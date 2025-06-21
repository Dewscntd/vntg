'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface ProductSortingProps {
  className?: string;
  onSortChange?: (sortBy: string, sortDirection: string) => void;
}

export type SortOption = {
  value: string;
  label: string;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
};

const sortOptions: SortOption[] = [
  {
    value: 'newest',
    label: 'Newest First',
    orderBy: 'created_at',
    orderDirection: 'desc',
  },
  {
    value: 'oldest',
    label: 'Oldest First',
    orderBy: 'created_at',
    orderDirection: 'asc',
  },
  {
    value: 'price_low_high',
    label: 'Price: Low to High',
    orderBy: 'price',
    orderDirection: 'asc',
  },
  {
    value: 'price_high_low',
    label: 'Price: High to Low',
    orderBy: 'price',
    orderDirection: 'desc',
  },
  {
    value: 'name_a_z',
    label: 'Name: A to Z',
    orderBy: 'name',
    orderDirection: 'asc',
  },
  {
    value: 'name_z_a',
    label: 'Name: Z to A',
    orderBy: 'name',
    orderDirection: 'desc',
  },
  {
    value: 'updated',
    label: 'Recently Updated',
    orderBy: 'updated_at',
    orderDirection: 'desc',
  },
];

export function ProductSorting({ className, onSortChange }: ProductSortingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current sort from URL params
  const currentOrderBy = searchParams.get('orderBy') || 'created_at';
  const currentOrderDirection = searchParams.get('orderDirection') || 'desc';
  
  // Find current sort option
  const currentSortOption = sortOptions.find(
    option => option.orderBy === currentOrderBy && option.orderDirection === currentOrderDirection
  );
  
  const currentSortValue = currentSortOption?.value || 'newest';

  const handleSortChange = (value: string) => {
    const selectedOption = sortOptions.find(option => option.value === value);
    
    if (!selectedOption) return;

    const params = new URLSearchParams(searchParams);
    params.set('orderBy', selectedOption.orderBy);
    params.set('orderDirection', selectedOption.orderDirection);
    
    // Reset to first page when sorting changes
    params.delete('offset');
    
    router.push(`${window.location.pathname}?${params.toString()}`);
    
    if (onSortChange) {
      onSortChange(selectedOption.orderBy, selectedOption.orderDirection);
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">Sort by:</span>
      <Select value={currentSortValue} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
