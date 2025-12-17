/**
 * Grid Layout Toggle Component
 *
 * Minimalist toggle for switching between grid (2/4 columns) and list layouts.
 * Persists user preference to localStorage.
 */

'use client';

import { useEffect, useState } from 'react';
import { LayoutGrid, Grid3X3, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GridLayout } from '@/types/shop';
import { Button } from '@/components/ui/button';

interface GridLayoutToggleProps {
  value: GridLayout;
  onChange: (layout: GridLayout) => void;
  className?: string;
}

export function GridLayoutToggle({ value, onChange, className }: GridLayoutToggleProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Placeholder skeleton - must match exact structure of actual component
    return (
      <div className={cn('flex items-center gap-0.5', className)}>
        <div className="h-8 w-8 rounded-sm border border-border" />
        <div className="h-8 w-8 rounded-sm border border-border" />
        <div className="h-8 w-8 rounded-sm border border-border" />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {/* List View */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange('list')}
        className={cn(
          'h-8 w-8 rounded-sm',
          value === 'list'
            ? 'bg-foreground text-background hover:bg-foreground/90 hover:text-background'
            : 'hover:bg-muted'
        )}
        aria-label="List view"
        aria-pressed={value === 'list'}
      >
        <List className="h-4 w-4" />
      </Button>

      {/* 2 Columns Grid */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(2)}
        className={cn(
          'h-8 w-8 rounded-sm',
          value === 2
            ? 'bg-foreground text-background hover:bg-foreground/90 hover:text-background'
            : 'hover:bg-muted'
        )}
        aria-label="2 columns"
        aria-pressed={value === 2}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>

      {/* 4 Columns Grid */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(4)}
        className={cn(
          'h-8 w-8 rounded-sm',
          value === 4
            ? 'bg-foreground text-background hover:bg-foreground/90 hover:text-background'
            : 'hover:bg-muted'
        )}
        aria-label="4 columns"
        aria-pressed={value === 4}
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
    </div>
  );
}
