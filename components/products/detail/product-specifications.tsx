'use client';

import { Shirt, Palette, Package, Star, Tag, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  getMaterialDisplayName, 
  getConditionDisplayName,
  CONDITIONS 
} from '@/lib/data/product-options';
import { israeliBrands, getBrandDisplayName } from '@/lib/data/israeli-brands';
import { useTranslations } from '@/lib/hooks/use-translations';

interface ProductSpecificationsProps {
  specifications: {
    size?: string;
    condition?: string;
    brand?: string;
    materials?: string; // Comma-separated string from DB
  };
  className?: string;
  compact?: boolean;
}

export function ProductSpecifications({ 
  specifications, 
  className, 
  compact = false 
}: ProductSpecificationsProps) {
  const { isHebrew } = useTranslations();

  if (!specifications || Object.keys(specifications).length === 0) {
    return null;
  }

  // Parse materials string back to array
  const materials = specifications.materials
    ? specifications.materials.split(',').map(m => m.trim()).filter(Boolean)
    : [];

  // Find brand details
  const brandDetails = specifications.brand 
    ? israeliBrands.find(b => b.name === specifications.brand)
    : null;

  // Find condition details
  const conditionDetails = specifications.condition
    ? CONDITIONS.find(c => c.value === specifications.condition)
    : null;

  const specs = [
    {
      key: 'size',
      label: isHebrew ? 'מידה' : 'Size',
      value: specifications.size,
      icon: Ruler,
      color: 'blue',
      show: !!specifications.size,
    },
    {
      key: 'condition',
      label: isHebrew ? 'מצב' : 'Condition',
      value: conditionDetails 
        ? getConditionDisplayName(specifications.condition!, isHebrew)
        : specifications.condition,
      description: conditionDetails?.description,
      icon: Star,
      color: getConditionColor(specifications.condition),
      show: !!specifications.condition,
    },
    {
      key: 'brand',
      label: isHebrew ? 'מותג' : 'Brand',
      value: brandDetails 
        ? getBrandDisplayName(brandDetails, isHebrew)
        : specifications.brand,
      icon: Tag,
      color: brandDetails?.popular ? 'yellow' : 'gray',
      show: !!specifications.brand,
    },
    {
      key: 'materials',
      label: isHebrew ? 'חומרים' : 'Materials',
      value: materials,
      icon: Shirt,
      color: 'green',
      show: materials.length > 0,
    },
  ].filter(spec => spec.show);

  if (specs.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {specs.map((spec) => (
          <div key={spec.key} className="flex items-center gap-1">
            <spec.icon className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {spec.label}:
            </span>
            {spec.key === 'materials' ? (
              <div className="flex flex-wrap gap-1">
                {(spec.value as string[]).map((material, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="h-5 text-xs"
                  >
                    {getMaterialDisplayName(material, isHebrew)}
                  </Badge>
                ))}
              </div>
            ) : (
              <Badge 
                variant="outline"
                className={cn(
                  'h-5 text-xs',
                  getSpecBadgeColor(spec.color)
                )}
              >
                {spec.value}
              </Badge>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5" />
          {isHebrew ? 'מפרט המוצר' : 'Product Specifications'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {specs.map((spec, index) => (
          <div key={spec.key}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <spec.icon className={cn(
                  'h-4 w-4 flex-shrink-0',
                  getSpecIconColor(spec.color)
                )} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {spec.label}
                    </span>
                  </div>
                  {spec.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {spec.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 items-center">
                {spec.key === 'materials' ? (
                  (spec.value as string[]).map((material, materialIndex) => (
                    <Badge 
                      key={materialIndex}
                      variant="secondary"
                      className={cn(
                        'text-xs',
                        getSpecBadgeColor(spec.color)
                      )}
                    >
                      {getMaterialDisplayName(material, isHebrew)}
                    </Badge>
                  ))
                ) : (
                  <Badge 
                    variant="secondary"
                    className={cn(
                      'text-xs font-medium',
                      getSpecBadgeColor(spec.color)
                    )}
                  >
                    {spec.value}
                    {spec.key === 'brand' && brandDetails?.popular && (
                      <Star className="h-3 w-3 ml-1 fill-current" />
                    )}
                  </Badge>
                )}
              </div>
            </div>
            
            {index < specs.length - 1 && (
              <Separator className="mt-4" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function getConditionColor(condition?: string): string {
  switch (condition) {
    case 'excellent': return 'green';
    case 'very-good': return 'blue';
    case 'good': return 'yellow';
    case 'fair': return 'orange';
    case 'vintage': return 'purple';
    default: return 'gray';
  }
}

function getSpecIconColor(color: string): string {
  switch (color) {
    case 'green': return 'text-green-600 dark:text-green-400';
    case 'blue': return 'text-blue-600 dark:text-blue-400';
    case 'yellow': return 'text-yellow-600 dark:text-yellow-400';
    case 'orange': return 'text-orange-600 dark:text-orange-400';
    case 'purple': return 'text-purple-600 dark:text-purple-400';
    case 'red': return 'text-red-600 dark:text-red-400';
    default: return 'text-muted-foreground';
  }
}

function getSpecBadgeColor(color: string): string {
  switch (color) {
    case 'green': return 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300';
    case 'blue': return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300';
    case 'yellow': return 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300';
    case 'orange': return 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300';
    case 'purple': return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300';
    case 'red': return 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300';
    default: return '';
  }
}

export default ProductSpecifications;