/**
 * Hero Section - Storefront Component
 *
 * Renders hero section with optional product carousel.
 * Supports background images, videos, and gradients.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { HeroSection as HeroSectionType } from '@/types/cms';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { ProductCarousel } from './product-carousel';
import { cn } from '@/lib/utils';
import gsap from 'gsap';

interface HeroSectionProps {
  section: HeroSectionType;
  isPreview?: boolean;
}

export function HeroSection({ section, isPreview = false }: HeroSectionProps) {
  const { config } = section;
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Animation effect
  useEffect(() => {
    if (!config.animation?.enabled || !contentRef.current) return;

    const { type, duration = 1 } = config.animation;

    const ctx = gsap.context(() => {
      switch (type) {
        case 'fade':
          gsap.from(contentRef.current, {
            opacity: 0,
            duration,
            ease: 'power2.out',
          });
          break;

        case 'slide':
          gsap.from(contentRef.current, {
            y: 50,
            opacity: 0,
            duration,
            ease: 'power3.out',
          });
          break;

        case 'zoom':
          gsap.from(contentRef.current, {
            scale: 0.9,
            opacity: 0,
            duration,
            ease: 'back.out(1.7)',
          });
          break;
      }
    });

    return () => ctx.revert();
  }, [config.animation]);

  // Height classes
  const heightClasses = {
    sm: 'min-h-[400px]',
    md: 'min-h-[500px]',
    lg: 'min-h-[600px]',
    xl: 'min-h-[700px]',
    full: 'min-h-screen',
  };

  // Content position classes
  const positionClasses = {
    top: 'items-start pt-16',
    center: 'items-center',
    bottom: 'items-end pb-16',
  };

  // Text alignment classes
  const textAlignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <div
      className={cn('relative flex w-full overflow-hidden', heightClasses[config.height || 'lg'])}
    >
      {/* Background Layer */}
      {config.backgroundImage && (
        <div className="absolute inset-0 z-0">
          <OptimizedImage
            src={config.backgroundImage}
            alt={config.headline}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}

      {config.backgroundVideo && (
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop playsInline className="h-full w-full object-cover">
            <source src={config.backgroundVideo} type="video/mp4" />
          </video>
        </div>
      )}

      {config.backgroundGradient && (
        <div
          className={cn(
            'absolute inset-0 z-0',
            `bg-gradient-${config.backgroundGradient.direction}`
          )}
          style={{
            background: `linear-gradient(${config.backgroundGradient.direction.replace('to-', 'to ')}, ${config.backgroundGradient.from}, ${config.backgroundGradient.to})`,
          }}
        />
      )}

      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-10 bg-black"
        style={{ opacity: config.overlayOpacity || 0.4 }}
      />

      {/* Content Container */}
      <div
        className={cn(
          'container relative z-20 mx-auto flex w-full flex-col px-4',
          positionClasses[config.contentPosition || 'center']
        )}
      >
        <div
          ref={contentRef}
          className={cn(
            'flex max-w-4xl flex-col gap-6',
            textAlignmentClasses[config.textAlignment]
          )}
          style={{ color: config.textColor || 'white' }}
        >
          {/* Headline */}
          <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            {config.headline}
          </h1>

          {/* Subheadline */}
          {config.subheadline && (
            <h2 className="text-xl font-medium md:text-2xl lg:text-3xl">{config.subheadline}</h2>
          )}

          {/* Description */}
          {config.description && (
            <p className="text-base opacity-90 md:text-lg lg:text-xl">{config.description}</p>
          )}

          {/* CTAs */}
          {(config.primaryCta || config.secondaryCta) && (
            <div className="flex flex-wrap gap-4">
              {config.primaryCta && (
                <Link href={config.primaryCta.url}>
                  <Button
                    size="lg"
                    variant={config.primaryCta.variant || 'default'}
                    className="min-w-[150px]"
                  >
                    {config.primaryCta.text}
                  </Button>
                </Link>
              )}

              {config.secondaryCta && (
                <Link href={config.secondaryCta.url}>
                  <Button
                    size="lg"
                    variant={config.secondaryCta.variant || 'outline'}
                    className="min-w-[150px]"
                  >
                    {config.secondaryCta.text}
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Product Carousel (if configured) */}
          {config.carousel && (
            <div className="mt-8 w-full">
              <ProductCarousel config={config.carousel} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
