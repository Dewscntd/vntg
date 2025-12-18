/**
 * Product Carousel Section Editor - Admin Component
 *
 * Form for editing product carousel configuration.
 * Includes product picker, dynamic selection, and carousel settings.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductCarouselSection, ProductCarouselConfig } from '@/types/cms';
import { productCarouselConfigSchema } from '@/lib/validations/cms';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Plus, GripVertical } from 'lucide-react';
import { z } from 'zod';

interface ProductCarouselSectionEditorProps {
  section: ProductCarouselSection;
}

// Simplified config schema for the form (allowing empty products array during editing)
const editorConfigSchema = productCarouselConfigSchema.extend({
  products: z
    .array(
      z.object({
        product_id: z.string(),
        order: z.number().int().min(0),
      })
    )
    .optional()
    .default([]),
});

type EditorConfig = z.infer<typeof editorConfigSchema>;

export function ProductCarouselSectionEditor({ section }: ProductCarouselSectionEditorProps) {
  const { updateSection } = useCMS();
  const [newProductId, setNewProductId] = useState('');

  const form = useForm<EditorConfig>({
    resolver: zodResolver(editorConfigSchema),
    defaultValues: {
      products: section.config.products || [],
      dynamicSelection: section.config.dynamicSelection,
      itemsPerView: section.config.itemsPerView || { mobile: 1, tablet: 2, desktop: 4 },
      gap: section.config.gap || 16,
      autoplay: section.config.autoplay,
      loop: section.config.loop ?? true,
      showArrows: section.config.showArrows ?? true,
      showDots: section.config.showDots ?? true,
      animation: section.config.animation,
      cardStyle: section.config.cardStyle,
    },
  });

  const products = form.watch('products') || [];
  const dynamicEnabled = form.watch('dynamicSelection.enabled');

  // Auto-save on form changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (form.formState.isValid || form.formState.isDirty) {
        updateSection(section.id, {
          config: data as ProductCarouselConfig,
          title: section.title,
          subtitle: section.subtitle,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, section.id, section.title, section.subtitle, updateSection]);

  const addProduct = () => {
    if (!newProductId.trim()) return;
    const currentProducts = form.getValues('products') || [];
    form.setValue('products', [
      ...currentProducts,
      { product_id: newProductId.trim(), order: currentProducts.length },
    ]);
    setNewProductId('');
  };

  const removeProduct = (index: number) => {
    const currentProducts = form.getValues('products') || [];
    const updated = currentProducts.filter((_, i) => i !== index);
    form.setValue(
      'products',
      updated.map((p, i) => ({ ...p, order: i }))
    );
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Section Title & Subtitle */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Section Title</label>
            <Input
              value={section.title || ''}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
              placeholder="Featured Products"
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Subtitle</label>
            <Input
              value={section.subtitle || ''}
              onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
              placeholder="Discover our curated collection"
              className="mt-1.5"
            />
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <FormField
              control={form.control}
              name="dynamicSelection.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Dynamic Selection</FormLabel>
                    <FormDescription>Auto-select products based on criteria</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {dynamicEnabled ? (
              <div className="space-y-4 rounded-lg border p-4">
                <FormField
                  control={form.control}
                  name="dynamicSelection.source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="featured">Featured Products</SelectItem>
                          <SelectItem value="new_arrivals">New Arrivals</SelectItem>
                          <SelectItem value="best_sellers">Best Sellers</SelectItem>
                          <SelectItem value="category">By Category</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('dynamicSelection.source') === 'category' && (
                  <FormField
                    control={form.control}
                    name="dynamicSelection.categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter category UUID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="dynamicSelection.limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limit: {field.value || 8}</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={20}
                          step={1}
                          value={[field.value || 8]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dynamicSelection.sortBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort By</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sort order" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="created_at">Newest First</SelectItem>
                          <SelectItem value="price">Price</SelectItem>
                          <SelectItem value="popularity">Popularity</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter product UUID"
                    value={newProductId}
                    onChange={(e) => setNewProductId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addProduct())}
                  />
                  <Button type="button" onClick={addProduct} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {products.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No products added. Add product UUIDs above.
                    </p>
                  ) : (
                    products.map((product, index) => (
                      <div
                        key={`${product.product_id}-${index}`}
                        className="flex items-center gap-2 rounded-md border bg-muted/50 p-2"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" className="flex-1 truncate font-mono text-xs">
                          {product.product_id}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Items Per View</h3>

              <FormField
                control={form.control}
                name="itemsPerView.mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile: {field.value}</FormLabel>
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
                name="itemsPerView.tablet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tablet: {field.value}</FormLabel>
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
                name="itemsPerView.desktop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desktop: {field.value}</FormLabel>
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
              name="gap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gap: {field.value}px</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={48}
                      step={4}
                      value={[field.value || 16]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Card Style</h3>

              <FormField
                control={form.control}
                name="cardStyle.hoverEffect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hover Effect</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || 'lift'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select effect" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lift">Lift</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardStyle.showQuickView"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Quick View Button</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardStyle.showAddToCart"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Add to Cart Button</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardStyle.showWishlist"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Wishlist Button</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-4">
            <FormField
              control={form.control}
              name="showArrows"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Show Navigation Arrows</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="showDots"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Show Pagination Dots</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loop"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Infinite Loop</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Autoplay</h3>

              <FormField
                control={form.control}
                name="autoplay.enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Enable Autoplay</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch('autoplay.enabled') && (
                <FormField
                  control={form.control}
                  name="autoplay.delay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delay: {(field.value || 3000) / 1000}s</FormLabel>
                      <FormControl>
                        <Slider
                          min={1000}
                          max={10000}
                          step={500}
                          value={[field.value || 3000]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Animation</h3>

              <FormField
                control={form.control}
                name="animation.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Animation Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || 'slide'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select animation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="slide">Slide</SelectItem>
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="scale">Scale</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="animation.duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration: {field.value || 0.3}s</FormLabel>
                    <FormControl>
                      <Slider
                        min={0.1}
                        max={1}
                        step={0.1}
                        value={[field.value || 0.3]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
