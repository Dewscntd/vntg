'use client';

import { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  useScrollTriggeredSection,
  useScrollTriggeredStagger,
  useParallax,
  useImageReveal,
  useTextReveal,
  useCounterAnimation,
} from '@/lib/hooks/use-gsap';

// Base scroll reveal component
export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
}

export function ScrollReveal({
  children,
  className,
  animation = 'fadeIn',
  delay = 0,
}: ScrollRevealProps) {
  const ref = useScrollTriggeredSection(animation);

  return (
    <div ref={ref} className={cn('w-full', className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// Staggered reveal component
export interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  selector?: string;
  stagger?: number;
}

export function StaggerReveal({
  children,
  className,
  selector = '[data-reveal]',
}: StaggerRevealProps) {
  const ref = useScrollTriggeredStagger(selector);

  return (
    <div ref={ref} className={cn('w-full', className)}>
      {children}
    </div>
  );
}

// Parallax component
export interface ParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function Parallax({ children, className, speed = 0.5 }: ParallaxProps) {
  const ref = useParallax(speed);

  return (
    <div ref={ref} className={cn('w-full', className)}>
      {children}
    </div>
  );
}

// Image reveal component
export interface ImageRevealProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export function ImageReveal({ src, alt, className, containerClassName }: ImageRevealProps) {
  const ref = useImageReveal();

  return (
    <div ref={ref} className={cn('overflow-hidden', containerClassName)}>
      <img src={src} alt={alt} className={cn('h-full w-full object-cover', className)} />
    </div>
  );
}

// Text reveal component
export interface TextRevealProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export function TextReveal({ children, className, as: Component = 'div' }: TextRevealProps) {
  const ref = useTextReveal();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Component
      ref={ref as any}
      className={cn('overflow-hidden', className)}
      suppressHydrationWarning={true}
    >
      {isMounted ? children : ''}
    </Component>
  );
}

// Counter component
export interface CounterProps {
  endValue: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function Counter({ endValue, className, prefix = '', suffix = '' }: CounterProps) {
  const ref = useCounterAnimation(endValue);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}

// Product grid with scroll reveal
export interface ScrollRevealGridProps {
  children: ReactNode;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

export function ScrollRevealGrid({
  children,
  className,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md',
}: ScrollRevealGridProps) {
  const { useScrollTriggeredGrid } = require('@/lib/hooks/use-gsap');
  const ref = useScrollTriggeredGrid();

  const gridCols = {
    sm: {
      1: 'sm:grid-cols-1',
      2: 'sm:grid-cols-2',
      3: 'sm:grid-cols-3',
      4: 'sm:grid-cols-4',
    } as Record<number, string>,
    md: {
      1: 'md:grid-cols-1',
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-3',
      4: 'md:grid-cols-4',
    } as Record<number, string>,
    lg: {
      1: 'lg:grid-cols-1',
      2: 'lg:grid-cols-2',
      3: 'lg:grid-cols-3',
      4: 'lg:grid-cols-4',
      5: 'lg:grid-cols-5',
      6: 'lg:grid-cols-6',
    } as Record<number, string>,
    xl: {
      1: 'xl:grid-cols-1',
      2: 'xl:grid-cols-2',
      3: 'xl:grid-cols-3',
      4: 'xl:grid-cols-4',
      5: 'xl:grid-cols-5',
      6: 'xl:grid-cols-6',
    } as Record<number, string>,
  };

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'grid grid-cols-1',
        columns.sm && gridCols.sm[columns.sm],
        columns.md && gridCols.md[columns.md],
        columns.lg && gridCols.lg[columns.lg],
        columns.xl && gridCols.xl[columns.xl],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

// Section with multiple reveal effects
export interface RevealSectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  titleAnimation?: 'fadeIn' | 'slideLeft' | 'slideRight' | 'textReveal';
  contentAnimation?: 'fadeIn' | 'slideLeft' | 'slideRight' | 'stagger';
}

export function RevealSection({
  children,
  className,
  title,
  subtitle,
  titleAnimation = 'textReveal',
  contentAnimation = 'stagger',
}: RevealSectionProps) {
  return (
    <section className={cn('py-16', className)}>
      {(title || subtitle) && (
        <div className="mb-12 text-center">
          {title &&
            (titleAnimation === 'textReveal' ? (
              <TextReveal as="h2" className="mb-4 text-3xl font-bold">
                {title}
              </TextReveal>
            ) : (
              <ScrollReveal animation={titleAnimation}>
                <h2 className="mb-4 text-3xl font-bold">{title}</h2>
              </ScrollReveal>
            ))}
          {subtitle && (
            <ScrollReveal animation="fadeIn" delay={200}>
              <p className="mx-auto max-w-2xl text-muted-foreground">{subtitle}</p>
            </ScrollReveal>
          )}
        </div>
      )}

      {contentAnimation === 'stagger' ? (
        <StaggerReveal>{children}</StaggerReveal>
      ) : (
        <ScrollReveal animation={contentAnimation}>{children}</ScrollReveal>
      )}
    </section>
  );
}

// Hero section with parallax background
export interface ParallaxHeroProps {
  children: ReactNode;
  backgroundImage?: string;
  className?: string;
  parallaxSpeed?: number;
}

export function ParallaxHero({
  children,
  backgroundImage,
  className,
  parallaxSpeed = 0.5,
}: ParallaxHeroProps) {
  return (
    <section
      className={cn(
        'relative flex min-h-screen items-center justify-center overflow-hidden',
        className
      )}
    >
      {backgroundImage && (
        <Parallax speed={parallaxSpeed} className="absolute inset-0 -z-10">
          <div
            className="h-[120%] w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        </Parallax>
      )}

      <div className="relative z-10 text-center">
        <ScrollReveal animation="fadeIn">{children}</ScrollReveal>
      </div>
    </section>
  );
}
