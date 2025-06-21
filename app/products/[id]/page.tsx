'use client';

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

  const { data: product, isLoading, error, refetch } = useProduct(productId);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive font-medium">Failed to load product</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
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
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Product not found</h2>
          <p className="text-muted-foreground mt-2">
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
          height: 800
        }
      ]
    : [];

  // Mock variants data (this would come from a variants table in a real app)
  const mockVariants = [
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
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
            variants={mockVariants}
            selectedVariants={{}}
            onChange={(type, variantId) => {
              // Handle variant selection
              console.log('Variant selected:', type, variantId);
            }}
          />
        </div>
      </div>

      {/* Product Reviews */}
      <div className="mb-16">
        <ProductReviews productId={productId} />
      </div>

      {/* Related Products */}
      <div>
        <RelatedProducts 
          productId={productId} 
          categoryId={product.category?.id}
        />
      </div>
    </div>
  );
}
