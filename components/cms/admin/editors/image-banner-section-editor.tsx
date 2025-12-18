/**
 * Image Banner Section Editor - Admin Component
 *
 * Form for editing image banner configuration.
 * Includes image URLs, alt text, link, and display settings.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageBannerSection, ImageBannerConfig } from '@/types/cms';
import { imageBannerConfigSchema } from '@/lib/validations/cms';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageIcon, Monitor, Smartphone, ExternalLink } from 'lucide-react';
import { z } from 'zod';

interface ImageBannerSectionEditorProps {
  section: ImageBannerSection;
}

// Relaxed schema for editing (allow empty image during editing)
const editorConfigSchema = imageBannerConfigSchema.extend({
  image: z.string().optional().default(''),
  alt: z.string().optional().default(''),
});

type EditorConfig = z.infer<typeof editorConfigSchema>;

export function ImageBannerSectionEditor({ section }: ImageBannerSectionEditorProps) {
  const { updateSection } = useCMS();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<EditorConfig>({
    resolver: zodResolver(editorConfigSchema),
    defaultValues: {
      image: section.config.image || '',
      mobileImage: section.config.mobileImage || '',
      alt: section.config.alt || '',
      link: section.config.link || '',
      height: section.config.height || 'md',
      objectFit: section.config.objectFit || 'cover',
    },
  });

  const imageUrl = form.watch('image');

  // Update preview when image URL changes
  useEffect(() => {
    if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/'))) {
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
  }, [imageUrl]);

  // Auto-save on form changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (form.formState.isDirty) {
        updateSection(section.id, {
          config: data as ImageBannerConfig,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, section.id, updateSection]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <Tabs defaultValue="image" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="image">Image</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
          </TabsList>

          {/* Image Tab */}
          <TabsContent value="image" className="space-y-4">
            {/* Image Preview */}
            {imagePreview ? (
              <div className="relative aspect-[21/9] bg-muted rounded-md overflow-hidden border">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setImagePreview(null)}
                />
              </div>
            ) : (
              <div className="aspect-[21/9] bg-muted rounded-md border flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Enter an image URL below</p>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Desktop Image URL *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/banner.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Main banner image (required)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobileImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile Image URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/banner-mobile.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional image for mobile devices. Uses desktop image if not set.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alt Text *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descriptive text for the image"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describes the image for screen readers and SEO
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Link URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="/shop/collection or https://..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional link when banner is clicked
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display" className="space-y-4">
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Height</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select height" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sm">Small (200px)</SelectItem>
                      <SelectItem value="md">Medium (300px)</SelectItem>
                      <SelectItem value="lg">Large (400px)</SelectItem>
                      <SelectItem value="xl">Extra Large (500px)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Height of the banner section</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="objectFit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Fit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fit mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cover">Cover (fills container, may crop)</SelectItem>
                      <SelectItem value="contain">Contain (fits entire image)</SelectItem>
                      <SelectItem value="fill">Fill (stretches to fit)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How the image should fit within the banner
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visual Reference for Fit Modes */}
            <div className="grid grid-cols-3 gap-2 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="aspect-video bg-background rounded border mb-1 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40" style={{ objectFit: 'cover' }} />
                </div>
                <span className="text-xs text-muted-foreground">Cover</span>
              </div>
              <div className="text-center">
                <div className="aspect-video bg-background rounded border mb-1 flex items-center justify-center">
                  <div className="w-2/3 h-2/3 bg-gradient-to-br from-primary/20 to-primary/40 rounded" />
                </div>
                <span className="text-xs text-muted-foreground">Contain</span>
              </div>
              <div className="text-center">
                <div className="aspect-video bg-background rounded border mb-1 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 scale-x-125" />
                </div>
                <span className="text-xs text-muted-foreground">Fill</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
