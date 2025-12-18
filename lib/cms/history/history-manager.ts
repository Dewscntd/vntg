/**
 * History Manager for CMS Undo/Redo
 *
 * Manages the undo/redo stack with support for:
 * - Command merging (grouping rapid sequential edits)
 * - History limit (50 actions by default)
 * - Session-based history
 * - Persistence to database
 */

import { Homepage } from '@/types/cms';
import {
  CMSCommand,
  CommandContext,
  CommandResult,
  CommandPayload,
} from '../commands/command-interface';

/**
 * History entry with metadata
 */
export interface HistoryEntry {
  command: CMSCommand;
  executedAt: number;
  isUndone: boolean;
}

/**
 * History state snapshot
 */
export interface HistoryState {
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  undoDescription: string | null;
  redoDescription: string | null;
  historySize: number;
  maxHistorySize: number;
}

/**
 * History manager configuration
 */
export interface HistoryManagerConfig {
  maxHistorySize: number;
  mergeWindow: number; // ms to merge similar commands
  sessionId: string;
  userId?: string;
  onHistoryChange?: (state: HistoryState) => void;
  onPersist?: (entries: CommandPayload[]) => Promise<void>;
}

const DEFAULT_CONFIG: Partial<HistoryManagerConfig> = {
  maxHistorySize: 50,
  mergeWindow: 500,
};

/**
 * History Manager Class
 *
 * Manages undo/redo operations for CMS editing.
 */
export class HistoryManager {
  private history: HistoryEntry[] = [];
  private currentIndex: number = -1;
  private config: HistoryManagerConfig;
  private isDirty: boolean = false;

  constructor(config: Partial<HistoryManagerConfig> & { sessionId: string }) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    } as HistoryManagerConfig;
  }

  /**
   * Get current history state
   */
  getState(): HistoryState {
    return {
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoDescription: this.getUndoDescription(),
      redoDescription: this.getRedoDescription(),
      historySize: this.currentIndex + 1,
      maxHistorySize: this.config.maxHistorySize,
    };
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get description of the next undo action
   */
  getUndoDescription(): string | null {
    if (!this.canUndo()) return null;
    return this.history[this.currentIndex].command.description;
  }

  /**
   * Get description of the next redo action
   */
  getRedoDescription(): string | null {
    if (!this.canRedo()) return null;
    return this.history[this.currentIndex + 1].command.description;
  }

  /**
   * Get all history entries for display
   */
  getHistory(): Array<{
    id: string;
    description: string;
    timestamp: number;
    isUndone: boolean;
    isCurrent: boolean;
  }> {
    return this.history.map((entry, index) => ({
      id: entry.command.id,
      description: entry.command.description,
      timestamp: entry.executedAt,
      isUndone: index > this.currentIndex,
      isCurrent: index === this.currentIndex,
    }));
  }

  /**
   * Execute a command and add it to history
   */
  execute(command: CMSCommand, homepage: Homepage): CommandResult {
    const context: CommandContext = {
      homepage,
      sessionId: this.config.sessionId,
      userId: this.config.userId,
    };

    // Execute the command
    const result = command.execute(context);

    if (!result.success) {
      return result;
    }

    // Check if we can merge with the last command
    if (this.canUndo()) {
      const lastEntry = this.history[this.currentIndex];
      const lastCommand = lastEntry.command;

      if (command.canMergeWith?.(lastCommand)) {
        const mergedCommand = command.mergeWith!(lastCommand);

        // Replace the last entry with merged command
        this.history[this.currentIndex] = {
          command: mergedCommand,
          executedAt: Date.now(),
          isUndone: false,
        };

        this.notifyChange();
        return result;
      }
    }

    // Clear any redo history (actions after current position)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new entry
    const entry: HistoryEntry = {
      command,
      executedAt: Date.now(),
      isUndone: false,
    };

    this.history.push(entry);
    this.currentIndex++;

    // Enforce history limit
    while (this.history.length > this.config.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }

    this.isDirty = true;
    this.notifyChange();

    // Persist if configured
    this.persistIfNeeded();

    return result;
  }

  /**
   * Undo the last action
   */
  undo(homepage: Homepage): CommandResult | null {
    if (!this.canUndo()) {
      return null;
    }

    const entry = this.history[this.currentIndex];
    const context: CommandContext = {
      homepage,
      sessionId: this.config.sessionId,
      userId: this.config.userId,
    };

    const result = entry.command.undo(context);

    if (result.success) {
      entry.isUndone = true;
      this.currentIndex--;
      this.isDirty = true;
      this.notifyChange();
      this.persistIfNeeded();
    }

    return result;
  }

  /**
   * Redo the last undone action
   */
  redo(homepage: Homepage): CommandResult | null {
    if (!this.canRedo()) {
      return null;
    }

    const entry = this.history[this.currentIndex + 1];
    const context: CommandContext = {
      homepage,
      sessionId: this.config.sessionId,
      userId: this.config.userId,
    };

    const result = entry.command.execute(context);

    if (result.success) {
      entry.isUndone = false;
      this.currentIndex++;
      this.isDirty = true;
      this.notifyChange();
      this.persistIfNeeded();
    }

    return result;
  }

  /**
   * Jump to a specific point in history
   */
  jumpTo(commandId: string, homepage: Homepage): CommandResult | null {
    const targetIndex = this.history.findIndex((e) => e.command.id === commandId);

    if (targetIndex === -1) {
      return null;
    }

    let currentHomepage = homepage;

    // Undo or redo to reach target position
    while (this.currentIndex !== targetIndex) {
      let result: CommandResult | null;

      if (this.currentIndex > targetIndex) {
        result = this.undo(currentHomepage);
      } else {
        result = this.redo(currentHomepage);
      }

      if (!result?.success) {
        return result;
      }

      currentHomepage = result.homepage;
    }

    return {
      success: true,
      homepage: currentHomepage,
    };
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
    this.isDirty = false;
    this.notifyChange();
  }

  /**
   * Export history for persistence
   */
  export(): CommandPayload[] {
    return this.history.map((entry) => entry.command.toPayload());
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.config.sessionId;
  }

  /**
   * Notify listeners of history change
   */
  private notifyChange(): void {
    this.config.onHistoryChange?.(this.getState());
  }

  /**
   * Persist history if configured and dirty
   */
  private async persistIfNeeded(): Promise<void> {
    if (!this.isDirty || !this.config.onPersist) {
      return;
    }

    try {
      await this.config.onPersist(this.export());
      this.isDirty = false;
    } catch (error) {
      console.error('Failed to persist history:', error);
    }
  }
}

/**
 * Create a new session ID
 */
export function createSessionId(): string {
  return crypto.randomUUID();
}

/**
 * React hook for using HistoryManager
 */
export function createHistoryManagerHook(sessionId?: string) {
  const effectiveSessionId = sessionId || createSessionId();

  return {
    sessionId: effectiveSessionId,
    createManager: (config?: Partial<HistoryManagerConfig>) =>
      new HistoryManager({
        ...config,
        sessionId: effectiveSessionId,
      }),
  };
}
