'use client';

import { useRef, useEffect, useCallback } from 'react';

export interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  pinchThreshold?: number;
  longPressDelay?: number;
  preventScroll?: boolean;
}

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export function useTouchGestures(options: TouchGestureOptions = {}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchEndRef = useRef<TouchPoint | null>(null);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialPinchDistanceRef = useRef<number>(0);

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onDoubleTap,
    onLongPress,
    swipeThreshold = 50,
    pinchThreshold = 0.1,
    longPressDelay = 500,
    preventScroll = false,
  } = options;

  // Calculate distance between two touch points
  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (preventScroll) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      };

      // Handle pinch gesture
      if (e.touches.length === 2 && onPinch) {
        initialPinchDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
      }

      // Start long press timer
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          onLongPress();
        }, longPressDelay);
      }
    },
    [preventScroll, onPinch, onLongPress, longPressDelay, getDistance]
  );

  // Handle touch move
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (preventScroll) {
        e.preventDefault();
      }

      // Cancel long press if finger moves
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      // Handle pinch gesture
      if (e.touches.length === 2 && onPinch && initialPinchDistanceRef.current > 0) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialPinchDistanceRef.current;

        if (Math.abs(scale - 1) > pinchThreshold) {
          onPinch(scale);
        }
      }
    },
    [preventScroll, onPinch, pinchThreshold, getDistance]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (preventScroll) {
        e.preventDefault();
      }

      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      touchEndRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      };

      const deltaX = touchEndRef.current.x - touchStartRef.current.x;
      const deltaY = touchEndRef.current.y - touchStartRef.current.y;
      const deltaTime = touchEndRef.current.timestamp - touchStartRef.current.timestamp;

      // Check for swipe gestures
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      } else if (absDeltaX < 10 && absDeltaY < 10 && deltaTime < 300) {
        // Tap gesture
        const now = Date.now();
        const timeSinceLastTap = now - lastTapRef.current;

        if (timeSinceLastTap < 300 && onDoubleTap) {
          // Double tap
          onDoubleTap();
          lastTapRef.current = 0; // Reset to prevent triple tap
        } else if (onTap) {
          // Single tap
          onTap();
          lastTapRef.current = now;
        }
      }

      // Reset pinch distance
      initialPinchDistanceRef.current = 0;
    },
    [
      preventScroll,
      swipeThreshold,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      onTap,
      onDoubleTap,
    ]
  );

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll });
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventScroll });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll]);

  return elementRef;
}

// Hook for swipeable carousel/slider
export function useSwipeableCarousel(options: {
  onNext?: () => void;
  onPrevious?: () => void;
  threshold?: number;
}) {
  const { onNext, onPrevious, threshold = 50 } = options;

  return useTouchGestures({
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
    swipeThreshold: threshold,
    preventScroll: true,
  });
}

// Hook for pull-to-refresh
export function usePullToRefresh(options: {
  onRefresh?: () => void;
  threshold?: number;
  enabled?: boolean;
}) {
  const { onRefresh, threshold = 100, enabled = true } = options;
  const pullDistanceRef = useRef<number>(0);
  const isRefreshingRef = useRef<boolean>(false);

  const elementRef = useTouchGestures({
    onSwipeDown: () => {
      if (enabled && !isRefreshingRef.current && pullDistanceRef.current > threshold) {
        isRefreshingRef.current = true;
        onRefresh?.();
        // Reset after refresh completes
        setTimeout(() => {
          isRefreshingRef.current = false;
          pullDistanceRef.current = 0;
        }, 1000);
      }
    },
    swipeThreshold: threshold,
    preventScroll: false,
  });

  return elementRef;
}

// Hook for dismissible cards/items
export function useDismissible(options: {
  onDismiss?: (direction: 'left' | 'right') => void;
  threshold?: number;
}) {
  const { onDismiss, threshold = 100 } = options;

  return useTouchGestures({
    onSwipeLeft: () => onDismiss?.('left'),
    onSwipeRight: () => onDismiss?.('right'),
    swipeThreshold: threshold,
    preventScroll: true,
  });
}

// Hook for zoomable images
export function useZoomable(options: {
  onZoom?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
}) {
  const { onZoom, minScale = 0.5, maxScale = 3 } = options;

  return useTouchGestures({
    onPinch: (scale) => {
      const clampedScale = Math.max(minScale, Math.min(maxScale, scale));
      onZoom?.(clampedScale);
    },
    onDoubleTap: () => {
      // Toggle between 1x and 2x zoom on double tap
      onZoom?.(2);
    },
    pinchThreshold: 0.05,
    preventScroll: true,
  });
}
