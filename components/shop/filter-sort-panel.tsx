/**
 * Filter and Sort Panel Component
 *
 * Comprehensive filtering UI with:
 * - Sort options
 * - Price range slider
 * - Multi-select filters (size, color, etc.)
 * - Responsive drawer on mobile, sidebar on desktop
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ProductFilters, SortOption } from '@/types/shop';
import { useShopFilters } from '@/lib/hooks/use-shop-state';

interface FilterSortPanelProps {
  className?: string;
  variant?: 'sidebar' | 'modal';
}

const SORT_OPTIONS: { value: SortOption; key: string }[] = [
  { value: 'newest', key: 'newest' },
  { value: 'price-asc', key: 'priceLowHigh' },
  { value: 'price-desc', key: 'priceHighLow' },
  { value: 'name-asc', key: 'nameAZ' },
  { value: 'name-desc', key: 'nameZA' },
];

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLOR_OPTIONS = ['black', 'white', 'gray', 'blue', 'red', 'green'];

export function FilterSortPanel({ className, variant = 'sidebar' }: FilterSortPanelProps) {
  const t = useTranslations('shop.filters');
  const tColors = useTranslations('shop.colors');
  const { filters, sort, updateFilters, updateSort, clearFilters } = useShopFilters();
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceMin ?? 0,
    filters.priceMax ?? 1000,
  ]);

  const activeFilterCount = Object.keys(filters).filter((key) => {
    const value = filters[key as keyof ProductFilters];
    return value !== undefined && value !== null;
  }).length;

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const handlePriceCommit = () => {
    updateFilters({
      priceMin: priceRange[0],
      priceMax: priceRange[1],
    });
  };

  const toggleSize = (size: string) => {
    const current = filters.sizes ?? [];
    const updated = current.includes(size) ? current.filter((s) => s !== size) : [...current, size];
    updateFilters({ sizes: updated.length > 0 ? updated : undefined });
  };

  const toggleColor = (color: string) => {
    const current = filters.colors ?? [];
    const updated = current.includes(color)
      ? current.filter((c) => c !== color)
      : [...current, color];
    updateFilters({ colors: updated.length > 0 ? updated : undefined });
  };

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Sort */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider">{t('sort')}</h3>
        <div className="space-y-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => updateSort(option.value)}
              className={cn(
                'flex w-full items-center rounded-sm px-3 py-2 text-sm transition-colors',
                sort === option.value ? 'bg-foreground text-background' : 'hover:bg-muted'
              )}
            >
              <div
                className={cn(
                  'me-2 flex h-4 w-4 items-center justify-center rounded-full border',
                  sort === option.value ? 'border-background' : 'border-foreground'
                )}
              >
                {sort === option.value && <div className="h-2 w-2 rounded-full bg-background" />}
              </div>
              {t(option.key)}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider">{t('priceRange')}</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            onValueCommit={handlePriceCommit}
            min={0}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>₪{priceRange[0]}</span>
            <span>₪{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider">{t('size')}</h3>
        <div className="grid grid-cols-3 gap-2">
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                'rounded-sm border py-2 text-sm transition-colors',
                filters.sizes?.includes(size)
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider">{t('color')}</h3>
        <div className="space-y-2">
          {COLOR_OPTIONS.map((color) => (
            <div key={color} className="flex items-center space-x-2">
              <Checkbox
                id={`color-${color}`}
                checked={filters.colors?.includes(color) ?? false}
                onCheckedChange={() => toggleColor(color)}
              />
              <Label
                htmlFor={`color-${color}`}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {tColors(color)}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider">{t('availability')}</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStock ?? false}
            onCheckedChange={(checked) => updateFilters({ inStock: checked ? true : undefined })}
          />
          <Label
            htmlFor="in-stock"
            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('inStock')}
          </Label>
        </div>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          {t('clearFilters')} ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  if (variant === 'modal') {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className={className}>
            <SlidersHorizontal className="me-2 h-4 w-4" />
            {t('filters')}
            {activeFilterCount > 0 && (
              <span className="ms-2 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs text-background">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] overflow-y-auto sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="text-sm font-medium uppercase tracking-wider">
              {t('filters')}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-8">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className={cn('space-y-8', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider">{t('filters')}</h2>
        {activeFilterCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs text-background">
            {activeFilterCount}
          </span>
        )}
      </div>
      <FilterContent />
    </aside>
  );
}
