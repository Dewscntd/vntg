'use client';

import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Responsive heading component
export interface ResponsiveHeadingProps {
  children: ReactNode;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'responsive';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  tracking?: 'tight' | 'normal' | 'wide';
  color?: 'default' | 'muted' | 'primary' | 'secondary';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';
}

export const ResponsiveHeading = forwardRef<HTMLHeadingElement, ResponsiveHeadingProps>(
  (
    {
      children,
      level,
      className,
      size = 'responsive',
      weight = 'bold',
      tracking = 'normal',
      color = 'default',
      as,
    },
    ref
  ) => {
    const Component = as || (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');

    const sizeClasses = {
      sm: {
        1: 'text-2xl md:text-3xl',
        2: 'text-xl md:text-2xl',
        3: 'text-lg md:text-xl',
        4: 'text-base md:text-lg',
        5: 'text-sm md:text-base',
        6: 'text-xs md:text-sm',
      },
      md: {
        1: 'text-3xl md:text-4xl lg:text-5xl',
        2: 'text-2xl md:text-3xl lg:text-4xl',
        3: 'text-xl md:text-2xl lg:text-3xl',
        4: 'text-lg md:text-xl lg:text-2xl',
        5: 'text-base md:text-lg lg:text-xl',
        6: 'text-sm md:text-base lg:text-lg',
      },
      lg: {
        1: 'text-4xl md:text-5xl lg:text-6xl xl:text-7xl',
        2: 'text-3xl md:text-4xl lg:text-5xl xl:text-6xl',
        3: 'text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
        4: 'text-xl md:text-2xl lg:text-3xl xl:text-4xl',
        5: 'text-lg md:text-xl lg:text-2xl xl:text-3xl',
        6: 'text-base md:text-lg lg:text-xl xl:text-2xl',
      },
      xl: {
        1: 'text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl',
        2: 'text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl',
        3: 'text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl',
        4: 'text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl',
        5: 'text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl',
        6: 'text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl',
      },
      responsive: {
        1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl',
        2: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl',
        3: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
        4: 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl',
        5: 'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl',
        6: 'text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl',
      },
    };

    const weightClasses = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
    };

    const trackingClasses = {
      tight: 'tracking-tight',
      normal: 'tracking-normal',
      wide: 'tracking-wide',
    };

    const colorClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      secondary: 'text-secondary',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          sizeClasses[size][level],
          weightClasses[weight],
          trackingClasses[tracking],
          colorClasses[color],
          'leading-tight',
          className
        )}
      >
        {children}
      </Component>
    );
  }
);

ResponsiveHeading.displayName = 'ResponsiveHeading';

// Responsive text component
export interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | 'responsive';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'primary' | 'secondary' | 'destructive';
  align?: 'left' | 'center' | 'right' | 'justify';
  leading?: 'tight' | 'normal' | 'relaxed' | 'loose';
  as?: 'p' | 'span' | 'div' | 'strong' | 'em';
}

export const ResponsiveText = forwardRef<HTMLParagraphElement, ResponsiveTextProps>(
  (
    {
      children,
      className,
      size = 'base',
      weight = 'normal',
      color = 'default',
      align = 'left',
      leading = 'normal',
      as: Component = 'p',
    },
    ref
  ) => {
    const sizeClasses = {
      xs: 'text-xs sm:text-sm',
      sm: 'text-sm sm:text-base',
      base: 'text-base sm:text-lg',
      lg: 'text-lg sm:text-xl',
      xl: 'text-xl sm:text-2xl',
      responsive: 'text-sm sm:text-base md:text-lg lg:text-xl',
    };

    const weightClasses = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    };

    const colorClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      secondary: 'text-secondary',
      destructive: 'text-destructive',
    };

    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    };

    const leadingClasses = {
      tight: 'leading-tight',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed',
      loose: 'leading-loose',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          sizeClasses[size],
          weightClasses[weight],
          colorClasses[color],
          alignClasses[align],
          leadingClasses[leading],
          className
        )}
      >
        {children}
      </Component>
    );
  }
);

ResponsiveText.displayName = 'ResponsiveText';

// Responsive display text for hero sections
export interface ResponsiveDisplayProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  gradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

export const ResponsiveDisplay = forwardRef<HTMLHeadingElement, ResponsiveDisplayProps>(
  (
    {
      children,
      className,
      size = 'lg',
      gradient = false,
      gradientFrom = 'from-primary',
      gradientTo = 'to-primary/60',
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
      md: 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl',
      lg: 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl',
      xl: 'text-7xl sm:text-8xl md:text-9xl lg:text-[10rem]',
      '2xl': 'text-8xl sm:text-9xl md:text-[10rem] lg:text-[12rem]',
    };

    const gradientClasses = gradient
      ? `bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`
      : '';

    return (
      <h1
        ref={ref}
        className={cn(
          sizeClasses[size],
          'font-extrabold leading-none tracking-tight',
          gradientClasses,
          className
        )}
      >
        {children}
      </h1>
    );
  }
);

ResponsiveDisplay.displayName = 'ResponsiveDisplay';

// Responsive lead text
export interface ResponsiveLeadProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ResponsiveLead = forwardRef<HTMLParagraphElement, ResponsiveLeadProps>(
  ({ children, className, size = 'md' }, ref) => {
    const sizeClasses = {
      sm: 'text-lg sm:text-xl md:text-2xl',
      md: 'text-xl sm:text-2xl md:text-3xl',
      lg: 'text-2xl sm:text-3xl md:text-4xl',
    };

    return (
      <p
        ref={ref}
        className={cn(sizeClasses[size], 'leading-relaxed text-muted-foreground', className)}
      >
        {children}
      </p>
    );
  }
);

ResponsiveLead.displayName = 'ResponsiveLead';
