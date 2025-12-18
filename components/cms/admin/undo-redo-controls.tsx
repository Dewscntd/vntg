/**
 * Undo/Redo Controls Component
 *
 * Provides toolbar buttons for undo/redo operations with
 * keyboard shortcut hints and visual feedback.
 */

'use client';

import React from 'react';
import { Undo2, Redo2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { HistoryState } from '@/lib/cms/history/history-manager';

interface UndoRedoControlsProps {
  historyState: HistoryState;
  onUndo: () => void;
  onRedo: () => void;
  onShowHistory?: () => void;
  historyEntries?: Array<{
    id: string;
    description: string;
    timestamp: number;
    isUndone: boolean;
    isCurrent: boolean;
  }>;
  onJumpToHistory?: (commandId: string) => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  showHistoryButton?: boolean;
  showShortcuts?: boolean;
}

export function UndoRedoControls({
  historyState,
  onUndo,
  onRedo,
  onShowHistory,
  historyEntries = [],
  onJumpToHistory,
  className,
  size = 'default',
  showHistoryButton = true,
  showShortcuts = true,
}: UndoRedoControlsProps) {
  const { canUndo, canRedo, undoDescription, redoDescription, historySize, maxHistorySize } =
    historyState;

  // Format relative time
  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  // Get shortcut label based on platform
  const isMac = typeof window !== 'undefined' && navigator.platform.includes('Mac');
  const modKey = isMac ? '\u2318' : 'Ctrl';

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('flex items-center gap-1', className)}>
        {/* Undo Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={size === 'sm' ? 'sm' : 'icon'}
              onClick={onUndo}
              disabled={!canUndo}
              className={cn('relative', size === 'sm' && 'h-8 w-8', !canUndo && 'opacity-50')}
              aria-label={canUndo ? `Undo: ${undoDescription}` : 'Nothing to undo'}
            >
              <Undo2 className={cn('h-4 w-4', size === 'lg' && 'h-5 w-5')} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="flex flex-col gap-1">
            <span className="font-medium">
              {canUndo ? `Undo: ${undoDescription}` : 'Nothing to undo'}
            </span>
            {showShortcuts && <span className="text-xs text-muted-foreground">{modKey}+Z</span>}
          </TooltipContent>
        </Tooltip>

        {/* Redo Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={size === 'sm' ? 'sm' : 'icon'}
              onClick={onRedo}
              disabled={!canRedo}
              className={cn('relative', size === 'sm' && 'h-8 w-8', !canRedo && 'opacity-50')}
              aria-label={canRedo ? `Redo: ${redoDescription}` : 'Nothing to redo'}
            >
              <Redo2 className={cn('h-4 w-4', size === 'lg' && 'h-5 w-5')} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="flex flex-col gap-1">
            <span className="font-medium">
              {canRedo ? `Redo: ${redoDescription}` : 'Nothing to redo'}
            </span>
            {showShortcuts && (
              <span className="text-xs text-muted-foreground">{modKey}+Shift+Z</span>
            )}
          </TooltipContent>
        </Tooltip>

        {/* History Dropdown or Button */}
        {showHistoryButton && (
          <>
            {historyEntries.length > 0 && onJumpToHistory ? (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size={size === 'sm' ? 'sm' : 'icon'}
                        className={cn('relative', size === 'sm' && 'h-8 w-8')}
                        aria-label="View history"
                      >
                        <History className={cn('h-4 w-4', size === 'lg' && 'h-5 w-5')} />
                        {historySize > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                            {historySize > 9 ? '9+' : historySize}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="flex flex-col gap-1">
                    <span className="font-medium">History</span>
                    {showShortcuts && (
                      <span className="text-xs text-muted-foreground">{modKey}+Shift+H</span>
                    )}
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                    History ({historySize}/{maxHistorySize})
                  </div>
                  <DropdownMenuSeparator />
                  <div className="max-h-64 overflow-y-auto">
                    {historyEntries.slice(0, 10).map((entry) => (
                      <DropdownMenuItem
                        key={entry.id}
                        onClick={() => onJumpToHistory(entry.id)}
                        className={cn(
                          'flex items-center justify-between gap-2',
                          entry.isCurrent && 'bg-accent',
                          entry.isUndone && 'opacity-50'
                        )}
                      >
                        <span className="truncate">{entry.description}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatRelativeTime(entry.timestamp)}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  {onShowHistory && historyEntries.length > 10 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onShowHistory}>
                        View full history...
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              onShowHistory && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size={size === 'sm' ? 'sm' : 'icon'}
                      onClick={onShowHistory}
                      className={cn('relative', size === 'sm' && 'h-8 w-8')}
                      aria-label="View history"
                    >
                      <History className={cn('h-4 w-4', size === 'lg' && 'h-5 w-5')} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="flex flex-col gap-1">
                    <span className="font-medium">History</span>
                    {showShortcuts && (
                      <span className="text-xs text-muted-foreground">{modKey}+Shift+H</span>
                    )}
                  </TooltipContent>
                </Tooltip>
              )
            )}
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
