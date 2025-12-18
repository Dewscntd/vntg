'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { ProductImageGallery } from '@/components/products/product-image-gallery';
import { ProductInformation } from '@/components/products/detail/product-information';
import { ProductVariants } from '@/components/products/detail/product-variants';
import { ProductReviews } from '@/components/products/detail/product-reviews';
import { RelatedProducts } from '@/components/products/related-products';
import { ProductDetailSkeleton } from '@/components/products/skeletons/product-detail-skeleton';
import { Breadcrumb, generateShopProductBreadcrumbs } from '@/components/navigation';
import { useProduct } from '@/lib/hooks';
import { Button } from '@/components/ui/button';

// Mapping from clothing_type to translation key (matching shop.categories.{gender}.{key})
const clothingTypeTranslationMap: Record<string, string> = {
  'jackets-coats': 'jackets-coats',
  tops: 'tops',
  pants: 'pants',
  dresses: 'dresses',
  shoes: 'accessories', // Shoes are under accessories category
  sweaters: 'knitwear', // Sweaters mapped to knitwear
  knitwear: 'knitwear',
  shirts: 'shirts',
  't-shirts': 't-shirts',
  skirts: 'skirts',
  accessories: 'accessories',
  denim: 'denim',
  'new-arrivals': 'new-arrivals',
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const t = useTranslations('shop');

  // Initialize selected variants with default values (must be at top level)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({
    size: '',
    color: '',
    material: '',
    style: '',
    condition: '',
    brand: '',
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

  // Create variant groups from product specifications
  const variantGroups = [];

  // Size from specifications
  if (product.specifications?.size) {
    variantGroups.push({
      type: 'size' as const,
      name: 'Size',
      variants: [
        {
          id: 'size',
          name: product.specifications.size,
          type: 'size' as const,
          value: product.specifications.size,
          available: true,
        },
      ],
    });
  }

  // Condition from specifications
  if (product.specifications?.condition) {
    variantGroups.push({
      type: 'condition' as const,
      name: 'Condition',
      variants: [
        {
          id: 'condition',
          name: product.specifications.condition,
          type: 'condition' as const,
          value: product.specifications.condition,
          available: true,
        },
      ],
    });
  }

  // Brand from specifications
  if (product.specifications?.brand) {
    variantGroups.push({
      type: 'brand' as const,
      name: 'Brand',
      variants: [
        {
          id: 'brand',
          name: product.specifications.brand,
          type: 'brand' as const,
          value: product.specifications.brand,
          available: true,
        },
      ],
    });
  }

  // Get gender and clothing type from product for breadcrumbs
  const gender = (product as any).gender as string | undefined;
  const clothingType = (product as any).clothing_type as string | undefined;

  // Get translated labels for breadcrumbs
  const genderLabel = gender ? t(`gender.${gender}`) : undefined;

  // Map clothing_type to route slug and translation key
  const clothingTypeRouteSlug = clothingType ? clothingTypeTranslationMap[clothingType] : undefined;
  const clothingTypeLabel =
    clothingTypeRouteSlug && gender
      ? t(`categories.${gender}.${clothingTypeRouteSlug}`)
      : undefined;

  const breadcrumbItems = generateShopProductBreadcrumbs({
    gender,
    genderLabel,
    clothingType: clothingTypeRouteSlug, // Use mapped slug for URL
    clothingTypeLabel,
    productName: product.name,
  });

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

          {/* Product Specifications */}
          {variantGroups.length > 0 && (
            <ProductVariants
              variantGroups={variantGroups}
              selectedVariants={selectedVariants}
              onChange={(type, variantId) => {
                setSelectedVariants((prev) => ({
                  ...prev,
                  [type]: variantId,
                }));
              }}
            />
          )}
        </div>
      </div>

      {/* Reviews removed for second-hand unique items store */}

      {/* Related Products */}
      <div>
        <RelatedProducts productId={productId} categoryId={product.category?.id} />
      </div>
    </div>
  );
}
