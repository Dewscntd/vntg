'use client';

import { forwardRef, useRef } from 'react';
import { cn } from '@/lib/utils';
import { microInteractions } from '@/lib/animations/micro-interactions';

export interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'touch';
  ripple?: boolean;
  haptic?: boolean;
  children: React.ReactNode;
}

export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'default', 
    ripple = true,
    haptic = false,
    children,
    onClick,
    onTouchStart,
    onTouchEnd,
    ...props 
  }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Handle touch interactions
    const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
      if (haptic && 'vibrate' in navigator) {
        navigator.vibrate(10); // Light haptic feedback
      }
      
      if (buttonRef.current && ripple) {
        const rect = buttonRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        microInteractions.createRipple(buttonRef.current, x, y);
      }
      
      onTouchStart?.(e);
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
      if (buttonRef.current) {
        microInteractions.buttonPress(buttonRef.current);
      }
      onTouchEnd?.(e);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (buttonRef.current && ripple) {
        microInteractions.createRipple(buttonRef.current, e.clientX, e.clientY);
        microInteractions.buttonPress(buttonRef.current);
      }
      onClick?.(e);
    };

    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
      ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
      link: 'text-primary underline-offset-4 hover:underline active:text-primary/80'
    };

    const sizeClasses = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
      touch: 'h-12 px-6 py-3 min-w-[48px]' // Optimized for touch
    };

    return (
      <button
        ref={buttonRef}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'relative overflow-hidden inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium',
          'ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          'touch-manipulation select-none', // Touch optimizations
          'active:scale-95 transform', // Touch feedback
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TouchButton.displayName = 'TouchButton';

// Touch-optimized icon button
export interface TouchIconButtonProps extends Omit<TouchButtonProps, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
  label: string;
}

export const TouchIconButton = forwardRef<HTMLButtonElement, TouchIconButtonProps>(
  ({ icon, label, size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-10 w-10',
      md: 'h-12 w-12',
      lg: 'h-14 w-14'
    };

    const iconSizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    return (
      <TouchButton
        ref={ref}
        className={cn(sizeClasses[size], className)}
        aria-label={label}
        {...props}
      >
        <span className={iconSizeClasses[size]}>
          {icon}
        </span>
        <span className="sr-only">{label}</span>
      </TouchButton>
    );
  }
);

TouchIconButton.displayName = 'TouchIconButton';

// Touch-optimized floating action button
export interface TouchFABProps extends Omit<TouchButtonProps, 'variant' | 'size'> {
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  icon: React.ReactNode;
  label: string;
}

export const TouchFAB = forwardRef<HTMLButtonElement, TouchFABProps>(
  ({ 
    icon, 
    label, 
    size = 'md', 
    position = 'bottom-right',
    className,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'h-12 w-12',
      md: 'h-14 w-14',
      lg: 'h-16 w-16'
    };

    const positionClasses = {
      'bottom-right': 'fixed bottom-6 right-6',
      'bottom-left': 'fixed bottom-6 left-6',
      'top-right': 'fixed top-6 right-6',
      'top-left': 'fixed top-6 left-6'
    };

    const iconSizeClasses = {
      sm: 'h-5 w-5',
      md: 'h-6 w-6',
      lg: 'h-7 w-7'
    };

    return (
      <TouchButton
        ref={ref}
        variant="default"
        className={cn(
          'rounded-full shadow-lg hover:shadow-xl z-50',
          'transition-all duration-300 hover:scale-110',
          sizeClasses[size],
          positionClasses[position],
          className
        )}
        aria-label={label}
        haptic
        {...props}
      >
        <span className={iconSizeClasses[size]}>
          {icon}
        </span>
        <span className="sr-only">{label}</span>
      </TouchButton>
    );
  }
);

TouchFAB.displayName = 'TouchFAB';

// Touch-optimized card button
export interface TouchCardButtonProps extends Omit<TouchButtonProps, 'variant'> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export const TouchCardButton = forwardRef<HTMLButtonElement, TouchCardButtonProps>(
  ({ 
    title, 
    description, 
    icon, 
    badge,
    className,
    children,
    ...props 
  }, ref) => {
    return (
      <TouchButton
        ref={ref}
        variant="ghost"
        size="touch"
        className={cn(
          'h-auto p-4 flex-col items-start text-left space-y-2',
          'border border-border rounded-lg hover:border-primary/50',
          'transition-all duration-200 hover:shadow-md',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{title}</h3>
              {description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>
          {badge && (
            <div className="flex-shrink-0 ml-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                {badge}
              </span>
            </div>
          )}
        </div>
        {children}
      </TouchButton>
    );
  }
);

TouchCardButton.displayName = 'TouchCardButton';
