'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/ui/lazy-image';
import { ScrollReveal, TextReveal } from '@/components/layout/scroll-reveal';
import { useTranslations } from 'next-intl';

// Hero carousel images - styled vintage fashion shots
const heroImages = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&h=1080&fit=crop',
    alt: 'Vintage fashion editorial',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop',
    alt: 'Curated vintage collection',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop',
    alt: 'Sustainable fashion',
  },
];

export function HeroEditorial() {
  const t = useTranslations('landing.hero');
  const [currentImage, setCurrentImage] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden">
      {/* Background Images Carousel */}
      {heroImages.map((image, index) => (
        <div
          key={image.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000',
            currentImage === index ? 'opacity-100' : 'opacity-0'
          )}
        >
          <LazyImage
            src={image.src}
            alt={image.alt}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="100vw"
          />
          {/* Ken Burns Effect */}
          <div
            className={cn(
              'absolute inset-0 transition-transform duration-[20000ms] ease-linear',
              currentImage === index ? 'scale-110' : 'scale-100'
            )}
          />
        </div>
      ))}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

      {/* Content */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-end px-4 pb-24 md:pb-32">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-3xl space-y-6">
            {/* Headline */}
            <TextReveal>
              <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                {t('headline')}
              </h1>
            </TextReveal>

            {/* Subheading */}
            <ScrollReveal animation="fadeIn" delay={400}>
              <p className="max-w-xl text-lg text-white/80 md:text-xl">
                {t('subheadingShort')}
              </p>
            </ScrollReveal>

            {/* CTAs */}
            <ScrollReveal animation="fadeIn" delay={600}>
              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <Button
                  size="lg"
                  className="group bg-white text-black hover:bg-white/90"
                  asChild
                >
                  <Link href="/shop">
                    {t('cta.shopNew')}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/about">{t('cta.ourStory')}</Link>
                </Button>
              </div>
            </ScrollReveal>

            {/* Trust Indicators */}
            <ScrollReveal animation="fadeIn" delay={800}>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  <span>{t('trust.newArrivals')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span>{t('trust.verified')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  <span>{t('trust.freeShipping')}</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2 md:bottom-12">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={cn(
              'h-1 rounded-full transition-all duration-300',
              currentImage === index
                ? 'w-8 bg-white'
                : 'w-2 bg-white/40 hover:bg-white/60'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <ScrollReveal animation="fadeIn" delay={1000}>
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 right-4 z-20 hidden items-center gap-2 text-white/60 transition-colors hover:text-white md:flex md:bottom-12 md:right-8"
        >
          <span className="text-xs uppercase tracking-wider">{t('scroll')}</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </button>
      </ScrollReveal>
    </section>
  );
}
