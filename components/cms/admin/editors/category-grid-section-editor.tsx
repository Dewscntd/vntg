/**
 * Category Grid Section Editor - Admin Component
 *
 * Form for editing category grid configuration.
 * Includes category selection, layout settings, and styling options.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CategoryGridSection, CategoryGridConfig } from '@/types/cms';
import { categoryGridConfigSchema } from '@/lib/validations/cms';
import { useCMS } from '@/lib/context/cms-context';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Plus, GripVertical, ImageIcon, Edit2 } from 'lucide-react';
import { z } from 'zod';

interface CategoryGridSectionEditorProps {
  section: CategoryGridSection;
}

// Relaxed schema for editing (allow empty categories during editing)
const editorConfigSchema = categoryGridConfigSchema.extend({
  categories: z.array(
    z.object({
      category_id: z.string(),
      order: z.number().int().min(0),
      customImage: z.string().optional(),
      customTitle: z.string().optional(),
    })
  ).optional().default([]),
});

type EditorConfig = z.infer<typeof editorConfigSchema>;

interface CategoryItem {
  category_id: string;
  order: number;
  customImage?: string;
  customTitle?: string;
}

export function CategoryGridSectionEditor({ section }: CategoryGridSectionEditorProps) {
  const { updateSection } = useCMS();
  const [newCategoryId, setNewCategoryId] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const form = useForm<EditorConfig>({
    resolver: zodResolver(editorConfigSchema),
    defaultValues: {
      title: section.config.title || '',
      categories: section.config.categories || [],
      columns: section.config.columns || { mobile: 2, tablet: 3, desktop: 4 },
      cardStyle: section.config.cardStyle || 'overlay',
    },
  });

  const categories = form.watch('categories') || [];

  // Auto-save on form changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (form.formState.isDirty) {
        updateSection(section.id, {
          config: data as CategoryGridConfig,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, section.id, updateSection]);

  const addCategory = () => {
    if (!newCategoryId.trim()) return;
    const currentCategories = form.getValues('categories') || [];
    form.setValue('categories', [
      ...currentCategories,
      { category_id: newCategoryId.trim(), order: currentCategories.length },
    ]);
    setNewCategoryId('');
  };

  const removeCategory = (index: number) => {
    const currentCategories = form.getValues('categories') || [];
    const updated = currentCategories.filter((_, i) => i !== index);
    form.setValue('categories', updated.map((c, i) => ({ ...c, order: i })));
  };

  const updateCategoryField = (
    index: number,
    field: 'customImage' | 'customTitle',
    value: string
  ) => {
    const currentCategories = form.getValues('categories') || [];
    const updated = [...currentCategories];
    updated[index] = { ...updated[index], [field]: value || undefined };
    form.setValue('categories', updated);
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Section Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section Title</FormLabel>
              <FormControl>
                <Input placeholder="Shop by Category" {...field} />
              </FormControl>
              <FormDescription>Optional heading above the grid</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter category UUID"
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
              />
              <Button type="button" onClick={addCategory} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {categories.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed rounded-lg">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No categories added yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add category UUIDs above to build your grid
                  </p>
                </div>
              ) : (
                categories.map((category, index) => (
                  <div
                    key={`${category.category_id}-${index}`}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center gap-2 p-3 bg-muted/30">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <Badge variant="outline" className="font-mono text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-mono text-xs flex-1 truncate">
                        {category.category_id}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditingCategory(
                            editingCategory === category.category_id
                              ? null
                              : category.category_id
                          )
                        }
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCategory(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {editingCategory === category.category_id && (
                      <div className="p-3 space-y-3 border-t bg-background">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Custom Title (optional)
                          </label>
                          <Input
                            placeholder="Override category name"
                            value={category.customTitle || ''}
                            onChange={(e) =>
                              updateCategoryField(index, 'customTitle', e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Custom Image URL (optional)
                          </label>
                          <Input
                            placeholder="https://example.com/category.jpg"
                            value={category.customImage || ''}
                            onChange={(e) =>
                              updateCategoryField(index, 'customImage', e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Columns Per Row</h3>

              <FormField
                control={form.control}
                name="columns.mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile: {field.value} columns</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={3}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="columns.tablet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tablet: {field.value} columns</FormLabel>
                    <FormControl>
                      <Slider
                        min={2}
                        max={4}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="columns.desktop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desktop: {field.value} columns</FormLabel>
                    <FormControl>
                      <Slider
                        min={3}
                        max={6}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="cardStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Style</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="overlay">Overlay (text on image)</SelectItem>
                      <SelectItem value="below">Below (text under image)</SelectItem>
                      <SelectItem value="minimal">Minimal (clean, simple)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>How category cards are displayed</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Card Style Preview */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg relative overflow-hidden mb-1">
                  <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-3">
                    <span className="text-white text-xs font-medium">Title</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Overlay</span>
              </div>
              <div className="text-center">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg mb-1" />
                <span className="text-xs font-medium">Title</span>
                <br />
                <span className="text-xs text-muted-foreground">Below</span>
              </div>
              <div className="text-center">
                <div className="aspect-square bg-muted rounded-lg border mb-1 flex items-center justify-center">
                  <span className="text-xs">Title</span>
                </div>
                <span className="text-xs text-muted-foreground">Minimal</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
