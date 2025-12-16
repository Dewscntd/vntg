'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LazyImage } from '@/components/ui/lazy-image';
import { ScrollReveal } from '@/components/layout/scroll-reveal';
import { ResponsiveH2 } from '@/components/ui/responsive-typography';
import { useTranslations } from 'next-intl';

interface CategoryTile {
  id: string;
  name: string;
  slug: string;
  image: string;
  itemCount: number;
  featured?: boolean;
}

const categories: CategoryTile[] = [
  {
    id: 'cat-1',
    name: 'Men',
    slug: 'man',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=800&fit=crop',
    itemCount: 245,
    featured: true,
  },
  {
    id: 'cat-2',
    name: 'Women',
    slug: 'woman',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop',
    itemCount: 312,
    featured: true,
  },
  {
    id: 'cat-3',
    name: 'Vintage Denim',
    slug: 'denim',
    image: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=600&h=800&fit=crop',
    itemCount: 89,
  },
  {
    id: 'cat-4',
    name: 'Jackets & Coats',
    slug: 'jackets',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop',
    itemCount: 156,
  },
  {
    id: 'cat-5',
    name: '90s Archive',
    slug: '90s',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=800&fit=crop',
    itemCount: 67,
  },
  {
    id: 'cat-6',
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=600&h=800&fit=crop',
    itemCount: 198,
  },
];

interface CategoryCardProps {
  category: CategoryTile;
  size?: 'default' | 'large';
  index: number;
}

function CategoryCard({ category, size = 'default', index }: CategoryCardProps) {
  const isLarge = size === 'large';

  return (
    <ScrollReveal animation="fadeIn" delay={index * 100}>
      <Link
        href={`/shop?category=${category.slug}`}
        className={cn(
          'group relative block overflow-hidden rounded-2xl',
          isLarge ? 'aspect-[4/5]' : 'aspect-[3/4]'
        )}
      >
        {/* Background Image */}
        <LazyImage
          src={category.image}
          alt={category.name}
          fill
          sizes={isLarge ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 33vw'}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          placeholder="skeleton"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/60" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <div className="translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
            <p className="mb-1 text-sm font-medium text-white/70">
              {category.itemCount}+ pieces
            </p>
            <h3 className={cn(
              'font-semibold text-white',
              isLarge ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
            )}>
              {category.name}
            </h3>
            <div className="mt-3 flex items-center gap-2 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span>Shop Now</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </ScrollReveal>
  );
}

export function CategoryTiles() {
  const t = useTranslations('landing.categories');

  return (
    <section className="bg-muted/30 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <ScrollReveal animation="fadeIn">
          <div className="mb-12 text-center">
            <ResponsiveH2 size="md" className="mb-4 text-foreground">
              {t('title')}
            </ResponsiveH2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
        </ScrollReveal>

        {/* Category Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Featured Categories - Larger */}
          <div className="md:col-span-1 lg:row-span-2">
            <CategoryCard category={categories[0]} size="large" index={0} />
          </div>
          <div className="md:col-span-1 lg:row-span-2">
            <CategoryCard category={categories[1]} size="large" index={1} />
          </div>

          {/* Regular Categories */}
          <div className="grid grid-cols-2 gap-4 md:col-span-2 lg:col-span-1 lg:row-span-2">
            {categories.slice(2).map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index + 2}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
