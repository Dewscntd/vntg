'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveFlex } from './responsive-container';

// Desktop-optimized two-column layout
export interface DesktopTwoColumnProps {
  children: ReactNode;
  sidebar: ReactNode;
  className?: string;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: 'sm' | 'md' | 'lg';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  stickysidebar?: boolean;
  collapsibleSidebar?: boolean;
}

export function DesktopTwoColumn({
  children,
  sidebar,
  className,
  sidebarPosition = 'left',
  sidebarWidth = 'md',
  gap = 'lg',
  stickysidebar = false,
  collapsibleSidebar = false
}: DesktopTwoColumnProps) {
  const sidebarWidthClasses = {
    sm: 'lg:w-64',
    md: 'lg:w-80',
    lg: 'lg:w-96'
  };

  const gapClasses = {
    sm: 'lg:gap-6',
    md: 'lg:gap-8',
    lg: 'lg:gap-12',
    xl: 'lg:gap-16'
  };

  const sidebarClasses = cn(
    'w-full',
    sidebarWidthClasses[sidebarWidth],
    stickysidebar && 'lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto',
    collapsibleSidebar && 'lg:transition-all lg:duration-300'
  );

  const mainClasses = cn(
    'flex-1 min-w-0' // min-w-0 prevents flex item from overflowing
  );

  return (
    <ResponsiveContainer size="xl" className={className}>
      <div className={cn(
        'flex flex-col lg:flex-row',
        gapClasses[gap]
      )}>
        {sidebarPosition === 'left' && (
          <aside className={sidebarClasses}>
            {sidebar}
          </aside>
        )}
        
        <main className={mainClasses}>
          {children}
        </main>
        
        {sidebarPosition === 'right' && (
          <aside className={sidebarClasses}>
            {sidebar}
          </aside>
        )}
      </div>
    </ResponsiveContainer>
  );
}

// Desktop-optimized three-column layout
export interface DesktopThreeColumnProps {
  children: ReactNode;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
  className?: string;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  sidebarWidth?: 'sm' | 'md';
  stickySidebars?: boolean;
}

export function DesktopThreeColumn({
  children,
  leftSidebar,
  rightSidebar,
  className,
  gap = 'lg',
  sidebarWidth = 'sm',
  stickySidebars = false
}: DesktopThreeColumnProps) {
  const sidebarWidthClasses = {
    sm: 'xl:w-64',
    md: 'xl:w-80'
  };

  const gapClasses = {
    sm: 'xl:gap-6',
    md: 'xl:gap-8',
    lg: 'xl:gap-12',
    xl: 'xl:gap-16'
  };

  const sidebarClasses = cn(
    'hidden xl:block',
    sidebarWidthClasses[sidebarWidth],
    stickySidebars && 'xl:sticky xl:top-24 xl:self-start xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto'
  );

  return (
    <ResponsiveContainer size="2xl" className={className}>
      <div className={cn(
        'flex flex-col xl:flex-row',
        gapClasses[gap]
      )}>
        {leftSidebar && (
          <aside className={sidebarClasses}>
            {leftSidebar}
          </aside>
        )}
        
        <main className="flex-1 min-w-0">
          {children}
        </main>
        
        {rightSidebar && (
          <aside className={sidebarClasses}>
            {rightSidebar}
          </aside>
        )}
      </div>
    </ResponsiveContainer>
  );
}

// Desktop-optimized hero section
export interface DesktopHeroProps {
  children: ReactNode;
  className?: string;
  height?: 'sm' | 'md' | 'lg' | 'xl' | 'screen';
  backgroundImage?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  contentAlignment?: 'left' | 'center' | 'right';
  verticalAlignment?: 'top' | 'center' | 'bottom';
}

export function DesktopHero({
  children,
  className,
  height = 'lg',
  backgroundImage,
  overlay = false,
  overlayOpacity = 0.5,
  contentAlignment = 'center',
  verticalAlignment = 'center'
}: DesktopHeroProps) {
  const heightClasses = {
    sm: 'h-64 md:h-80 lg:h-96',
    md: 'h-80 md:h-96 lg:h-[32rem]',
    lg: 'h-96 md:h-[32rem] lg:h-[40rem]',
    xl: 'h-[32rem] md:h-[40rem] lg:h-[48rem]',
    screen: 'h-screen'
  };

  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  };

  const verticalAlignmentClasses = {
    top: 'justify-start',
    center: 'justify-center',
    bottom: 'justify-end'
  };

  return (
    <section 
      className={cn(
        'relative flex w-full',
        heightClasses[height],
        verticalAlignmentClasses[verticalAlignment],
        className
      )}
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : undefined}
    >
      {overlay && backgroundImage && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      <ResponsiveContainer 
        size="xl" 
        className={cn(
          'relative z-10 flex flex-col',
          alignmentClasses[contentAlignment],
          verticalAlignmentClasses[verticalAlignment]
        )}
      >
        {children}
      </ResponsiveContainer>
    </section>
  );
}

// Desktop-optimized card grid
export interface DesktopCardGridProps {
  children: ReactNode;
  className?: string;
  cardMinWidth?: string;
  maxColumns?: number;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  equalHeight?: boolean;
}

export function DesktopCardGrid({
  children,
  className,
  cardMinWidth = '320px',
  maxColumns = 4,
  gap = 'lg',
  equalHeight = false
}: DesktopCardGridProps) {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };

  return (
    <div
      className={cn(
        'grid w-full',
        gapClasses[gap],
        equalHeight && 'auto-rows-fr',
        className
      )}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${cardMinWidth}, 100%), 1fr))`,
        maxWidth: '100%'
      }}
    >
      {children}
    </div>
  );
}

// Desktop-optimized content sections
export interface DesktopSectionProps {
  children: ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  background?: 'default' | 'muted' | 'accent';
  fullWidth?: boolean;
}

export function DesktopSection({
  children,
  className,
  spacing = 'lg',
  background = 'default',
  fullWidth = false
}: DesktopSectionProps) {
  const spacingClasses = {
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-16',
    lg: 'py-16 md:py-20 lg:py-24',
    xl: 'py-20 md:py-24 lg:py-32',
    '2xl': 'py-24 md:py-32 lg:py-40'
  };

  const backgroundClasses = {
    default: 'bg-background',
    muted: 'bg-muted/30',
    accent: 'bg-accent/10'
  };

  const Container = fullWidth ? 'div' : ResponsiveContainer;
  const containerProps = fullWidth ? {} : { size: 'xl' as const };

  return (
    <section className={cn(
      'w-full',
      spacingClasses[spacing],
      backgroundClasses[background],
      className
    )}>
      <Container {...containerProps}>
        {children}
      </Container>
    </section>
  );
}

// Desktop-optimized masonry layout
export interface DesktopMasonryProps {
  children: ReactNode;
  className?: string;
  columns?: {
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export function DesktopMasonry({
  children,
  className,
  columns = { md: 2, lg: 3, xl: 4 },
  gap = 'md'
}: DesktopMasonryProps) {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  const columnClasses = [
    columns.md && `md:columns-${columns.md}`,
    columns.lg && `lg:columns-${columns.lg}`,
    columns.xl && `xl:columns-${columns.xl}`
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(
      'columns-1',
      columnClasses,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}
