/**
 * Preview Panel - Admin Component
 *
 * Live preview of homepage with responsive viewport switching.
 */

'use client';

import React, { useState } from 'react';
import { useCMS } from '@/lib/context/cms-context';
import { HomepageRenderer } from '../homepage-renderer';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export function PreviewPanel() {
  const { homepage, previewMode } = useCMS();
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  if (!homepage || !previewMode) {
    return null;
  }

  const viewportWidths = {
    mobile: '375px',
    tablet: '768px',
    desktop: '100%',
  };

  return (
    <div className="flex h-full flex-col">
      {/* Viewport Controls */}
      <div className="flex items-center justify-center gap-2 border-b bg-muted/50 p-4">
        <Button
          variant={viewport === 'mobile' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewport('mobile')}
        >
          <Smartphone className="mr-2 h-4 w-4" />
          Mobile
        </Button>
        <Button
          variant={viewport === 'tablet' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewport('tablet')}
        >
          <Tablet className="mr-2 h-4 w-4" />
          Tablet
        </Button>
        <Button
          variant={viewport === 'desktop' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewport('desktop')}
        >
          <Monitor className="mr-2 h-4 w-4" />
          Desktop
        </Button>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-muted/30 p-8">
        <div
          className={cn(
            'mx-auto bg-white shadow-xl transition-all',
            viewport !== 'desktop' && 'border'
          )}
          style={{
            width: viewportWidths[viewport],
            minHeight: '100vh',
          }}
        >
          <HomepageRenderer sections={homepage.sections} isPreview />
        </div>
      </div>
    </div>
  );
}
