'use client';

import Link from 'next/link';
import { ShoppingCart, ArrowRight, Heart, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGSAP } from '@/lib/hooks/use-gsap';
import { cn } from '@/lib/utils';

export interface EmptyCartProps {
  className?: string;
  compact?: boolean;
  showSuggestions?: boolean;
}

export function EmptyCart({ className, compact = false, showSuggestions = true }: EmptyCartProps) {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');

  // GSAP animation for empty cart illustration
  useGSAP(({ timeline }) => {
    timeline
      .fromTo(
        '[data-cart-icon]',
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' }
      )
      .fromTo(
        '[data-empty-content]',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        '-=0.2'
      )
      .fromTo(
        '[data-suggestions]',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
        '-=0.2'
      );
  }, []);

  if (compact) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" data-cart-icon />
        <div data-empty-content>
          <h3 className="mb-2 text-lg font-medium">{t('empty')}</h3>
          <p className="mb-4 text-sm text-muted-foreground">{t('emptyMessage')}</p>
          <Button asChild>
            <Link href="/products">
              {tCommon('startShopping')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('py-12 text-center', className)}>
      {/* Empty Cart Icon */}
      <div className="mb-8">
        <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground" data-cart-icon />
      </div>

      {/* Empty Cart Content */}
      <div data-empty-content className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">{t('empty')}</h2>
        <p className="mx-auto mb-6 max-w-md text-lg text-muted-foreground">
          {t('emptyMessage')}
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/products">
              {tCommon('startShopping')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <Button variant="outline" asChild size="lg">
            <Link href="/categories">{t('browseCategories')}</Link>
          </Button>
        </div>
      </div>

      {/* Shopping Suggestions */}
      {showSuggestions && (
        <div className="mx-auto max-w-4xl">
          <h3 className="mb-6 text-lg font-semibold">{t('whyNotTry')}</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Featured Products */}
            <Card data-suggestions>
              <CardContent className="p-6 text-center">
                <Star className="mx-auto mb-3 h-8 w-8 text-yellow-500" />
                <h4 className="mb-2 font-medium">{t('featuredProducts')}</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  {t('featuredDescription')}
                </p>
                <Button variant="outline" asChild size="sm">
                  <Link href="/products?featured=true">{t('viewFeatured')}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* New Arrivals */}
            <Card data-suggestions>
              <CardContent className="p-6 text-center">
                <ShoppingCart className="mx-auto mb-3 h-8 w-8 text-blue-500" />
                <h4 className="mb-2 font-medium">{t('newArrivals')}</h4>
                <p className="mb-4 text-sm text-muted-foreground">{t('newArrivalsDescription')}</p>
                <Button variant="outline" asChild size="sm">
                  <Link href="/products?new=true">{t('shopNew')}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Sale Items */}
            <Card data-suggestions>
              <CardContent className="p-6 text-center">
                <Heart className="mx-auto mb-3 h-8 w-8 text-red-500" />
                <h4 className="mb-2 font-medium">{t('saleItems')}</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  {t('saleDescription')}
                </p>
                <Button variant="outline" asChild size="sm">
                  <Link href="/products?sale=true">{t('shopSale')}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
