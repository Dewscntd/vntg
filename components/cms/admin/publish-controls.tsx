/**
 * Publish Controls - Admin Component
 *
 * Controls for saving, publishing, and managing homepage state.
 */

'use client';

import React from 'react';
import { useCMS } from '@/lib/context/cms-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Upload, Eye, RotateCcw, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PublishControls() {
  const {
    homepage,
    isDirty,
    isSaving,
    lastSaved,
    saveHomepage,
    publishHomepage,
    revertToPublished,
    togglePreviewMode,
    previewMode,
  } = useCMS();

  if (!homepage) {
    return null;
  }

  const formatLastSaved = (dateString: string | null) => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        {/* Status Indicators */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={homepage.status === 'published' ? 'default' : 'secondary'}
              className={cn(homepage.status === 'published' && 'bg-green-500 hover:bg-green-600')}
            >
              {homepage.status === 'published' ? (
                <CheckCircle2 className="mr-1 h-3 w-3" />
              ) : (
                <Clock className="mr-1 h-3 w-3" />
              )}
              {homepage.status}
            </Badge>

            {isDirty && (
              <Badge variant="outline">
                <AlertCircle className="mr-1 h-3 w-3" />
                Unsaved Changes
              </Badge>
            )}
          </div>

          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Saved {formatLastSaved(lastSaved)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={saveHomepage}
            disabled={!isDirty || isSaving}
            variant="outline"
            size="sm"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>

          <Button onClick={publishHomepage} disabled={isSaving} size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={togglePreviewMode} variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? 'Exit Preview' : 'Preview'}
          </Button>

          <Button
            onClick={revertToPublished}
            disabled={homepage.status !== 'published'}
            variant="ghost"
            size="sm"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Revert
          </Button>
        </div>

        {/* Auto-save indicator */}
        {isSaving && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            Auto-saving...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
