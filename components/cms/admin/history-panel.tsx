/**
 * History Panel Component
 *
 * Displays a visual timeline of all actions with the ability
 * to jump to any point in history.
 */

'use client';

import React from 'react';
import {
  Plus,
  Minus,
  Edit3,
  Move,
  Copy,
  Eye,
  EyeOff,
  FileText,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CMSActionType } from '@/lib/cms/commands/command-interface';

interface HistoryEntry {
  id: string;
  description: string;
  timestamp: number;
  isUndone: boolean;
  isCurrent: boolean;
  type?: CMSActionType;
}

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onJumpTo: (commandId: string) => void;
  onClose?: () => void;
  currentIndex: number;
  maxSize: number;
  className?: string;
}

// Get icon for action type
function getActionIcon(type?: CMSActionType) {
  switch (type) {
    case 'section_add':
      return Plus;
    case 'section_remove':
      return Minus;
    case 'section_update':
      return Edit3;
    case 'section_reorder':
      return Move;
    case 'section_duplicate':
      return Copy;
    case 'section_visibility':
      return Eye;
    case 'template_restore':
      return RotateCcw;
    default:
      return FileText;
  }
}

// Get color for action type
function getActionColor(type?: CMSActionType) {
  switch (type) {
    case 'section_add':
      return 'text-green-500';
    case 'section_remove':
      return 'text-red-500';
    case 'section_update':
      return 'text-blue-500';
    case 'section_reorder':
      return 'text-orange-500';
    case 'section_duplicate':
      return 'text-purple-500';
    case 'section_visibility':
      return 'text-yellow-500';
    case 'template_restore':
      return 'text-cyan-500';
    default:
      return 'text-muted-foreground';
  }
}

// Format relative time
function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

// Format exact time
function formatExactTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function HistoryPanel({
  entries,
  onJumpTo,
  onClose,
  currentIndex,
  maxSize,
  className,
}: HistoryPanelProps) {
  return (
    <div className={cn('flex h-full flex-col bg-background', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">History</h3>
          <span className="text-xs text-muted-foreground">
            ({entries.length}/{maxSize})
          </span>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No history yet</p>
              <p className="text-xs text-muted-foreground/75">
                Actions will appear here as you edit
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 h-full w-px bg-border" />

              {/* Entries */}
              <div className="space-y-1">
                {entries.map((entry, index) => {
                  const Icon = getActionIcon(entry.type);
                  const colorClass = getActionColor(entry.type);
                  const isActive = entry.isCurrent;
                  const isUndone = entry.isUndone;

                  return (
                    <button
                      key={entry.id}
                      onClick={() => onJumpTo(entry.id)}
                      className={cn(
                        'group relative flex w-full items-start gap-3 rounded-md p-2 text-left transition-colors',
                        'hover:bg-accent',
                        isActive && 'bg-accent',
                        isUndone && 'opacity-50'
                      )}
                    >
                      {/* Timeline dot */}
                      <div
                        className={cn(
                          'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background',
                          isActive
                            ? 'border-primary bg-primary'
                            : 'border-border group-hover:border-primary'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            isActive ? 'text-primary-foreground' : colorClass
                          )}
                        />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 pt-1">
                        <p
                          className={cn('truncate text-sm font-medium', isUndone && 'line-through')}
                        >
                          {entry.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatRelativeTime(entry.timestamp)}</span>
                          <span className="hidden group-hover:inline">
                            {formatExactTime(entry.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Current indicator */}
                      {isActive && (
                        <div className="shrink-0 self-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                          Current
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Initial state marker */}
              <div className="relative flex items-start gap-3 p-2">
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-background">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                </div>
                <div className="pt-1.5">
                  <p className="text-xs text-muted-foreground">Initial state</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {entries.length > 0 && (
        <div className="border-t px-4 py-2">
          <p className="text-xs text-muted-foreground">Click any point to restore to that state</p>
        </div>
      )}
    </div>
  );
}

/**
 * Compact inline history indicator
 */
interface HistoryIndicatorProps {
  historySize: number;
  canUndo: boolean;
  canRedo: boolean;
  onClick?: () => void;
}

export function HistoryIndicator({
  historySize,
  canUndo,
  canRedo,
  onClick,
}: HistoryIndicatorProps) {
  if (historySize === 0) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs',
        'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        'transition-colors'
      )}
    >
      <Clock className="h-3 w-3" />
      <span>{historySize}</span>
      {(canUndo || canRedo) && (
        <span className="flex items-center gap-0.5">
          {canUndo && <span className="text-[10px]">\u2190</span>}
          {canRedo && <span className="text-[10px]">\u2192</span>}
        </span>
      )}
    </button>
  );
}
