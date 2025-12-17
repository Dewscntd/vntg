/**
 * Admin Campaigns Management Page
 *
 * Features:
 * - List all campaigns with status indicators
 * - Create new campaigns
 * - Edit existing campaigns
 * - Delete campaigns
 * - Filter by status and type
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Calendar, Tag } from 'lucide-react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { CampaignForm } from '@/components/admin/campaign-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Campaign, CampaignFormData, CampaignStatus, CampaignType } from '@/types/shop';
import { mockCampaigns } from '@/lib/stubs/mock-data';
import { cn } from '@/lib/utils';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CampaignType | 'all'>('all');

  // Load campaigns (using mock data)
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCampaigns(mockCampaigns);
      setIsLoading(false);
    }, 500);
  }, []);

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign) => {
    if (statusFilter !== 'all' && campaign.status !== statusFilter) return false;
    if (typeFilter !== 'all' && campaign.type !== typeFilter) return false;
    return true;
  });

  // Handle create campaign
  const handleCreateCampaign = async (data: CampaignFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      ...data,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      sort_order: campaigns.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCampaigns([...campaigns, newCampaign]);
    setShowCreateDialog(false);
  };

  // Handle update campaign
  const handleUpdateCampaign = async (data: CampaignFormData) => {
    if (!editingCampaign) return;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedCampaign: Campaign = {
      ...editingCampaign,
      ...data,
      updated_at: new Date().toISOString(),
    };

    setCampaigns(campaigns.map((c) => (c.id === editingCampaign.id ? updatedCampaign : c)));
    setEditingCampaign(null);
  };

  // Handle delete campaign
  const handleDeleteCampaign = (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      setCampaigns(campaigns.filter((c) => c.id !== campaignId));
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (
    status: CampaignStatus
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'draft':
        return 'outline';
      case 'expired':
      case 'archived':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground">
              Create and manage marketing campaigns and curated collections
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as CampaignStatus | 'all')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select
                  value={typeFilter}
                  onValueChange={(value) => setTypeFilter(value as CampaignType | 'all')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sale">Sale / Promotion</SelectItem>
                    <SelectItem value="collection">Collection</SelectItem>
                    <SelectItem value="editorial">Editorial</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                    <SelectItem value="new-arrivals">New Arrivals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.filter((c) => c.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.filter((c) => c.status === 'scheduled').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.filter((c) => c.status === 'draft').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List */}
        <Card>
          <CardHeader>
            <CardTitle>
              All Campaigns ({filteredCampaigns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-muted-foreground">Loading campaigns...</p>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-muted-foreground">No campaigns found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center gap-4 rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors"
                  >
                    {/* Thumbnail */}
                    {campaign.thumbnail_url && (
                      <img
                        src={campaign.thumbnail_url}
                        alt={campaign.name}
                        className="h-20 w-32 rounded object-cover"
                      />
                    )}

                    {/* Campaign Details */}
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <Badge variant={getStatusBadgeVariant(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        {campaign.is_featured && (
                          <Badge variant="secondary">Featured</Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">
                        {campaign.description || 'No description'}
                      </p>

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="capitalize">{campaign.type.replace('-', ' ')}</span>
                        <span>{campaign.product_ids.length} products</span>
                        {campaign.start_date && (
                          <span>
                            Starts: {new Date(campaign.start_date).toLocaleDateString()}
                          </span>
                        )}
                        {campaign.end_date && (
                          <span>
                            Ends: {new Date(campaign.end_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCampaign(campaign)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Campaign Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Create a new marketing campaign or curated collection
              </DialogDescription>
            </DialogHeader>
            <CampaignForm
              onSubmit={handleCreateCampaign}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Campaign Dialog */}
        <Dialog open={!!editingCampaign} onOpenChange={() => setEditingCampaign(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Campaign</DialogTitle>
              <DialogDescription>Update campaign details and products</DialogDescription>
            </DialogHeader>
            {editingCampaign && (
              <CampaignForm
                initialData={editingCampaign}
                onSubmit={handleUpdateCampaign}
                onCancel={() => setEditingCampaign(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
