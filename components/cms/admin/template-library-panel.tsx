/**
 * Template Library Panel Component
 *
 * Displays a searchable, filterable library of saved templates
 * with options to load, edit, duplicate, or delete templates.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Grid3X3,
  List,
  FolderOpen,
  MoreVertical,
  FileText,
  Edit,
  Copy,
  Trash2,
  Upload,
  Clock,
  Eye,
  Pin,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
  CMSTemplate,
  TemplateCategory,
  TemplateStatus,
  TEMPLATE_CATEGORIES,
} from '@/types/cms-templates';
import { apiUrl } from '@/lib/utils/api';

interface TemplateLibraryPanelProps {
  onLoadTemplate: (templateId: string) => void;
  onClose?: () => void;
  className?: string;
}

// Category display names and colors
const categoryConfig: Record<
  TemplateCategory,
  { label: string; color: string }
> = {
  seasonal: { label: 'Seasonal', color: 'bg-orange-100 text-orange-800' },
  promotional: { label: 'Promotional', color: 'bg-pink-100 text-pink-800' },
  editorial: { label: 'Editorial', color: 'bg-blue-100 text-blue-800' },
  product_launch: { label: 'Product Launch', color: 'bg-green-100 text-green-800' },
  event: { label: 'Event', color: 'bg-purple-100 text-purple-800' },
  custom: { label: 'Custom', color: 'bg-gray-100 text-gray-800' },
};

// Status display config
const statusConfig: Record<TemplateStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
  review: { label: 'In Review', color: 'bg-blue-100 text-blue-800' },
  scheduled: { label: 'Scheduled', color: 'bg-purple-100 text-purple-800' },
  published: { label: 'Published', color: 'bg-green-100 text-green-800' },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-800' },
};

// Format relative time
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export function TemplateLibraryPanel({
  onLoadTemplate,
  onClose,
  className,
}: TemplateLibraryPanelProps) {
  const [templates, setTemplates] = useState<CMSTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(apiUrl(`/api/cms/templates?${params}`));
      if (!response.ok) throw new Error('Failed to fetch templates');

      const data = await response.json();
      setTemplates(data.data?.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Handle template deletion
  const handleDelete = async (templateId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(apiUrl(`/api/cms/templates/${templateId}`), {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete template');

      // Remove from local state
      setTemplates(templates.filter((t) => t.id !== templateId));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting template:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle duplicate
  const handleDuplicate = async (template: CMSTemplate) => {
    try {
      const response = await fetch(apiUrl(`/api/cms/templates/${template.id}/duplicate`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          slug: `${template.slug}-copy-${Date.now()}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to duplicate template');

      // Refresh list
      fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  // Filter templates locally for immediate feedback
  const filteredTemplates = templates.filter((template) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = template.name.toLowerCase().includes(query);
      const matchesDesc = template.description?.toLowerCase().includes(query);
      const matchesTags = template.tags.some((t) => t.toLowerCase().includes(query));
      if (!matchesName && !matchesDesc && !matchesTags) return false;
    }
    return true;
  });

  return (
    <div className={cn('flex h-full flex-col bg-background', className)}>
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium">Template Library</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchTemplates}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 border-b px-4 py-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2">
          <Select
            value={categoryFilter}
            onValueChange={(v) => setCategoryFilter(v as TemplateCategory | 'all')}
          >
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {TEMPLATE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {categoryConfig[cat].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as TemplateStatus | 'all')}
          >
            <SelectTrigger className="h-8 w-28">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Template List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm font-medium">No templates found</p>
              <p className="text-xs text-muted-foreground">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Save your first template to get started'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onLoad={() => onLoadTemplate(template.id)}
                  onEdit={() => {
                    /* TODO: Open edit dialog */
                  }}
                  onDuplicate={() => handleDuplicate(template)}
                  onDelete={() => setDeleteConfirmId(template.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTemplates.map((template) => (
                <TemplateListItem
                  key={template.id}
                  template={template}
                  onLoad={() => onLoadTemplate(template.id)}
                  onEdit={() => {
                    /* TODO: Open edit dialog */
                  }}
                  onDuplicate={() => handleDuplicate(template)}
                  onDelete={() => setDeleteConfirmId(template.id)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Template Card Component (Grid View)
interface TemplateCardProps {
  template: CMSTemplate;
  onLoad: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function TemplateCard({ template, onLoad, onEdit, onDuplicate, onDelete }: TemplateCardProps) {
  return (
    <div className="group relative rounded-lg border bg-card p-4 transition-shadow hover:shadow-md">
      {/* Pinned indicator */}
      {(template.metadata?.is_pinned as boolean) && (
        <Pin className="absolute right-2 top-2 h-4 w-4 text-primary" />
      )}

      {/* Thumbnail placeholder */}
      <div className="mb-3 flex h-24 items-center justify-center rounded-md bg-muted">
        {template.thumbnail_url ? (
          <img
            src={template.thumbnail_url}
            alt={template.name}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          <FileText className="h-10 w-10 text-muted-foreground/50" />
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="font-medium leading-tight truncate">{template.name}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onLoad}>
                <Upload className="mr-2 h-4 w-4" />
                Load Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {template.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="secondary"
            className={cn('text-[10px]', categoryConfig[template.category]?.color)}
          >
            {categoryConfig[template.category]?.label}
          </Badge>
          <Badge
            variant="secondary"
            className={cn('text-[10px]', statusConfig[template.status]?.color)}
          >
            {statusConfig[template.status]?.label}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(template.updated_at)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {template.view_count}
          </span>
        </div>
      </div>

      {/* Load button overlay on hover */}
      <Button
        size="sm"
        className="absolute bottom-4 left-4 right-4 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={onLoad}
      >
        <Upload className="mr-2 h-4 w-4" />
        Load Template
      </Button>
    </div>
  );
}

// Template List Item Component (List View)
function TemplateListItem({
  template,
  onLoad,
  onEdit,
  onDuplicate,
  onDelete,
}: TemplateCardProps) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent">
      {/* Thumbnail */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
        {template.thumbnail_url ? (
          <img
            src={template.thumbnail_url}
            alt={template.name}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          <FileText className="h-6 w-6 text-muted-foreground/50" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium truncate">{template.name}</h4>
          {(template.metadata?.is_pinned as boolean) && <Pin className="h-3 w-3 text-primary" />}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge
            variant="secondary"
            className={cn('text-[10px]', categoryConfig[template.category]?.color)}
          >
            {categoryConfig[template.category]?.label}
          </Badge>
          <span>{formatRelativeTime(template.updated_at)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100"
          onClick={onLoad}
        >
          <Upload className="mr-1 h-4 w-4" />
          Load
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
