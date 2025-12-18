/**
 * Admin Collections Management Page
 *
 * Features:
 * - List all collections with status indicators
 * - Create new collections via slide-in sheet
 * - Edit existing collections
 * - Delete collections
 * - Filter by status
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  FolderOpen,
  Loader2,
  Search,
  MoreVertical,
  Archive,
  CheckCircle,
  FileEdit,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { CollectionForm } from '@/components/admin/collections';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CollectionWithProducts,
  CollectionFormData,
  statusConfig,
  CollectionStatusType,
} from '@/types/collections';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function CollectionsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [collections, setCollections] = useState<CollectionWithProducts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionWithProducts | null>(null);
  const [statusFilter, setStatusFilter] = useState<CollectionStatusType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch collections
  const fetchCollections = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/collections?${params}`);
      const result = await response.json();

      if (result.status === 'success') {
        setCollections(result.data.collections);
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      toast({
        title: 'Error',
        description: 'Failed to load collections',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery, toast]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Create collection
  const handleCreateCollection = async (data: CollectionFormData) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast({
          title: 'Success',
          description: 'Collection created successfully',
        });
        setShowCreateSheet(false);
        fetchCollections();
      } else {
        throw new Error(result.error || 'Failed to create collection');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create collection',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update collection
  const handleUpdateCollection = async (data: CollectionFormData) => {
    if (!editingCollection) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/collections/${editingCollection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast({
          title: 'Success',
          description: 'Collection updated successfully',
        });
        setEditingCollection(null);
        fetchCollections();
      } else {
        throw new Error(result.error || 'Failed to update collection');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update collection',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete collection
  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/collections/${collectionId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast({
          title: 'Success',
          description: 'Collection deleted successfully',
        });
        fetchCollections();
      } else {
        throw new Error(result.error || 'Failed to delete collection');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete collection',
        variant: 'destructive',
      });
    }
  };

  // Quick status change
  const handleStatusChange = async (collectionId: string, newStatus: CollectionStatusType) => {
    try {
      const response = await fetch(`/api/admin/collections/${collectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast({
          title: 'Success',
          description: `Collection status changed to ${newStatus}`,
        });
        fetchCollections();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  // Get stats
  const stats = {
    total: collections.length,
    active: collections.filter((c) => c.status === 'active').length,
    draft: collections.filter((c) => c.status === 'draft').length,
    archived: collections.filter((c) => c.status === 'archived').length,
    totalProducts: collections.reduce((sum, c) => sum + c.product_count, 0),
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Collections</h1>
            <p className="text-muted-foreground">
              Create and manage product collections and curated groups
            </p>
          </div>
          <Button onClick={() => setShowCreateSheet(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Collection
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <FileEdit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draft}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Archived</CardTitle>
              <Archive className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.archived}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as CollectionStatusType | 'all')}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Collections List */}
        <Card>
          <CardHeader>
            <CardTitle>All Collections ({collections.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : collections.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2">
                <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-muted-foreground">No collections found</p>
                <Button variant="outline" size="sm" onClick={() => setShowCreateSheet(true)}>
                  Create your first collection
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/30 transition-colors"
                  >
                    {/* Thumbnail */}
                    {collection.image_url ? (
                      <img
                        src={collection.image_url}
                        alt={collection.name}
                        className="h-16 w-24 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-24 items-center justify-center rounded bg-muted">
                        <FolderOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}

                    {/* Collection Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{collection.name}</h3>
                        <Badge
                          variant="outline"
                          className={cn('text-xs', statusConfig[collection.status].color)}
                        >
                          {statusConfig[collection.status].label}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {collection.description || 'No description'}
                      </p>

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {collection.product_count} products
                        </span>
                        <span>/collections/{collection.slug}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/collections/${collection.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Manage
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingCollection(collection)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/collections/${collection.id}`)}
                          >
                            <Package className="mr-2 h-4 w-4" />
                            Manage Products
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {collection.status !== 'active' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(collection.id, 'active')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Set Active
                            </DropdownMenuItem>
                          )}
                          {collection.status !== 'draft' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(collection.id, 'draft')}
                            >
                              <FileEdit className="mr-2 h-4 w-4" />
                              Set as Draft
                            </DropdownMenuItem>
                          )}
                          {collection.status !== 'archived' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(collection.id, 'archived')}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteCollection(collection.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Collection Sheet */}
        <Sheet open={showCreateSheet} onOpenChange={setShowCreateSheet}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Create New Collection</SheetTitle>
              <SheetDescription>
                Create a new product collection. You can add products after creating it.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <CollectionForm
                onSubmit={handleCreateCollection}
                onCancel={() => setShowCreateSheet(false)}
                isLoading={isSaving}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Edit Collection Sheet */}
        <Sheet open={!!editingCollection} onOpenChange={() => setEditingCollection(null)}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Collection</SheetTitle>
              <SheetDescription>Update collection details</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              {editingCollection && (
                <CollectionForm
                  initialData={editingCollection}
                  onSubmit={handleUpdateCollection}
                  onCancel={() => setEditingCollection(null)}
                  isLoading={isSaving}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </AdminLayout>
  );
}
