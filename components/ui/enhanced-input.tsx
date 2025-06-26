'use client';

import { forwardRef, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { microInteractions } from '@/lib/animations/micro-interactions';

// Enhanced Input with micro-interactions
export interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  animateOnFocus?: boolean;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    { className, label, error, success, icon, animateOnFocus = true, onFocus, onBlur, ...props },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (error && containerRef.current && animateOnFocus) {
        const input = containerRef.current.querySelector('input');
        if (input) {
          microInteractions.inputError(input);
        }
      }
    }, [error, animateOnFocus]);

    useEffect(() => {
      if (success && containerRef.current && animateOnFocus) {
        const input = containerRef.current.querySelector('input');
        if (input) {
          microInteractions.inputSuccess(input);
        }
      }
    }, [success, animateOnFocus]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (containerRef.current && animateOnFocus) {
        microInteractions.inputFocus(e.target);
      }
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (containerRef.current && animateOnFocus) {
        microInteractions.inputBlur(e.target);
      }
      onBlur?.(e);
    };

    return (
      <div ref={containerRef} className="relative">
        {label && (
          <label
            className={cn(
              'mb-2 block text-sm font-medium transition-colors duration-200',
              error ? 'text-destructive' : success ? 'text-green-600' : 'text-foreground'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-muted-foreground">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all duration-200',
              icon && 'pl-10',
              error && 'border-destructive focus-visible:ring-destructive',
              success && 'border-green-500 focus-visible:ring-green-500',
              className
            )}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-1 text-sm text-destructive duration-200 animate-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

// Enhanced Button with ripple effect
export interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  ripple?: boolean;
  children: React.ReactNode;
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      loading = false,
      ripple = true,
      children,
      onClick,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (buttonRef.current && ripple && !loading) {
        microInteractions.createRipple(buttonRef.current, e.clientX, e.clientY);
        microInteractions.buttonPress(buttonRef.current);
      }
      onClick?.(e);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (buttonRef.current && !loading) {
        microInteractions.buttonHover(buttonRef.current);
      }
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (buttonRef.current && !loading) {
        microInteractions.buttonLeave(buttonRef.current);
      }
      onMouseLeave?.(e);
    };

    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    };

    const sizeClasses = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };

    return (
      <button
        ref={buttonRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={loading}
        className={cn(
          'relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-md text-sm font-medium',
          'ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

// Enhanced Badge with animations
export interface EnhancedBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  animate?: boolean;
}

export function EnhancedBadge({
  children,
  variant = 'default',
  className,
  animate = true,
}: EnhancedBadgeProps) {
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (badgeRef.current && animate) {
      microInteractions.badgePopIn(badgeRef.current);
    }
  }, [animate]);

  const variantClasses = {
    default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive:
      'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'text-foreground',
  };

  return (
    <div
      ref={badgeRef}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

// Enhanced Toast notification
export interface EnhancedToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function EnhancedToast({
  title,
  description,
  variant = 'default',
  onClose,
  autoClose = true,
  duration = 5000,
}: EnhancedToastProps) {
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toastRef.current) {
      microInteractions.toastSlideIn(toastRef.current);
    }

    if (autoClose) {
      const timer = setTimeout(() => {
        if (toastRef.current) {
          microInteractions.toastSlideOut(toastRef.current).then(() => {
            onClose?.();
          });
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const variantClasses = {
    default: 'bg-background border',
    destructive: 'bg-destructive text-destructive-foreground',
    success: 'bg-green-600 text-white',
  };

  return (
    <div
      ref={toastRef}
      className={cn(
        'fixed right-4 top-4 z-50 w-full max-w-sm rounded-lg p-4 shadow-lg',
        variantClasses[variant]
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-current opacity-70 transition-opacity hover:opacity-100"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
