'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { microInteractions } from '@/lib/animations/micro-interactions';

// Enhanced Loading Spinner with GSAP
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'secondary' | 'white';
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  color = 'primary' 
}: LoadingSpinnerProps) {
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (spinnerRef.current) {
      microInteractions.loadingSpinner(spinnerRef.current);
    }
  }, []);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    white: 'border-white'
  };

  return (
    <div
      ref={spinnerRef}
      className={cn(
        'rounded-full border-2 border-t-transparent',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

// Enhanced Loading Dots
export interface LoadingDotsProps {
  className?: string;
  color?: 'primary' | 'secondary' | 'muted';
}

export function LoadingDots({ className, color = 'primary' }: LoadingDotsProps) {
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dotsRef.current) {
      const dots = Array.from(dotsRef.current.children);
      microInteractions.loadingDots(dots);
    }
  }, []);

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    muted: 'bg-muted-foreground'
  };

  return (
    <div ref={dotsRef} className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'h-2 w-2 rounded-full',
            colorClasses[color]
          )}
        />
      ))}
    </div>
  );
}

// Enhanced Skeleton with pulse animation
export interface EnhancedSkeletonProps {
  className?: string;
  variant?: 'default' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export function EnhancedSkeleton({ 
  className, 
  variant = 'default',
  animation = 'pulse'
}: EnhancedSkeletonProps) {
  const skeletonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (skeletonRef.current && animation === 'pulse') {
      microInteractions.skeletonPulse(skeletonRef.current);
    }
  }, [animation]);

  const variantClasses = {
    default: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none'
  };

  return (
    <div
      ref={skeletonRef}
      className={cn(
        'bg-muted',
        variantClasses[variant],
        className
      )}
    />
  );
}

// Progress Bar with animation
export interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className,
  showLabel = false,
  animated = true
}: ProgressBarProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    if (progressRef.current && animated) {
      microInteractions.progressFill(progressRef.current, percentage);
    }
  }, [percentage, animated]);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          ref={progressRef}
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: animated ? '0%' : `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Loading Button with micro-interactions
export interface LoadingButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingButton({
  children,
  loading = false,
  disabled = false,
  onClick,
  className,
  variant = 'default',
  size = 'md'
}: LoadingButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (buttonRef.current && !loading && !disabled) {
      microInteractions.buttonHover(buttonRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (buttonRef.current && !loading && !disabled) {
      microInteractions.buttonLeave(buttonRef.current);
    }
  };

  const handleClick = () => {
    if (buttonRef.current && !loading && !disabled) {
      microInteractions.buttonPress(buttonRef.current);
      onClick?.();
    }
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8 text-lg'
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" color="white" />
      )}
      {children}
    </button>
  );
}

// Pulse Loading Indicator
export interface PulseLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PulseLoader({ className, size = 'md' }: PulseLoaderProps) {
  const pulseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pulseRef.current) {
      microInteractions.iconPulse(pulseRef.current);
    }
  }, []);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div
      ref={pulseRef}
      className={cn(
        'rounded-full bg-primary/20 border-2 border-primary/30',
        sizeClasses[size],
        className
      )}
    />
  );
}
