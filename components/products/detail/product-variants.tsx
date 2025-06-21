'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export type VariantType = 'color' | 'size' | 'material' | 'style';

export interface Variant {
  id: string;
  name: string;
  type: VariantType;
  value: string;
  available: boolean;
  meta?: {
    color?: string;
    image?: string;
  };
}

export interface VariantGroup {
  type: VariantType;
  name: string;
  variants: Variant[];
}

export interface ProductVariantsProps {
  variantGroups: VariantGroup[];
  selectedVariants: Record<VariantType, string>;
  onChange: (type: VariantType, variantId: string) => void;
  className?: string;
}

export function ProductVariants({
  variantGroups,
  selectedVariants,
  onChange,
  className,
}: ProductVariantsProps) {
  if (!variantGroups || variantGroups.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {variantGroups.map((group) => (
        <div key={group.type} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{group.name}</h3>
            {selectedVariants[group.type] && (
              <span className="text-xs text-muted-foreground">
                {group.variants.find((v) => v.id === selectedVariants[group.type])?.value}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {group.type === 'color' ? (
              <ColorVariants
                variants={group.variants}
                selectedId={selectedVariants[group.type]}
                onChange={(variantId) => onChange(group.type, variantId)}
              />
            ) : (
              <DefaultVariants
                variants={group.variants}
                selectedId={selectedVariants[group.type]}
                onChange={(variantId) => onChange(group.type, variantId)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedId: string;
  onChange: (variantId: string) => void;
}

function ColorVariants({ variants, selectedId, onChange }: VariantSelectorProps) {
  return (
    <>
      {variants.map((variant) => {
        const isSelected = variant.id === selectedId;
        const colorStyle = variant.meta?.color || '#CCCCCC';

        return (
          <button
            key={variant.id}
            className={cn(
              'group relative h-9 w-9 overflow-hidden rounded-full border-2 transition-all',
              isSelected
                ? 'border-primary ring-1 ring-primary'
                : 'border-transparent hover:border-muted-foreground/25',
              !variant.available && 'cursor-not-allowed opacity-50'
            )}
            style={{ backgroundColor: colorStyle }}
            onClick={() => variant.available && onChange(variant.id)}
            disabled={!variant.available}
            title={variant.value}
            aria-label={`Select ${variant.value} color`}
          >
            {isSelected && (
              <span className="absolute inset-0 flex items-center justify-center text-white">
                <Check className="h-4 w-4" />
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}

function DefaultVariants({ variants, selectedId, onChange }: VariantSelectorProps) {
  return (
    <>
      {variants.map((variant) => {
        const isSelected = variant.id === selectedId;

        return (
          <button
            key={variant.id}
            className={cn(
              'min-w-[3rem] rounded-md border px-3 py-2 text-sm transition-all',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background hover:bg-muted',
              !variant.available && 'cursor-not-allowed opacity-50'
            )}
            onClick={() => variant.available && onChange(variant.id)}
            disabled={!variant.available}
          >
            {variant.value}
          </button>
        );
      })}
    </>
  );
}
