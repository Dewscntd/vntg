/**
 * Admin Collection Detail Page
 *
 * Features:
 * - View and edit collection details
 * - Manage products in collection
 * - Reorder products
 * - Add/remove products
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  Loader2,
  CheckCircle,
  FileEdit,
  Archive,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { CollectionForm, CollectionProductManager } from '@/components/admin/collections';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  CollectionWithProducts,
  CollectionFormData,
  CollectionProductWithDetails,
  statusConfig,
  CollectionStatusType,
} from '@/types/collections';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function CollectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<CollectionWithProducts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);

  // Fetch collection
  const fetchCollection = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/collections/${collectionId}`);
      const result = await response.json();

      if (result.status === 'success') {
        setCollection(result.data);
      } else {
        throw new Error(result.error || 'Collection not found');
      }
    } catch (error) {
      console.error('Failed to fetch collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to load collection',
        variant: 'destructive',
      });
      router.push('/admin/collections');
    } finally {
      setIsLoading(false);
    }
  }, [collectionId, router, toast]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  // Update collection
  const handleUpdateCollection = async (data: CollectionFormData) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/collections/${collectionId}`, {
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
        setShowEditSheet(false);
        fetchCollection();
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
  const handleDeleteCollection = async () => {
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
        router.push('/admin/collections');
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

  // Change status
  const handleStatusChange = async (newStatus: CollectionStatusType) => {
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
        fetchCollection();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  // Update products in local state
  const handleProductsChange = (products: CollectionProductWithDetails[]) => {
    if (collection) {
      setCollection({
        ...collection,
        products,
        product_count: products.length,
      });
    }
  };

  // Save product order
  const handleSaveOrder = async (order: { product_id: string; display_order: number }[]) => {
    try {
      const response = await fetch(`/api/admin/collections/${collectionId}/products`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: order }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast({
          title: 'Success',
          description: 'Product order saved',
        });
        fetchCollection();
      } else {
        throw new Error(result.error || 'Failed to save order');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save order',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Add products
  const handleAddProducts = async (productIds: string[]) => {
    try {
      const response = await fetch(`/api/admin/collections/${collectionId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: productIds }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast({
          title: 'Success',
          description: `Added ${result.data.added.length} product(s)`,
        });
        fetchCollection();
      } else {
        throw new Error(result.error || 'Failed to add products');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add products',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Remove product
  const handleRemoveProduct = async (productId: string) => {
    try {
      const response = await fetch(
        `/api/admin/collections/${collectionId}/products?product_id=${productId}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (result.status === 'success') {
        toast({
          title: 'Success',
          description: 'Product removed from collection',
        });
        fetchCollection();
      } else {
        throw new Error(result.error || 'Failed to remove product');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove product',
        variant: 'destructive',
      });
      throw error;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!collection) {
    return (
      <AdminLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <p className="text-muted-foreground">Collection not found</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/admin/collections">Back to Collections</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/collections">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {collection.name}
                </h1>
                <Badge
                  variant="outline"
                  className={cn('text-xs', statusConfig[collection.status].color)}
                >
                  {statusConfig[collection.status].label}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {collection.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>/collections/{collection.slug}</span>
                {collection.status === 'active' && (
                  <Link
                    href={`/collections/${collection.slug}`}
                    target="_blank"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    View live <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {collection.status !== 'active' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('active')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Publish
                </Button>
              )}
              {collection.status === 'active' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('draft')}
                >
                  <FileEdit className="h-4 w-4 mr-1" />
                  Unpublish
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowEditSheet(true)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteCollection}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Collection Image */}
        {collection.image_url && (
          <Card>
            <CardContent className="p-0">
              <img
                src={collection.image_url}
                alt={collection.name}
                className="w-full h-48 sm:h-64 object-cover rounded-lg"
              />
            </CardContent>
          </Card>
        )}

        {/* Products Management */}
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage products in this collection. Drag to reorder or use the buttons.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CollectionProductManager
              collectionId={collectionId}
              products={collection.products}
              onProductsChange={handleProductsChange}
              onSaveOrder={handleSaveOrder}
              onAddProducts={handleAddProducts}
              onRemoveProduct={handleRemoveProduct}
              isLoading={isSaving}
            />
          </CardContent>
        </Card>

        {/* Edit Collection Sheet */}
        <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Collection</SheetTitle>
              <SheetDescription>Update collection details</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <CollectionForm
                initialData={collection}
                onSubmit={handleUpdateCollection}
                onCancel={() => setShowEditSheet(false)}
                isLoading={isSaving}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </AdminLayout>
  );
}
