'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { ProductImageGallery } from '@/components/products/product-image-gallery';
import { ProductInformation } from '@/components/products/detail/product-information';
import { ProductVariants } from '@/components/products/detail/product-variants';
import { ProductReviews } from '@/components/products/detail/product-reviews';
import { RelatedProducts } from '@/components/products/related-products';
import { ProductDetailSkeleton } from '@/components/products/skeletons/product-detail-skeleton';
import { Breadcrumb, generateProductBreadcrumbs } from '@/components/navigation';
import { useProduct } from '@/lib/hooks';
import { Button } from '@/components/ui/button';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  // Initialize selected variants with default values (must be at top level)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({
    size: '',
    color: '',
    material: '',
    style: '',
  });

  const { data: product, isLoading, error, refetch } = useProduct(productId);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="font-medium text-destructive">Failed to load product</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          <div className="mt-4 space-x-2">
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
            <Button asChild>
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-12 text-center">
          <h2 className="text-2xl font-bold">Product not found</h2>
          <p className="mt-2 text-muted-foreground">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild className="mt-4">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Mock images for the gallery (since we only have one image_url in the schema)
  const images = product.image_url
    ? [
        {
          id: '1',
          src: product.image_url,
          alt: product.name,
          isMain: true,
          thumbnail: product.image_url,
          width: 800,
          height: 800,
        },
      ]
    : [];

  // Mock variants data (this would come from a variants table in a real app)
  const mockVariantGroups = [
    {
      type: 'size' as const,
      name: 'Size',
      variants: [
        {
          id: 'sm',
          name: 'Small',
          type: 'size' as const,
          value: 'Small',
          available: true,
        },
        {
          id: 'md',
          name: 'Medium',
          type: 'size' as const,
          value: 'Medium',
          available: true,
        },
        {
          id: 'lg',
          name: 'Large',
          type: 'size' as const,
          value: 'Large',
          available: true,
        },
        {
          id: 'xl',
          name: 'X-Large',
          type: 'size' as const,
          value: 'X-Large',
          available: false,
        },
      ],
    },
    {
      type: 'color' as const,
      name: 'Color',
      variants: [
        {
          id: 'black',
          name: 'Black',
          type: 'color' as const,
          value: 'Black',
          available: true,
          meta: { color: '#000000' },
        },
        {
          id: 'white',
          name: 'White',
          type: 'color' as const,
          value: 'White',
          available: true,
          meta: { color: '#FFFFFF' },
        },
        {
          id: 'blue',
          name: 'Blue',
          type: 'color' as const,
          value: 'Blue',
          available: true,
          meta: { color: '#3B82F6' },
        },
      ],
    },
  ];

  const breadcrumbItems = generateProductBreadcrumbs(
    product.name,
    product.category?.name,
    product.category?.id
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Product Details */}
      <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Product Images */}
        <div>
          <ProductImageGallery
            images={images}
            productName={product.name}
            layout="standard"
            showBadges={true}
            showActions={true}
          />
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <ProductInformation product={product} />

          {/* Product Variants */}
          <ProductVariants
            variantGroups={mockVariantGroups}
            selectedVariants={selectedVariants}
            onChange={(type, variantId) => {
              setSelectedVariants((prev) => ({
                ...prev,
                [type]: variantId,
              }));
              console.log('Variant selected:', type, variantId);
            }}
          />
        </div>
      </div>

      {/* Product Reviews */}
      <div className="mb-16">
        <ProductReviews
          productId={productId}
          reviews={[]}
          averageRating={0}
          totalReviews={0}
          ratingCounts={{ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }}
        />
      </div>

      {/* Related Products */}
      <div>
        <RelatedProducts productId={productId} categoryId={product.category?.id} />
      </div>
    </div>
  );
}
