'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/lib/context/favorites-context';
import { useToast } from '@/lib/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface FavoriteButtonProps {
  productId: string;
  productName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'overlay';
}

export function FavoriteButton({
  productId,
  productName,
  className,
  size = 'md',
  variant = 'default',
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const { toast } = useToast();
  const [isToggling, setIsToggling] = useState(false);

  const favorited = isFavorite(productId);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isToggling || isLoading) return;

    setIsToggling(true);

    try {
      await toggleFavorite(productId);

      toast({
        title: favorited ? 'Removed from favorites' : 'Added to favorites',
        description: productName
          ? favorited
            ? `${productName} removed from your favorites`
            : `${productName} added to your favorites`
          : undefined,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorites. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsToggling(false);
    }
  };

  if (variant === 'overlay') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isToggling || isLoading}
        className={cn(
          'flex items-center justify-center rounded-full bg-white/90 p-2 shadow-md backdrop-blur-sm transition-all',
          'hover:scale-110 hover:bg-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          className={cn(
            iconSizes[size],
            'transition-colors',
            favorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
          )}
        />
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isToggling || isLoading}
      className={cn(sizeClasses[size], className)}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(
          iconSizes[size],
          'transition-colors',
          favorited ? 'fill-red-500 text-red-500' : ''
        )}
      />
    </Button>
  );
}
