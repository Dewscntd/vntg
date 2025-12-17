'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ShoppingCart, Eye, Loader2 } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LazyImage } from '@/components/ui/lazy-image';
import { ProductPrice } from '@/components/products/product-price';
import { ProductBadge } from '@/components/products/product-badge';
import { FavoriteButton } from '@/components/products/favorite-button';
import { useProduct } from '@/lib/hooks';
import { useCartActions } from '@/lib/hooks/use-cart-actions';
import { useGSAP } from '@/lib/hooks/use-gsap';
import { cn } from '@/lib/utils';

export interface QuickViewModalProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ productId, isOpen, onClose }: QuickViewModalProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Fetch product data
  const {
    data: product,
    isLoading,
    error,
  } = useProduct(productId || '', {
    enabled: !!productId && isOpen,
  });

  // Add to cart functionality
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCartWithToast } = useCartActions();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedQuantity(1);
      setSelectedVariants({});
    }
  }, [isOpen, productId]);

  // GSAP animation for modal content
  useGSAP(
    ({ timeline }) => {
      if (isOpen && product) {
        timeline
          .fromTo(
            '[data-modal-image]',
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
          )
          .fromTo(
            '[data-modal-content]',
            { opacity: 0, x: 30 },
            { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' },
            '-=0.2'
          )
          .fromTo(
            '[data-modal-actions]',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
            '-=0.1'
          );
      }
    },
    [isOpen, product]
  );

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      await addToCartWithToast(product.id, product.name, selectedQuantity);
      onClose(); // Close modal after successful add to cart
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = selectedQuantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.inventory_count || 1)) {
      setSelectedQuantity(newQuantity);
    }
  };

  // Mock variants data (this would come from a variants table in a real app)
  const mockVariants = product
    ? [
        {
          type: 'size',
          label: 'Size',
          variants: [
            { id: 'sm', value: 'Small', available: true },
            { id: 'md', value: 'Medium', available: true },
            { id: 'lg', value: 'Large', available: true },
            { id: 'xl', value: 'X-Large', available: false },
          ],
        },
        {
          type: 'color',
          label: 'Color',
          variants: [
            { id: 'black', value: 'Black', available: true, meta: { color: '#000000' } },
            { id: 'white', value: 'White', available: true, meta: { color: '#FFFFFF' } },
            { id: 'blue', value: 'Blue', available: true, meta: { color: '#3B82F6' } },
          ],
        },
      ]
    : [];

  const isOutOfStock = product && product.inventory_count <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Quick View</DialogTitle>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-muted-foreground">Loading product...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-12 text-center">
            <p className="font-medium text-destructive">Failed to load product</p>
            <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        )}

        {/* Product Content */}
        {product && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Product Image */}
            <div data-modal-image className="relative">
              <LazyImage
                src={product.image_url}
                alt={product.name}
                fill
                className="rounded-lg"
                priority
              />

              {/* Product Badges */}
              <div className="absolute left-3 top-3 flex flex-col gap-2">
                {product.is_featured && <ProductBadge type="featured" />}
                {product.is_new && <ProductBadge type="new" />}
                {product.is_sale && <ProductBadge type="sale" value={product.discount_percent} />}
                {isOutOfStock && <ProductBadge type="out-of-stock" />}
              </div>
            </div>

            {/* Product Information */}
            <div data-modal-content className="space-y-4">
              {/* Category */}
              {product.category && (
                <Badge variant="secondary" className="text-xs">
                  {product.category.name}
                </Badge>
              )}

              {/* Product Name */}
              <h2 className="text-2xl font-bold">{product.name}</h2>

              {/* Price */}
              <div>
                <ProductPrice
                  price={product.price}
                  discount_percent={product.discount_percent}
                  className="text-xl"
                />
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground">{product.description}</p>
              )}

              {/* Variants */}
              {mockVariants.map((variantGroup) => (
                <div key={variantGroup.type} className="space-y-2">
                  <label className="text-sm font-medium">{variantGroup.label}</label>
                  <div className="flex flex-wrap gap-2">
                    {variantGroup.variants.map((variant) => (
                      <Button
                        key={variant.id}
                        variant={
                          selectedVariants[variantGroup.type] === variant.id ? 'default' : 'outline'
                        }
                        size="sm"
                        disabled={!variant.available}
                        onClick={() =>
                          setSelectedVariants((prev) => ({
                            ...prev,
                            [variantGroup.type]: variant.id,
                          }))
                        }
                        className={cn(
                          variantGroup.type === 'color' && 'h-8 w-8 rounded-full p-0',
                          !variant.available && 'cursor-not-allowed opacity-50'
                        )}
                        style={
                          variantGroup.type === 'color' && 'meta' in variant && variant.meta?.color
                            ? { backgroundColor: variant.meta.color }
                            : undefined
                        }
                      >
                        {variantGroup.type === 'color' ? (
                          <span className="sr-only">{variant.value}</span>
                        ) : (
                          variant.value
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantity and Actions */}
              <div data-modal-actions className="space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium">Quantity:</label>
                  <div className="flex items-center rounded-md border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={selectedQuantity <= 1}
                      className="h-8 w-8 p-0"
                    >
                      -
                    </Button>
                    <span className="min-w-[3rem] px-3 py-1 text-center text-sm font-medium">
                      {selectedQuantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(1)}
                      disabled={selectedQuantity >= (product.inventory_count || 1)}
                      className="h-8 w-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAddingToCart}
                    className="flex-1"
                  >
                    {isAddingToCart ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                      </>
                    )}
                  </Button>

                  <FavoriteButton
                    productId={product.id}
                    productName={product.name}
                    size="md"
                  />

                  <Button variant="outline" asChild>
                    <Link href={`/products/${product.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                </div>

                {/* Stock Info */}
                {product.inventory_count > 0 && product.inventory_count <= 10 && (
                  <p className="text-sm text-orange-600">
                    Only {product.inventory_count} left in stock!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Hook for managing quick view state
export function useQuickView() {
  const [isOpen, setIsOpen] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  const openQuickView = (id: string) => {
    setProductId(id);
    setIsOpen(true);
  };

  const closeQuickView = () => {
    setIsOpen(false);
    // Delay clearing productId to allow for exit animation
    setTimeout(() => setProductId(null), 300);
  };

  return {
    isOpen,
    productId,
    openQuickView,
    closeQuickView,
  };
}
