'use client';

import { ReactNode } from 'react';
import { Header } from './header';
import { PageTransition } from './page-transition';
import { cn } from '@/lib/utils';

export interface PageTemplateProps {
  children: ReactNode;
  className?: string;
  showHeader?: boolean;
  transition?: {
    variant?: 'fade' | 'slide' | 'scale' | 'blur';
    duration?: number;
    delay?: number;
  };
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}

export function PageTemplate({
  children,
  className,
  showHeader = true,
  transition = { variant: 'fade', duration: 0.6, delay: 0 },
  maxWidth = 'full',
  padding = true,
}: PageTemplateProps) {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      case '2xl':
        return 'max-w-2xl';
      default:
        return 'max-w-full';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header />}

      <main
        className={cn(
          'w-full',
          padding && 'container mx-auto px-4 py-8',
          getMaxWidthClass(),
          className
        )}
      >
        <PageTransition
          variant={transition.variant}
          duration={transition.duration}
          delay={transition.delay}
        >
          {children}
        </PageTransition>
      </main>
    </div>
  );
}

// Specialized templates for different page types
export function ShopPageTemplate({ children, ...props }: Omit<PageTemplateProps, 'maxWidth'>) {
  return (
    <PageTemplate
      {...props}
      maxWidth="full"
      transition={{ variant: 'slide', duration: 0.6, delay: 0.1 }}
    >
      {children}
    </PageTemplate>
  );
}

export function ProductPageTemplate({ children, ...props }: Omit<PageTemplateProps, 'maxWidth'>) {
  return (
    <PageTemplate
      {...props}
      maxWidth="full"
      transition={{ variant: 'fade', duration: 0.8, delay: 0.1 }}
    >
      {children}
    </PageTemplate>
  );
}

export function AuthPageTemplate({
  children,
  ...props
}: Omit<PageTemplateProps, 'maxWidth' | 'showHeader'>) {
  return (
    <PageTemplate
      {...props}
      maxWidth="md"
      showHeader={false}
      transition={{ variant: 'scale', duration: 0.6, delay: 0.2 }}
      className="flex min-h-screen items-center justify-center"
    >
      {children}
    </PageTemplate>
  );
}

export function CartPageTemplate({ children, ...props }: Omit<PageTemplateProps, 'maxWidth'>) {
  return (
    <PageTemplate
      {...props}
      maxWidth="2xl"
      transition={{ variant: 'slide', duration: 0.6, delay: 0.1 }}
    >
      {children}
    </PageTemplate>
  );
}

export function CheckoutPageTemplate({ children, ...props }: Omit<PageTemplateProps, 'maxWidth'>) {
  return (
    <PageTemplate
      {...props}
      maxWidth="2xl"
      transition={{ variant: 'fade', duration: 0.6, delay: 0.1 }}
    >
      {children}
    </PageTemplate>
  );
}

export function AccountPageTemplate({ children, ...props }: Omit<PageTemplateProps, 'maxWidth'>) {
  return (
    <PageTemplate
      {...props}
      maxWidth="2xl"
      transition={{ variant: 'slide', duration: 0.6, delay: 0.1 }}
    >
      {children}
    </PageTemplate>
  );
}
