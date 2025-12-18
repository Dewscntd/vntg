/**
 * Product Picker Component
 *
 * Reusable product selection interface for admin features.
 * Features:
 * - Multi-select with checkboxes
 * - Search and filter
 * - Preview of selected products
 * - Compact list view optimized for selection
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, X, Package } from 'lucide-react';
import { ShopProduct } from '@/types/shop';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductPickerProps {
  selectedProductIds: string[];
  onSelectionChange: (productIds: string[]) => void;
  className?: string;
  maxSelection?: number;
}

export function ProductPicker({
  selectedProductIds,
  onSelectionChange,
  className,
  maxSelection,
}: ProductPickerProps) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all products
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/products?limit=100');
        const result = await response.json();

        if (result.status === 'success' && result.data?.products) {
          setProducts(result.data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.material?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Get selected products for preview
  const selectedProducts = useMemo(() => {
    return products.filter((p) => selectedProductIds.includes(p.id));
  }, [products, selectedProductIds]);

  // Toggle product selection
  const toggleProduct = (productId: string) => {
    const isSelected = selectedProductIds.includes(productId);

    if (isSelected) {
      // Remove from selection
      onSelectionChange(selectedProductIds.filter((id) => id !== productId));
    } else {
      // Add to selection if not at max
      if (!maxSelection || selectedProductIds.length < maxSelection) {
        onSelectionChange([...selectedProductIds, productId]);
      }
    }
  };

  // Clear all selections
  const clearSelection = () => {
    onSelectionChange([]);
  };

  // Select all visible products
  const selectAllVisible = () => {
    const visibleIds = filteredProducts.map((p) => p.id);
    const newSelection = Array.from(new Set([...selectedProductIds, ...visibleIds]));

    if (maxSelection) {
      onSelectionChange(newSelection.slice(0, maxSelection));
    } else {
      onSelectionChange(newSelection);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex h-64 items-center justify-center rounded-md border border-border">
          <p className="text-sm text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Actions */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAllVisible}
            disabled={filteredProducts.length === 0}
          >
            Select All
          </Button>
        </div>

        {/* Selection Summary */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {selectedProductIds.length} product{selectedProductIds.length !== 1 ? 's' : ''} selected
            {maxSelection && ` (max ${maxSelection})`}
          </span>
          {selectedProductIds.length > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Selected Products Preview */}
      {selectedProducts.length > 0 && (
        <div className="rounded-md border border-border bg-muted/30 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Package className="h-4 w-4" />
            Selected Products
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedProducts.map((product) => (
              <Badge key={product.id} variant="secondary" className="gap-1">
                {product.name}
                <button
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Product List */}
      <ScrollArea className="h-[400px] rounded-md border border-border">
        <div className="space-y-2 p-4">
          {filteredProducts.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              {searchQuery ? 'No products match your search' : 'No products available'}
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isSelected = selectedProductIds.includes(product.id);
              const isDisabled =
                !isSelected && !!maxSelection && selectedProductIds.length >= maxSelection;

              return (
                <label
                  key={product.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted/50',
                    isSelected && 'border-primary bg-primary/5',
                    isDisabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => {
                      if (!isDisabled) {
                        toggleProduct(product.id);
                      }
                    }}
                    disabled={isDisabled}
                    className="mt-1"
                  />

                  <div className="flex flex-1 gap-3">
                    {/* Product Image */}
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-16 w-16 rounded object-cover"
                      />
                    )}

                    {/* Product Details */}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{product.name}</div>
                      <div className="line-clamp-2 text-xs text-muted-foreground">
                        {product.description}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.gender && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {product.gender}
                          </Badge>
                        )}
                        {product.is_new && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                        {product.is_sale && (
                          <Badge variant="destructive" className="text-xs">
                            Sale
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
