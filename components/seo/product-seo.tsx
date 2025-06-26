'use client';

import Head from 'next/head';

export interface ProductSEOProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string | null;
    category?: {
      name: string;
    };
    is_featured?: boolean;
    is_new?: boolean;
    is_sale?: boolean;
    discount_percent?: number;
  };
  canonical?: string;
}

export function ProductSEO({ product, canonical }: ProductSEOProps) {
  const title = `${product.name} | VNTG`;
  const description =
    product.description ||
    `Shop ${product.name} at VNTG. Premium quality products at great prices.`;
  const price = product.discount_percent
    ? (product.price * (1 - product.discount_percent / 100)).toFixed(2)
    : product.price.toFixed(2);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: description,
    image: product.image_url ? [product.image_url] : [],
    brand: {
      '@type': 'Brand',
      name: 'VNTG',
    },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'VNTG',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '10',
    },
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content={`${product.name}, ${product.category?.name || 'products'}, VNTG, shop, buy`}
      />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Tags */}
      <meta property="og:type" content="product" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {product.image_url && <meta property="og:image" content={product.image_url} />}
      <meta property="og:site_name" content="VNTG" />
      <meta property="product:price:amount" content={price} />
      <meta property="product:price:currency" content="USD" />
      {product.category && <meta property="product:category" content={product.category.name} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {product.image_url && <meta name="twitter:image" content={product.image_url} />}

      {/* Product-specific Meta Tags */}
      <meta name="product:price" content={`$${price}`} />
      <meta name="product:availability" content="in stock" />
      {product.is_new && <meta name="product:condition" content="new" />}
      {product.is_sale && <meta name="product:sale_price" content={`$${price}`} />}

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
}

export interface CategorySEOProps {
  category: {
    id: string;
    name: string;
    description?: string;
  };
  productCount?: number;
  canonical?: string;
}

export function CategorySEO({ category, productCount, canonical }: CategorySEOProps) {
  const title = `${category.name} | VNTG`;
  const description =
    category.description ||
    `Shop ${category.name} at VNTG. ${productCount ? `${productCount} products` : 'Premium products'} available.`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: description,
    mainEntity: {
      '@type': 'ItemList',
      name: category.name,
      numberOfItems: productCount || 0,
    },
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`${category.name}, products, VNTG, shop, category`} />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="VNTG" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
}

export interface SearchSEOProps {
  query: string;
  resultCount?: number;
  canonical?: string;
}

export function SearchSEO({ query, resultCount, canonical }: SearchSEOProps) {
  const title = `Search results for "${query}" | VNTG`;
  const description = `Found ${resultCount || 0} products matching "${query}" at VNTG. Shop premium products at great prices.`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`${query}, search, products, VNTG, shop`} />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="VNTG" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {/* No index for search pages to avoid duplicate content */}
      <meta name="robots" content="noindex, follow" />
    </Head>
  );
}
