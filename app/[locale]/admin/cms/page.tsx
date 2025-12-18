/**
 * CMS Admin Page - Homepage Editor
 *
 * Editorial Studio aesthetic - A distinctive, dark-mode admin interface
 * with refined typography, smooth animations, and memorable interactions.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { CMSProvider, useCMS } from '@/lib/context/cms-context';
import { SectionListEditor } from '@/components/cms/admin/section-list-editor';
import { SectionEditor } from '@/components/cms/admin/section-editor';
import { HomepageRenderer } from '@/components/cms/homepage-renderer';
import { Section, SectionType } from '@/types/cms';
import {
  Sparkles,
  ShoppingBag,
  Type,
  ImageIcon,
  LayoutGrid,
  Save,
  Upload,
  Eye,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  GripVertical,
  Edit2,
  Copy,
  Trash2,
  EyeOff,
  Plus,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import './cms-admin.css';

// =============================================================================
// Type Definitions
// =============================================================================

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

interface SectionTypeConfig {
  type: SectionType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

// =============================================================================
// Section Type Configuration
// =============================================================================

const sectionTypes: SectionTypeConfig[] = [
  {
    type: 'hero',
    label: 'Hero Section',
    description: 'Full-width hero with headline, CTA, and product carousel',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    type: 'product_carousel',
    label: 'Product Carousel',
    description: 'Showcase products in an animated carousel',
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    type: 'text_block',
    label: 'Text Block',
    description: 'Rich text content with custom styling',
    icon: <Type className="h-5 w-5" />,
  },
  {
    type: 'image_banner',
    label: 'Image Banner',
    description: 'Full-width image with optional overlay',
    icon: <ImageIcon className="h-5 w-5" />,
  },
  {
    type: 'category_grid',
    label: 'Category Grid',
    description: 'Grid layout of category tiles',
    icon: <LayoutGrid className="h-5 w-5" />,
  },
];

// =============================================================================
// Status Badge Component
// =============================================================================

function StatusBadge({ status, isDirty }: { status: 'draft' | 'published'; isDirty: boolean }) {
  return (
    <div className="cms-status-bar">
      <div className={cn('cms-status-badge', status)}>
        <span className={cn('cms-status-dot', status)} />
        {status === 'published' ? 'Published' : 'Draft'}
      </div>
      {isDirty && (
        <div className="cms-status-badge unsaved">
          <AlertCircle className="h-3 w-3" />
          Unsaved
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Publish Controls Component
// =============================================================================

function PublishControlsEnhanced() {
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

  if (!homepage) return null;

  const formatLastSaved = (dateString: string | null) => {
    if (!dateString) return 'Never saved';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="cms-header">
      <div className="cms-header-top">
        <div>
          <h1 className="cms-title cms-header-title">
            Homepage <span className="cms-title-italic">Editor</span>
          </h1>
          <p className="cms-header-subtitle">Last saved {formatLastSaved(lastSaved)}</p>
        </div>
        {isSaving && (
          <div className="cms-saving-indicator">
            <div className="cms-saving-spinner" />
            Saving...
          </div>
        )}
      </div>
      <StatusBadge status={homepage.status} isDirty={isDirty} />
    </div>
  );
}

// =============================================================================
// Action Buttons Component
// =============================================================================

function ActionButtons() {
  const {
    homepage,
    isDirty,
    isSaving,
    saveHomepage,
    publishHomepage,
    togglePreviewMode,
    previewMode,
  } = useCMS();

  if (!homepage) return null;

  return (
    <div className="cms-actions">
      <button
        onClick={saveHomepage}
        disabled={!isDirty || isSaving}
        className={cn(
          'cms-btn cms-btn-secondary flex-1',
          (!isDirty || isSaving) && 'cursor-not-allowed opacity-50'
        )}
      >
        <Save className="h-4 w-4" />
        Save Draft
      </button>
      <button
        onClick={publishHomepage}
        disabled={isSaving}
        className="cms-btn cms-btn-primary flex-1"
      >
        <Upload className="h-4 w-4" />
        Publish
      </button>
    </div>
  );
}

// =============================================================================
// Section Card Component
// =============================================================================

function SectionCard({
  section,
  index,
  isActive,
  onEdit,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  dragHandleProps,
}: {
  section: Section;
  index: number;
  isActive: boolean;
  onEdit: () => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  dragHandleProps?: any;
}) {
  const getIcon = (type: Section['type']) => {
    const icons = {
      hero: <Sparkles className="h-4 w-4" />,
      product_carousel: <ShoppingBag className="h-4 w-4" />,
      text_block: <Type className="h-4 w-4" />,
      image_banner: <ImageIcon className="h-4 w-4" />,
      category_grid: <LayoutGrid className="h-4 w-4" />,
    };
    return icons[type] || null;
  };

  const getTitle = (section: Section): string => {
    switch (section.type) {
      case 'hero':
        return section.config.headline || 'Hero Section';
      case 'product_carousel':
        return section.title || 'Product Carousel';
      case 'text_block':
        return 'Text Block';
      case 'image_banner':
        return 'Image Banner';
      case 'category_grid':
        return section.config.title || 'Category Grid';
      default:
        return 'Section';
    }
  };

  return (
    <div
      className={cn('cms-section-card cms-animate-in', isActive && 'active')}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onEdit}
    >
      <div {...dragHandleProps} className="cms-drag-handle">
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="cms-section-icon">{getIcon(section.type)}</div>

      <div className="cms-section-info">
        <div className="cms-section-name">{getTitle(section)}</div>
        <div className="cms-section-type">
          {section.type.replace('_', ' ')}
          {section.status === 'draft' && ' • Draft'}
          {!section.visible && ' • Hidden'}
        </div>
      </div>

      <div className="cms-section-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className="cms-icon-btn"
          onClick={onToggleVisibility}
          title={section.visible ? 'Hide' : 'Show'}
        >
          {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <button className="cms-icon-btn" onClick={onEdit} title="Edit">
          <Edit2 className="h-4 w-4" />
        </button>
        <button className="cms-icon-btn" onClick={onDuplicate} title="Duplicate">
          <Copy className="h-4 w-4" />
        </button>
        <button className="cms-icon-btn danger" onClick={onDelete} title="Delete">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Section List Component
// =============================================================================

function EnhancedSectionList({ onAddSection }: { onAddSection: () => void }) {
  const {
    homepage,
    activeSection,
    setActiveSection,
    reorderSections,
    updateSection,
    deleteSection,
    duplicateSection,
  } = useCMS();

  if (!homepage) {
    return (
      <div className="cms-section-list">
        <div className="cms-empty-state">
          <div className="cms-saving-spinner" style={{ width: 24, height: 24 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="cms-section-list">
      <div className="cms-section-list-header">
        <span className="cms-section-list-title">Sections</span>
        <button className="cms-add-btn" onClick={onAddSection}>
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {homepage.sections.length === 0 ? (
        <div className="cms-empty-state">
          <Layers className="cms-empty-icon" />
          <p className="cms-empty-title">No sections yet</p>
          <p className="cms-empty-text">Add your first section to get started</p>
        </div>
      ) : (
        <div>
          {homepage.sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              isActive={activeSection === section.id}
              onEdit={() => setActiveSection(section.id)}
              onToggleVisibility={() => updateSection(section.id, { visible: !section.visible })}
              onDuplicate={() => duplicateSection(section.id)}
              onDelete={() => {
                if (confirm('Delete this section?')) {
                  deleteSection(section.id);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Preview Panel Component
// =============================================================================

function EnhancedPreviewPanel() {
  const { homepage } = useCMS();
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  const viewportConfig = {
    mobile: { width: '375px', label: 'Mobile' },
    tablet: { width: '768px', label: 'Tablet' },
    desktop: { width: '100%', label: 'Desktop' },
  };

  return (
    <div className="cms-preview-frame">
      <div className="cms-preview-toolbar">
        <span className="cms-preview-label">Preview</span>

        <div className="cms-viewport-switcher">
          <button
            className={cn('cms-viewport-btn', viewport === 'mobile' && 'active')}
            onClick={() => setViewport('mobile')}
            title="Mobile"
          >
            <Smartphone className="h-4 w-4" />
          </button>
          <button
            className={cn('cms-viewport-btn', viewport === 'tablet' && 'active')}
            onClick={() => setViewport('tablet')}
            title="Tablet"
          >
            <Tablet className="h-4 w-4" />
          </button>
          <button
            className={cn('cms-viewport-btn', viewport === 'desktop' && 'active')}
            onClick={() => setViewport('desktop')}
            title="Desktop"
          >
            <Monitor className="h-4 w-4" />
          </button>
        </div>

        <button className="cms-btn cms-btn-ghost" onClick={() => window.open('/', '_blank')}>
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      <div className="cms-preview-content">
        <div
          className={cn('cms-preview-device', viewport)}
          style={{ width: viewportConfig[viewport].width }}
        >
          {homepage && <HomepageRenderer sections={homepage.sections} isPreview />}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Add Section Dialog Component
// =============================================================================

function AddSectionDialog({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: SectionType) => void;
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="cms-dialog-overlay" onClick={onClose} />
      <div className="cms-dialog">
        <div className="cms-dialog-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="cms-title cms-dialog-title">
                Add <span className="cms-title-italic">Section</span>
              </h2>
              <p className="cms-dialog-subtitle">Choose a section type</p>
            </div>
            <button className="cms-icon-btn" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="cms-dialog-content">
          <div className="cms-section-type-grid">
            {sectionTypes.map((sectionType, index) => (
              <div
                key={sectionType.type}
                className="cms-section-type-card cms-animate-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => {
                  onSelect(sectionType.type);
                  onClose();
                }}
              >
                <div className="cms-section-type-icon">{sectionType.icon}</div>
                <div className="cms-section-type-name">{sectionType.label}</div>
                <div className="cms-section-type-desc">{sectionType.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// Main CMS Editor Content
// =============================================================================

function CMSEditorContent() {
  const { addSection, previewMode, activeSection, setActiveSection } = useCMS();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddSection = (type: SectionType) => {
    const baseSection = {
      type,
      status: 'draft' as const,
      order: 0,
      visible: true,
    };

    let sectionConfig: any = {};

    switch (type) {
      case 'hero':
        sectionConfig = {
          ...baseSection,
          config: {
            headline: 'New Hero Section',
            textAlignment: 'center' as const,
            height: 'lg' as const,
          },
        };
        break;
      case 'product_carousel':
        sectionConfig = {
          ...baseSection,
          title: 'Featured Products',
          config: {
            products: [],
            itemsPerView: { mobile: 1, tablet: 2, desktop: 4 },
            showArrows: true,
            showDots: true,
          },
        };
        break;
      case 'text_block':
        sectionConfig = {
          ...baseSection,
          config: {
            content: '<p>Enter your content here...</p>',
            alignment: 'center' as const,
          },
        };
        break;
      case 'image_banner':
        sectionConfig = {
          ...baseSection,
          config: {
            image: '',
            alt: 'Banner image',
            height: 'md' as const,
          },
        };
        break;
      case 'category_grid':
        sectionConfig = {
          ...baseSection,
          config: {
            categories: [],
            columns: { mobile: 2, tablet: 3, desktop: 4 },
          },
        };
        break;
    }

    addSection(sectionConfig);
  };

  // Preview mode - full screen preview
  if (previewMode) {
    return (
      <AdminLayout>
        <div className="cms-admin">
          <EnhancedPreviewPanel />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="cms-admin">
        <div className="cms-container">
          {/* Left Sidebar - Editor */}
          <div className="cms-sidebar">
            <PublishControlsEnhanced />
            <ActionButtons />
            <EnhancedSectionList onAddSection={() => setShowAddDialog(true)} />

            {/* Section Editor Panel */}
            {activeSection && (
              <div className="border-t border-[--cms-border-subtle] bg-[--cms-bg-surface] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="cms-label">Editing Section</span>
                  <button className="cms-icon-btn" onClick={() => setActiveSection(null)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <SectionEditor />
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="cms-preview-area">
            <EnhancedPreviewPanel />
          </div>
        </div>

        {/* Add Section Dialog */}
        <AddSectionDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSelect={handleAddSection}
        />
      </div>
    </AdminLayout>
  );
}

// =============================================================================
// Page Export
// =============================================================================

export default function CMSAdminPage() {
  return (
    <CMSProvider>
      <CMSEditorContent />
    </CMSProvider>
  );
}
