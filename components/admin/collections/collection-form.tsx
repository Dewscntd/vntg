/**
 * Collection Form Component
 *
 * Form for creating and editing product collections.
 * Used within a Sheet/Drawer for slide-in experience.
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageIcon } from 'lucide-react';
import {
  CollectionFormData,
  collectionFormSchema,
  generateSlug,
  CollectionWithProducts,
  statusConfig,
} from '@/types/collections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface CollectionFormProps {
  initialData?: CollectionWithProducts | null;
  onSubmit: (data: CollectionFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function CollectionForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: CollectionFormProps) {
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      image_url: initialData?.image_url || '',
      status: initialData?.status || 'draft',
      display_order: initialData?.display_order ?? 0,
      metadata: (initialData?.metadata as Record<string, unknown>) || {},
    },
  });

  const status = watch('status');
  const name = watch('name');
  const slug = watch('slug');

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && name && !initialData) {
      setValue('slug', generateSlug(name));
    }
  }, [name, slugManuallyEdited, setValue, initialData]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setValue('slug', generateSlug(e.target.value));
  };

  const handleFormSubmit = async (data: CollectionFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-6', className)}>
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Collection Name *</Label>
          <Input id="name" {...register('name')} placeholder="e.g., Summer Sale 2025" autoFocus />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug *</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">/collections/</span>
            <Input
              id="slug"
              value={slug}
              onChange={handleSlugChange}
              placeholder="summer-sale-2025"
              className="flex-1"
            />
          </div>
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Brief description of this collection..."
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={status}
            onValueChange={(value) => setValue('status', value as 'draft' | 'active' | 'archived')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn('text-xs', config.color)}>
                      {config.label}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            min="0"
            {...register('display_order', { valueAsNumber: true })}
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">Lower numbers appear first in listings</p>
        </div>
      </div>

      {/* Display Configuration */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ImageIcon className="h-4 w-4" />
          Display Settings
        </div>

        <div className="space-y-2">
          <Label htmlFor="image_url">Cover Image URL</Label>
          <Input id="image_url" {...register('image_url')} placeholder="https://..." />
          {errors.image_url && (
            <p className="text-sm text-destructive">{errors.image_url.message}</p>
          )}
        </div>

        {/* Preview of cover image */}
        {watch('image_url') && (
          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-md border bg-muted">
            <img
              src={watch('image_url') || ''}
              alt="Cover preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Existing Products Info */}
      {initialData && initialData.product_count > 0 && (
        <div className="rounded-md bg-muted/50 p-4 text-sm">
          <p className="text-muted-foreground">
            This collection contains{' '}
            <span className="font-medium text-foreground">
              {initialData.product_count} product{initialData.product_count !== 1 ? 's' : ''}
            </span>
            . Manage products after saving.
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 border-t pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Collection' : 'Create Collection'}
        </Button>
      </div>
    </form>
  );
}
