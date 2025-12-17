'use client';

import Link from 'next/link';
import { LazyImage } from '@/components/ui/lazy-image';
import { useTranslations } from 'next-intl';

interface Category {
  id: string;
  key: string;
  image: string;
  href: string;
  featured?: boolean;
}

const mainCategories: Category[] = [
  {
    id: 'men',
    key: 'men',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=800&fit=crop',
    href: '/products?category=men',
    featured: true,
  },
  {
    id: 'women',
    key: 'women',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=800&fit=crop',
    href: '/products?category=women',
    featured: true,
  },
  {
    id: 'kids',
    key: 'kids',
    image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&h=800&fit=crop',
    href: '/products?category=kids',
  },
  {
    id: 'teens',
    key: 'teens',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=800&fit=crop',
    href: '/products?category=teens',
  },
  {
    id: 'accessories',
    key: 'accessories',
    image: 'https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=600&h=800&fit=crop',
    href: '/products?category=accessories',
  },
  {
    id: 'shoes',
    key: 'shoes',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=800&fit=crop',
    href: '/products?category=shoes',
  },
];

export function ShopCategories() {
  const t = useTranslations('shopPage.categories');

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Section header */}
        <h2 className="mb-12 text-3xl font-light tracking-tight text-foreground md:mb-16 md:text-4xl">
          {t('title')}
        </h2>

        {/* Grid with 1px gap borders */}
        <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-3">
          {mainCategories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className={`group relative bg-background ${category.featured ? 'row-span-2' : ''}`}
            >
              <div
                className={`relative overflow-hidden ${
                  category.featured ? 'aspect-[3/4]' : 'aspect-square'
                }`}
              >
                <LazyImage
                  src={category.image}
                  alt={t(`items.${category.key}.title`)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes={
                    category.featured
                      ? '(max-width: 768px) 50vw, 33vw'
                      : '(max-width: 768px) 50vw, 33vw'
                  }
                />

                {/* Minimal dark gradient at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Text */}
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <h3 className="text-xl font-light tracking-tight text-white md:text-2xl">
                    {t(`items.${category.key}.title`)}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
