/**
 * Section List Editor - Admin Component
 *
 * Drag-and-drop list of sections with reordering capability.
 * Uses @hello-pangea/dnd for smooth drag-drop.
 */

'use client';

import React from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import { Section } from '@/types/cms';
import { useCMS } from '@/lib/context/cms-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GripVertical,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Edit,
  Image,
  Type,
  ShoppingBag,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionListEditorProps {
  onAddSection: () => void;
}

export function SectionListEditor({ onAddSection }: SectionListEditorProps) {
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
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        Loading...
      </div>
    );
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !homepage) return;

    const sections = Array.from(homepage.sections);
    const [removed] = sections.splice(result.source.index, 1);
    sections.splice(result.destination.index, 0, removed);

    reorderSections(sections);
  };

  const getSectionIcon = (type: Section['type']) => {
    switch (type) {
      case 'hero':
        return <Sparkles className="h-5 w-5" />;
      case 'product_carousel':
        return <ShoppingBag className="h-5 w-5" />;
      case 'text_block':
        return <Type className="h-5 w-5" />;
      case 'image_banner':
        return <Image className="h-5 w-5" />;
      case 'category_grid':
        return <LayoutGrid className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getSectionTitle = (section: Section): string => {
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
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Homepage Sections</h2>
        <Button onClick={onAddSection} size="sm">
          Add Section
        </Button>
      </div>

      {/* Section List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                'min-h-[200px] space-y-2 rounded-lg border-2 border-dashed p-4 transition-colors',
                snapshot.isDraggingOver ? 'border-primary bg-primary/5' : 'border-muted'
              )}
            >
              {homepage.sections.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                  <p className="text-lg font-medium">No sections yet</p>
                  <p className="text-sm">Add your first section to get started</p>
                </div>
              ) : (
                homepage.sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          'transition-all',
                          snapshot.isDragging && 'shadow-lg',
                          activeSection === section.id && 'ring-2 ring-primary'
                        )}
                      >
                        <div className="flex items-center gap-3 p-4">
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
                          >
                            <GripVertical className="h-5 w-5" />
                          </div>

                          {/* Section Icon */}
                          <div className="text-muted-foreground">
                            {getSectionIcon(section.type)}
                          </div>

                          {/* Section Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium truncate">
                                {getSectionTitle(section)}
                              </h3>
                              <Badge variant="outline" className="capitalize">
                                {section.type.replace('_', ' ')}
                              </Badge>
                              {section.status === 'draft' && (
                                <Badge variant="secondary">Draft</Badge>
                              )}
                              {!section.visible && (
                                <Badge variant="destructive">Hidden</Badge>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                updateSection(section.id, {
                                  visible: !section.visible,
                                })
                              }
                              title={section.visible ? 'Hide' : 'Show'}
                            >
                              {section.visible ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setActiveSection(section.id)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => duplicateSection(section.id)}
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (
                                  confirm('Are you sure you want to delete this section?')
                                ) {
                                  deleteSection(section.id);
                                }
                              }}
                              title="Delete"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
