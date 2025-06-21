'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'fluid';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'responsive';
  centerContent?: boolean;
  as?: 'div' | 'section' | 'article' | 'main' | 'aside';
}

export function ResponsiveContainer({
  children,
  className,
  size = 'xl',
  padding = 'responsive',
  centerContent = false,
  as: Component = 'div'
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
    fluid: 'w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-2 py-2',
    md: 'px-4 py-4',
    lg: 'px-6 py-6',
    xl: 'px-8 py-8',
    responsive: 'px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 xl:px-12 xl:py-16'
  };

  return (
    <Component
      className={cn(
        'w-full',
        sizeClasses[size],
        paddingClasses[padding],
        centerContent && 'mx-auto',
        className
      )}
    >
      {children}
    </Component>
  );
}

// Enhanced grid system with better responsive controls
export interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  columns?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: {
    base?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    sm?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    md?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    lg?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    xl?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  } | 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  autoFit?: boolean;
  minItemWidth?: string;
}

export function ResponsiveGrid({
  children,
  className,
  columns = { base: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = 'md',
  autoFit = false,
  minItemWidth = '280px'
}: ResponsiveGridProps) {
  // Handle gap as object or string
  const gapConfig = typeof gap === 'string' ? { base: gap } : gap;

  const getGapClass = (breakpoint: string, gapSize: string) => {
    const gapMap = {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    };
    
    if (breakpoint === 'base') {
      return gapMap[gapSize as keyof typeof gapMap];
    }
    
    return `${breakpoint}:${gapMap[gapSize as keyof typeof gapMap]}`;
  };

  const getColumnClass = (breakpoint: string, colCount: number) => {
    if (breakpoint === 'base') {
      return `grid-cols-${colCount}`;
    }
    return `${breakpoint}:grid-cols-${colCount}`;
  };

  // Build responsive classes
  const gapClasses = Object.entries(gapConfig)
    .map(([breakpoint, gapSize]) => getGapClass(breakpoint, gapSize))
    .join(' ');

  const columnClasses = Object.entries(columns)
    .map(([breakpoint, colCount]) => getColumnClass(breakpoint, colCount!))
    .join(' ');

  if (autoFit) {
    return (
      <div
        className={cn(
          'grid',
          gapClasses,
          className
        )}
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid',
        columnClasses,
        gapClasses,
        className
      )}
    >
      {children}
    </div>
  );
}

// Responsive flex container
export interface ResponsiveFlexProps {
  children: ReactNode;
  className?: string;
  direction?: {
    base?: 'row' | 'col';
    sm?: 'row' | 'col';
    md?: 'row' | 'col';
    lg?: 'row' | 'col';
    xl?: 'row' | 'col';
  } | 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveFlex({
  children,
  className,
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 'md'
}: ResponsiveFlexProps) {
  const directionConfig = typeof direction === 'string' ? { base: direction } : direction;

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const getDirectionClass = (breakpoint: string, dir: string) => {
    const dirMap = { row: 'flex-row', col: 'flex-col' };
    if (breakpoint === 'base') {
      return dirMap[dir as keyof typeof dirMap];
    }
    return `${breakpoint}:${dirMap[dir as keyof typeof dirMap]}`;
  };

  const directionClasses = Object.entries(directionConfig)
    .map(([breakpoint, dir]) => getDirectionClass(breakpoint, dir!))
    .join(' ');

  return (
    <div
      className={cn(
        'flex',
        directionClasses,
        alignClasses[align],
        justifyClasses[justify],
        wrap && 'flex-wrap',
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

// Responsive spacing component
export interface ResponsiveSpacingProps {
  size?: {
    base?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    sm?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    md?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    lg?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    xl?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  } | 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function ResponsiveSpacing({ 
  size = 'md', 
  className 
}: ResponsiveSpacingProps) {
  const sizeConfig = typeof size === 'string' ? { base: size } : size;

  const sizeMap = {
    none: 'h-0',
    xs: 'h-2',
    sm: 'h-4',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16',
    '2xl': 'h-24'
  };

  const getSizeClass = (breakpoint: string, sizeValue: string) => {
    if (breakpoint === 'base') {
      return sizeMap[sizeValue as keyof typeof sizeMap];
    }
    return `${breakpoint}:${sizeMap[sizeValue as keyof typeof sizeMap]}`;
  };

  const spacingClasses = Object.entries(sizeConfig)
    .map(([breakpoint, sizeValue]) => getSizeClass(breakpoint, sizeValue!))
    .join(' ');

  return <div className={cn('w-full', spacingClasses, className)} />;
}
