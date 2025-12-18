/**
 * Collection Product Manager Component
 *
 * Manages products within a collection with ordering capability.
 * Features:
 * - Add products from catalog
 * - Remove products from collection
 * - Reorder products with move up/down buttons
 * - Search and filter available products
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  X,
  Plus,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Package,
  Trash2,
  Loader2,
} from 'lucide-react';
import { CollectionProductWithDetails } from '@/types/collections';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  inventory_count: number;
  is_featured: boolean;
}

interface CollectionProductManagerProps {
  collectionId: string;
  products: CollectionProductWithDetails[];
  onProductsChange: (products: CollectionProductWithDetails[]) => void;
  onSaveOrder: (order: { product_id: string; display_order: number }[]) => Promise<void>;
  onAddProducts: (productIds: string[]) => Promise<void>;
  onRemoveProduct: (productId: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function CollectionProductManager({
  collectionId,
  products,
  onProductsChange,
  onSaveOrder,
  onAddProducts,
  onRemoveProduct,
  isLoading = false,
  className,
}: CollectionProductManagerProps) {
  const [isAddingProducts, setIsAddingProducts] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Product IDs currently in collection
  const collectionProductIds = useMemo(
    () => new Set(products.map((p) => p.product_id)),
    [products]
  );

  // Fetch available products when sheet opens
  useEffect(() => {
    if (isAddingProducts) {
      fetchAvailableProducts();
    }
  }, [isAddingProducts]);

  const fetchAvailableProducts = async () => {
    setIsFetchingProducts(true);
    try {
      const response = await fetch('/api/products?limit=100');
      const result = await response.json();

      if (result.status === 'success' && result.data?.products) {
        setAvailableProducts(
          result.data.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image_url: p.image_url,
            inventory_count: p.inventory_count,
            is_featured: p.is_featured,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsFetchingProducts(false);
    }
  };

  // Filter available products
  const filteredAvailableProducts = useMemo(() => {
    let filtered = availableProducts.filter((p) => !collectionProductIds.has(p.id));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query));
    }

    return filtered;
  }, [availableProducts, collectionProductIds, searchQuery]);

  // Move product up in order
  const moveUp = useCallback(
    (index: number) => {
      if (index === 0) return;

      const newProducts = [...products];
      [newProducts[index - 1], newProducts[index]] = [newProducts[index], newProducts[index - 1]];

      // Update display_order
      newProducts.forEach((p, i) => {
        p.display_order = i;
      });

      onProductsChange(newProducts);
      setHasUnsavedChanges(true);
    },
    [products, onProductsChange]
  );

  // Move product down in order
  const moveDown = useCallback(
    (index: number) => {
      if (index === products.length - 1) return;

      const newProducts = [...products];
      [newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]];

      // Update display_order
      newProducts.forEach((p, i) => {
        p.display_order = i;
      });

      onProductsChange(newProducts);
      setHasUnsavedChanges(true);
    },
    [products, onProductsChange]
  );

  // Save order changes
  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
      await onSaveOrder(
        products.map((p, index) => ({
          product_id: p.product_id,
          display_order: index,
        }))
      );
      setHasUnsavedChanges(false);
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Add selected products
  const handleAddSelectedProducts = async () => {
    if (selectedProductIds.length === 0) return;

    try {
      await onAddProducts(selectedProductIds);
      setSelectedProductIds([]);
      setIsAddingProducts(false);
    } catch (error) {
      console.error('Failed to add products:', error);
    }
  };

  // Remove product from collection
  const handleRemoveProduct = async (productId: string) => {
    if (confirm('Remove this product from the collection?')) {
      await onRemoveProduct(productId);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">
            {products.length} Product{products.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Button
              size="sm"
              onClick={handleSaveOrder}
              disabled={isSavingOrder}
            >
              {isSavingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Order'
              )}
            </Button>
          )}

          <Sheet open={isAddingProducts} onOpenChange={setIsAddingProducts}>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Products
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Add Products to Collection</SheetTitle>
                <SheetDescription>
                  Select products to add to this collection
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Selection Summary */}
                {selectedProductIds.length > 0 && (
                  <div className="flex items-center justify-between rounded-md bg-primary/10 px-3 py-2 text-sm">
                    <span>{selectedProductIds.length} selected</span>
                    <Button
                      size="sm"
                      onClick={handleAddSelectedProducts}
                      disabled={isLoading}
                    >
                      Add Selected
                    </Button>
                  </div>
                )}

                {/* Product List */}
                <ScrollArea className="h-[400px]">
                  {isFetchingProducts ? (
                    <div className="flex h-32 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredAvailableProducts.length === 0 ? (
                    <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                      {searchQuery
                        ? 'No products match your search'
                        : 'All products are already in this collection'}
                    </div>
                  ) : (
                    <div className="space-y-2 pr-4">
                      {filteredAvailableProducts.map((product) => (
                        <label
                          key={product.id}
                          className={cn(
                            'flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50',
                            selectedProductIds.includes(product.id) &&
                              'border-primary bg-primary/5'
                          )}
                        >
                          <Checkbox
                            checked={selectedProductIds.includes(product.id)}
                            onCheckedChange={() => toggleProductSelection(product.id)}
                            className="mt-1"
                          />
                          <div className="flex flex-1 gap-3">
                            {product.image_url && (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-12 w-12 rounded object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {product.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ${(product.price / 100).toFixed(2)} &middot;{' '}
                                {product.inventory_count} in stock
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2 text-sm text-yellow-800">
          You have unsaved order changes. Click &quot;Save Order&quot; to persist them.
        </div>
      )}

      {/* Product List */}
      {products.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          No products in this collection yet
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-md border bg-background p-3"
            >
              {/* Order Controls */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0 || isLoading}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === products.length - 1 || isLoading}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Drag Handle (visual indicator) */}
              <GripVertical className="h-5 w-5 text-muted-foreground/50" />

              {/* Order Number */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {index + 1}
              </div>

              {/* Product Image */}
              {item.product.image_url ? (
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="h-12 w-12 rounded object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{item.product.name}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>${(item.product.price / 100).toFixed(2)}</span>
                  {item.product.inventory_count <= 0 && (
                    <Badge variant="destructive" className="text-xs">
                      Out of stock
                    </Badge>
                  )}
                  {item.product.is_featured && (
                    <Badge variant="secondary" className="text-xs">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveProduct(item.product_id)}
                disabled={isLoading}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
