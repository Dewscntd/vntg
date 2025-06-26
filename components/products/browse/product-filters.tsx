'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCategories } from '@/lib/hooks';

export interface ProductFiltersProps {
  className?: string;
  onFiltersChange?: (filters: FilterState) => void;
  showMobileToggle?: boolean;
}

export interface FilterState {
  category_id?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  is_new?: boolean;
  is_sale?: boolean;
  in_stock?: boolean;
}

export function ProductFilters({
  className,
  onFiltersChange,
  showMobileToggle = true,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>({
    category_id: searchParams.get('category') || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    is_featured: searchParams.get('featured') === 'true' || undefined,
    is_new: searchParams.get('new') === 'true' || undefined,
    is_sale: searchParams.get('sale') === 'true' || undefined,
    in_stock: searchParams.get('in_stock') === 'true' || undefined,
  });

  // Price range state
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.min_price || 0,
    filters.max_price || 1000,
  ]);

  // Fetch categories for filter options
  const { data: categoriesData } = useCategories({
    url: '/api/categories?limit=50&orderBy=name&orderDirection=asc',
    cacheKey: 'categories-filter',
  });

  const categories = categoriesData?.categories || [];

  // Update filters when URL params change
  useEffect(() => {
    const newFilters: FilterState = {
      category_id: searchParams.get('category') || undefined,
      min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
      max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      is_featured: searchParams.get('featured') === 'true' || undefined,
      is_new: searchParams.get('new') === 'true' || undefined,
      is_sale: searchParams.get('sale') === 'true' || undefined,
      in_stock: searchParams.get('in_stock') === 'true' || undefined,
    };

    setFilters(newFilters);
    setPriceRange([newFilters.min_price || 0, newFilters.max_price || 1000]);
  }, [searchParams]);

  // Apply filters to URL
  const applyFilters = (newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams.toString());

    // Remove existing filter params
    params.delete('category');
    params.delete('min_price');
    params.delete('max_price');
    params.delete('featured');
    params.delete('new');
    params.delete('sale');
    params.delete('in_stock');

    // Add new filter params
    if (newFilters.category_id) params.set('category', newFilters.category_id);
    if (newFilters.min_price !== undefined)
      params.set('min_price', newFilters.min_price.toString());
    if (newFilters.max_price !== undefined)
      params.set('max_price', newFilters.max_price.toString());
    if (newFilters.is_featured) params.set('featured', 'true');
    if (newFilters.is_new) params.set('new', 'true');
    if (newFilters.is_sale) params.set('sale', 'true');
    if (newFilters.in_stock) params.set('in_stock', 'true');

    router.push(`${window.location.pathname}?${params.toString()}`);

    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  // Handle price range change
  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value);
    const newFilters = {
      ...filters,
      min_price: value[0] > 0 ? value[0] : undefined,
      max_price: value[1] < 1000 ? value[1] : undefined,
    };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters: FilterState = {};
    setFilters(clearedFilters);
    setPriceRange([0, 1000]);
    applyFilters(clearedFilters);
  };

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== false
  ).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Filters</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.category_id && (
              <Badge variant="secondary" className="text-xs">
                Category: {categories.find((c: any) => c.id === filters.category_id)?.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange('category_id', undefined)}
                  className="ml-1 h-auto p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {(filters.min_price || filters.max_price) && (
              <Badge variant="secondary" className="text-xs">
                Price: ${filters.min_price || 0} - ${filters.max_price || 1000}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleFilterChange('min_price', undefined);
                    handleFilterChange('max_price', undefined);
                    setPriceRange([0, 1000]);
                  }}
                  className="ml-1 h-auto p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.is_featured && (
              <Badge variant="secondary" className="text-xs">
                Featured
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange('is_featured', undefined)}
                  className="ml-1 h-auto p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Category</h3>
        <Select
          value={filters.category_id || ''}
          onValueChange={(value) => handleFilterChange('category_id', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category: any) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price Range Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Product Type Filters */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Product Type</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={!!filters.is_featured}
              onCheckedChange={(checked) => handleFilterChange('is_featured', checked || undefined)}
            />
            <label htmlFor="featured" className="text-sm">
              Featured Products
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="new"
              checked={!!filters.is_new}
              onCheckedChange={(checked) => handleFilterChange('is_new', checked || undefined)}
            />
            <label htmlFor="new" className="text-sm">
              New Arrivals
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sale"
              checked={!!filters.is_sale}
              onCheckedChange={(checked) => handleFilterChange('is_sale', checked || undefined)}
            />
            <label htmlFor="sale" className="text-sm">
              On Sale
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in_stock"
              checked={!!filters.in_stock}
              onCheckedChange={(checked) => handleFilterChange('in_stock', checked || undefined)}
            />
            <label htmlFor="in_stock" className="text-sm">
              In Stock Only
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      {showMobileToggle && (
        <div className="lg:hidden">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full justify-between"
          >
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
          </Button>

          {isOpen && (
            <div className="mt-4 rounded-lg border bg-card p-4">
              <FilterContent />
            </div>
          )}
        </div>
      )}

      {/* Desktop Filters */}
      <div className={cn('hidden lg:block', className)}>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Filters</h2>
          {activeFiltersCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
            </p>
          )}
        </div>
        <div className="mt-4">
          <FilterContent />
        </div>
      </div>
    </>
  );
}
