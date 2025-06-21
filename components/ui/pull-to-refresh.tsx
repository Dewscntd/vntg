'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePullToRefresh } from '@/lib/hooks/use-touch-gestures';

export interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  className?: string;
  threshold?: number;
  disabled?: boolean;
  refreshingText?: string;
  pullText?: string;
  releaseText?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  className,
  threshold = 80,
  disabled = false,
  refreshingText = 'Refreshing...',
  pullText = 'Pull to refresh',
  releaseText = 'Release to refresh'
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startYRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    if (disabled || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const touch = e.touches[0];
    startYRef.current = touch.clientY;
    
    // Only start pulling if we're at the top of the scroll container
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop === 0) {
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || isRefreshing || !isPulling) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - startYRef.current;
    
    if (deltaY > 0) {
      // Prevent default scrolling when pulling down
      e.preventDefault();
      
      // Apply resistance to the pull distance
      const resistance = 0.5;
      const distance = Math.min(deltaY * resistance, threshold * 1.5);
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (disabled || isRefreshing || !isPulling) return;

    if (pullDistance >= threshold) {
      handleRefresh();
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, isRefreshing, isPulling, pullDistance, threshold]);

  const getIndicatorText = () => {
    if (isRefreshing) return refreshingText;
    if (pullDistance >= threshold) return releaseText;
    return pullText;
  };

  const getIndicatorOpacity = () => {
    if (isRefreshing) return 1;
    return Math.min(pullDistance / threshold, 1);
  };

  const getIndicatorRotation = () => {
    if (isRefreshing) return 'animate-spin';
    if (pullDistance >= threshold) return 'rotate-180';
    return '';
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      style={{
        transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull to refresh indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-background/90 backdrop-blur-sm border-b z-10"
        style={{
          transform: `translateY(-100%)`,
          opacity: getIndicatorOpacity()
        }}
      >
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {isRefreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowDown className={cn('h-4 w-4 transition-transform', getIndicatorRotation())} />
          )}
          <span>{getIndicatorText()}</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
}

// Simplified pull-to-refresh for lists
export interface SimplePullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  className?: string;
  disabled?: boolean;
}

export function SimplePullToRefresh({
  children,
  onRefresh,
  className,
  disabled = false
}: SimplePullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pullRef = usePullToRefresh({
    onRefresh: async () => {
      if (disabled || isRefreshing) return;
      
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    },
    threshold: 100,
    enabled: !disabled
  });

  return (
    <div ref={pullRef} className={cn('relative', className)}>
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-center py-2 bg-primary/10 z-10">
          <div className="flex items-center space-x-2 text-sm text-primary">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Refreshing...</span>
          </div>
        </div>
      )}
      
      <div className={cn(isRefreshing && 'pt-10')}>
        {children}
      </div>
    </div>
  );
}

// Hook for programmatic refresh control
export function useRefreshControl() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async (refreshFn: () => Promise<void> | void) => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshFn();
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    isRefreshing,
    refresh
  };
}
