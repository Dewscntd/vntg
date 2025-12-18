/**
 * Save Template Dialog Component
 *
 * Modal dialog for saving the current homepage state as a reusable template.
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Tag, FolderOpen, Pin, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Homepage } from '@/types/cms';
import { TemplateCategory, TEMPLATE_CATEGORIES } from '@/types/cms-templates';
import { apiUrl } from '@/lib/utils/api';

// Validation schema
const saveTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug is too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().max(500, 'Description is too long').optional(),
  category: z.enum(['seasonal', 'promotional', 'editorial', 'product_launch', 'event', 'custom']),
  tags: z.array(z.string()).default([]),
  isPinned: z.boolean().default(false),
});

type SaveTemplateFormData = z.infer<typeof saveTemplateSchema>;

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homepage: Homepage;
  onSuccess?: (templateId: string) => void;
}

// Category display names
const categoryLabels: Record<TemplateCategory, string> = {
  seasonal: 'Seasonal',
  promotional: 'Promotional',
  editorial: 'Editorial',
  product_launch: 'Product Launch',
  event: 'Event',
  custom: 'Custom',
};

export function SaveTemplateDialog({
  open,
  onOpenChange,
  homepage,
  onSuccess,
}: SaveTemplateDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const form = useForm<SaveTemplateFormData>({
    resolver: zodResolver(saveTemplateSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      category: 'custom',
      tags: [],
      isPinned: false,
    },
  });

  const { register, handleSubmit, watch, setValue, formState } = form;
  const { errors, isValid } = formState;
  const tags = watch('tags');

  // Generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);

    // Auto-generate slug if slug is empty or was auto-generated
    const currentSlug = watch('slug');
    const expectedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (!currentSlug || currentSlug === expectedSlug.slice(0, -1)) {
      setValue('slug', expectedSlug);
    }
  };

  // Add tag
  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setValue('tags', [...tags, trimmedTag]);
    }
    setTagInput('');
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setValue(
      'tags',
      tags.filter((t) => t !== tagToRemove)
    );
  };

  // Handle tag input keydown
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  // Submit handler
  const onSubmit = async (data: SaveTemplateFormData) => {
    setIsSaving(true);

    try {
      const response = await fetch(apiUrl('/api/cms/templates'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          description: data.description,
          category: data.category,
          tags: data.tags,
          content: homepage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save template');
      }

      const result = await response.json();
      onSuccess?.(result.data.template.id);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving template:', error);
      // Could show toast error here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save as Template
          </DialogTitle>
          <DialogDescription>
            Save the current homepage layout as a reusable template. You can load this template
            later to quickly set up a new homepage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Template Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Holiday Sale Homepage"
              {...register('name')}
              onChange={handleNameChange}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input id="slug" placeholder="e.g., holiday-sale-homepage" {...register('slug')} />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            <p className="text-xs text-muted-foreground">
              URL-friendly identifier (lowercase, hyphens only)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this template..."
              rows={2}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-1.5">
              <FolderOpen className="h-4 w-4" />
              Category
            </Label>
            <Select
              value={watch('category')}
              onValueChange={(value) => setValue('category', value as TemplateCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {categoryLabels[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="flex items-center gap-1.5">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/20"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <span className="ml-1">\u00d7</span>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Press Enter or comma to add tags. Click a tag to remove it.
            </p>
          </div>

          {/* Pin Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPinned"
              checked={watch('isPinned')}
              onCheckedChange={(checked) => setValue('isPinned', checked === true)}
            />
            <Label htmlFor="isPinned" className="flex cursor-pointer items-center gap-1.5">
              <Pin className="h-4 w-4" />
              Pin to top of template library
            </Label>
          </div>

          {/* Section count info */}
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm">
              This template will include{' '}
              <span className="font-medium">{homepage.sections.length} sections</span>
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Template
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
