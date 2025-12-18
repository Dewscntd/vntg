/**
 * Text Block Section Editor - Admin Component
 *
 * Rich text editor for text block sections.
 * Uses a textarea with preview for HTML content.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextBlockSection, TextBlockConfig } from '@/types/cms';
import { textBlockConfigSchema } from '@/lib/validations/cms';
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
import { Textarea } from '@/components/ui/textarea';
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
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Eye,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextBlockSectionEditorProps {
  section: TextBlockSection;
}

// Default values to ensure all fields are controlled
const getDefaultValues = (config: TextBlockConfig): TextBlockConfig => ({
  content: config.content || '',
  alignment: config.alignment || 'center',
  maxWidth: config.maxWidth || 'lg',
  backgroundColor: config.backgroundColor || '',
  padding: {
    top: config.padding?.top ?? 48,
    bottom: config.padding?.bottom ?? 48,
    left: config.padding?.left ?? 16,
    right: config.padding?.right ?? 16,
  },
});

export function TextBlockSectionEditor({ section }: TextBlockSectionEditorProps) {
  const { updateSection } = useCMS();
  const [showPreview, setShowPreview] = useState(false);

  const form = useForm<TextBlockConfig>({
    resolver: zodResolver(textBlockConfigSchema),
    defaultValues: getDefaultValues(section.config),
  });

  // Auto-save on form changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (form.formState.isDirty) {
        updateSection(section.id, {
          config: data as TextBlockConfig,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, section.id, updateSection]);

  const insertTag = (tag: string, value?: string) => {
    const content = form.getValues('content');
    const textarea = document.getElementById('text-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let newText = '';
    switch (tag) {
      case 'bold':
        newText = `<strong>${selectedText || 'bold text'}</strong>`;
        break;
      case 'italic':
        newText = `<em>${selectedText || 'italic text'}</em>`;
        break;
      case 'link':
        newText = `<a href="${value || '#'}">${selectedText || 'link text'}</a>`;
        break;
      case 'ul':
        newText = `<ul>\n  <li>${selectedText || 'Item 1'}</li>\n  <li>Item 2</li>\n</ul>`;
        break;
      case 'ol':
        newText = `<ol>\n  <li>${selectedText || 'Item 1'}</li>\n  <li>Item 2</li>\n</ol>`;
        break;
      case 'h2':
        newText = `<h2>${selectedText || 'Heading'}</h2>`;
        break;
      case 'h3':
        newText = `<h3>${selectedText || 'Subheading'}</h3>`;
        break;
      case 'p':
        newText = `<p>${selectedText || 'Paragraph text'}</p>`;
        break;
      default:
        return;
    }

    const before = content.substring(0, start);
    const after = content.substring(end);
    form.setValue('content', before + newText + after);
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            {/* Formatting Toolbar */}
            <div className="flex flex-wrap gap-1 rounded-md border bg-muted/50 p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag('bold')}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag('italic')}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="mx-1 h-6" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag('h2')}
                title="Heading 2"
              >
                H2
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag('h3')}
                title="Heading 3"
              >
                H3
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag('p')}
                title="Paragraph"
              >
                P
              </Button>
              <Separator orientation="vertical" className="mx-1 h-6" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag('ul')}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertTag('ol')}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const url = window.prompt('Enter URL:');
                  if (url) insertTag('link', url);
                }}
                title="Link"
              >
                <Link className="h-4 w-4" />
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                variant={showPreview ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                title="Toggle Preview"
              >
                {showPreview ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            {/* Content Editor / Preview */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content (HTML)</FormLabel>
                  {showPreview ? (
                    <div
                      className="prose prose-sm min-h-[200px] max-w-none rounded-md border bg-background p-4"
                      dangerouslySetInnerHTML={{ __html: field.value }}
                    />
                  ) : (
                    <FormControl>
                      <Textarea
                        id="text-content"
                        placeholder="<p>Enter your content here...</p>"
                        rows={10}
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                  )}
                  <FormDescription>
                    Use HTML tags for formatting. Click toolbar buttons to insert tags.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Alignment */}
            <FormField
              control={form.control}
              name="alignment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text Alignment</FormLabel>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={field.value === 'left' ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => field.onChange('left')}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'center' ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => field.onChange('center')}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'right' ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => field.onChange('right')}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="space-y-4">
            <FormField
              control={form.control}
              name="maxWidth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Width</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select max width" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sm">Small (640px)</SelectItem>
                      <SelectItem value="md">Medium (768px)</SelectItem>
                      <SelectItem value="lg">Large (1024px)</SelectItem>
                      <SelectItem value="xl">Extra Large (1280px)</SelectItem>
                      <SelectItem value="full">Full Width</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Maximum width of the content area</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="backgroundColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Color</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        type="color"
                        className="h-10 w-12 p-1"
                        value={field.value || '#ffffff'}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <Input
                      placeholder="#ffffff or transparent"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => field.onChange('')}
                    >
                      Clear
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Padding</h3>

              <FormField
                control={form.control}
                name="padding.top"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Top: {field.value}px</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={200}
                        step={8}
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
                name="padding.bottom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bottom: {field.value}px</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={200}
                        step={8}
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
                name="padding.left"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Left: {field.value}px</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={200}
                        step={8}
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
                name="padding.right"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Right: {field.value}px</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={200}
                        step={8}
                        value={[field.value]}
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
