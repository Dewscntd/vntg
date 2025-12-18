/**
 * Campaign Form Component
 *
 * Form for creating and editing campaigns.
 * Features:
 * - Campaign metadata (name, description, type, status)
 * - Product selection via ProductPicker
 * - Date scheduling
 * - Display configuration
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Image as ImageIcon } from 'lucide-react';
import { CampaignFormData, CampaignType, CampaignStatus } from '@/types/shop';
import { ProductPicker } from './product-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface CampaignFormProps {
  initialData?: Partial<CampaignFormData>;
  onSubmit: (data: CampaignFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

const campaignTypes: { value: CampaignType; label: string }[] = [
  { value: 'sale', label: 'Sale / Promotion' },
  { value: 'collection', label: 'Product Collection' },
  { value: 'editorial', label: 'Editorial / Story' },
  { value: 'seasonal', label: 'Seasonal Collection' },
  { value: 'new-arrivals', label: 'New Arrivals' },
];

const campaignStatuses: { value: CampaignStatus; label: string; description: string }[] = [
  { value: 'draft', label: 'Draft', description: 'Not visible to customers' },
  { value: 'scheduled', label: 'Scheduled', description: 'Will go live on start date' },
  { value: 'active', label: 'Active', description: 'Currently visible to customers' },
  { value: 'expired', label: 'Expired', description: 'Past end date' },
  { value: 'archived', label: 'Archived', description: 'Hidden from all lists' },
];

export function CampaignForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: CampaignFormProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    initialData?.product_ids || []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CampaignFormData>({
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      type: initialData?.type || 'collection',
      status: initialData?.status || 'draft',
      product_ids: initialData?.product_ids || [],
      start_date: initialData?.start_date || '',
      end_date: initialData?.end_date || '',
      banner_image_url: initialData?.banner_image_url || '',
      thumbnail_url: initialData?.thumbnail_url || '',
      theme_color: initialData?.theme_color || '#000000',
      is_featured: initialData?.is_featured || false,
      show_on_homepage: initialData?.show_on_homepage || false,
    },
  });

  const campaignType = watch('type');
  const campaignStatus = watch('status');
  const isFeatured = watch('is_featured');
  const showOnHomepage = watch('show_on_homepage');

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setValue('slug', slug);
  };

  // Handle form submission
  const handleFormSubmit = async (data: CampaignFormData) => {
    await onSubmit({
      ...data,
      product_ids: selectedProducts,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-6', className)}>
      {/* Basic Information */}
      <div className="space-y-4 rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold">Basic Information</h3>

        <div className="space-y-2">
          <Label htmlFor="name">Campaign Name *</Label>
          <Input
            id="name"
            {...register('name', { required: 'Campaign name is required' })}
            onChange={(e) => {
              register('name').onChange(e);
              handleNameChange(e.target.value);
            }}
            placeholder="e.g., Fall Winter 2025 Collection"
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug *</Label>
          <Input
            id="slug"
            {...register('slug', { required: 'Slug is required' })}
            placeholder="e.g., fall-winter-2025"
          />
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Brief description of this campaign..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">Campaign Type *</Label>
            <Select
              value={campaignType}
              onValueChange={(value) => setValue('type', value as CampaignType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {campaignTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={campaignStatus}
              onValueChange={(value) => setValue('status', value as CampaignStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {campaignStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div>
                      <div className="font-medium">{status.label}</div>
                      <div className="text-xs text-muted-foreground">{status.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Product Selection */}
      <div className="space-y-4 rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold">Products</h3>
        <ProductPicker
          selectedProductIds={selectedProducts}
          onSelectionChange={setSelectedProducts}
        />
      </div>

      {/* Scheduling */}
      <div className="space-y-4 rounded-lg border border-border p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Calendar className="h-5 w-5" />
          Scheduling (Optional)
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input id="start_date" type="datetime-local" {...register('start_date')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input id="end_date" type="datetime-local" {...register('end_date')} />
          </div>
        </div>
      </div>

      {/* Display Configuration */}
      <div className="space-y-4 rounded-lg border border-border p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <ImageIcon className="h-5 w-5" />
          Display Configuration
        </h3>

        <div className="space-y-2">
          <Label htmlFor="banner_image_url">Banner Image URL</Label>
          <Input
            id="banner_image_url"
            {...register('banner_image_url')}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
          <Input id="thumbnail_url" {...register('thumbnail_url')} placeholder="https://..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme_color">Theme Color</Label>
          <div className="flex gap-2">
            <Input id="theme_color" type="color" {...register('theme_color')} className="w-20" />
            <Input {...register('theme_color')} placeholder="#000000" className="flex-1" />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_featured"
              checked={isFeatured}
              onCheckedChange={(checked) => setValue('is_featured', checked as boolean)}
            />
            <Label htmlFor="is_featured" className="cursor-pointer">
              Featured Campaign (highlight in admin lists)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show_on_homepage"
              checked={showOnHomepage}
              onCheckedChange={(checked) => setValue('show_on_homepage', checked as boolean)}
            />
            <Label htmlFor="show_on_homepage" className="cursor-pointer">
              Show on Homepage
            </Label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading || selectedProducts.length === 0}>
          {isLoading ? 'Saving...' : 'Save Campaign'}
        </Button>
      </div>

      {selectedProducts.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Please select at least one product to create a campaign
        </p>
      )}
    </form>
  );
}
