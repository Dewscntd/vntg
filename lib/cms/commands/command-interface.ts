/**
 * Command Pattern Interface for CMS Operations
 *
 * Implements the Command Pattern for undo/redo functionality.
 * Each command encapsulates an action with its execution and inverse operations.
 */

import { Section, Homepage } from '@/types/cms';

/**
 * Action types for event sourcing and command tracking
 */
export type CMSActionType =
  | 'section_add'
  | 'section_remove'
  | 'section_update'
  | 'section_reorder'
  | 'section_duplicate'
  | 'section_visibility'
  | 'metadata_update'
  | 'template_create'
  | 'template_update'
  | 'template_publish'
  | 'template_unpublish'
  | 'template_restore';

/**
 * Command execution context
 */
export interface CommandContext {
  homepage: Homepage;
  sessionId: string;
  userId?: string;
}

/**
 * Command execution result
 */
export interface CommandResult {
  success: boolean;
  homepage: Homepage;
  affectedSectionIds?: string[];
  error?: string;
}

/**
 * Serializable command payload for persistence
 */
export interface CommandPayload {
  type: CMSActionType;
  timestamp: number;
  data: Record<string, unknown>;
  inverseData: Record<string, unknown>;
}

/**
 * Base Command Interface
 *
 * All CMS commands must implement this interface to support undo/redo.
 */
export interface CMSCommand {
  /**
   * Unique command ID
   */
  readonly id: string;

  /**
   * Human-readable description for the history panel
   */
  readonly description: string;

  /**
   * Command type for event sourcing
   */
  readonly type: CMSActionType;

  /**
   * Timestamp when command was created
   */
  readonly timestamp: number;

  /**
   * Execute the command
   */
  execute(context: CommandContext): CommandResult;

  /**
   * Undo the command (reverse the action)
   */
  undo(context: CommandContext): CommandResult;

  /**
   * Check if this command can be merged with another
   * (for grouping rapid sequential edits)
   */
  canMergeWith?(other: CMSCommand): boolean;

  /**
   * Merge this command with another (if canMergeWith returns true)
   */
  mergeWith?(other: CMSCommand): CMSCommand;

  /**
   * Serialize command for persistence
   */
  toPayload(): CommandPayload;
}

/**
 * Abstract base class for CMS commands
 * Provides common functionality for all command implementations
 */
export abstract class BaseCMSCommand implements CMSCommand {
  readonly id: string;
  readonly timestamp: number;

  constructor() {
    this.id = crypto.randomUUID();
    this.timestamp = Date.now();
  }

  abstract get description(): string;
  abstract get type(): CMSActionType;
  abstract execute(context: CommandContext): CommandResult;
  abstract undo(context: CommandContext): CommandResult;
  abstract toPayload(): CommandPayload;

  /**
   * Default implementation - commands cannot be merged unless overridden
   */
  canMergeWith(_other: CMSCommand): boolean {
    return false;
  }

  /**
   * Helper to create a successful result
   */
  protected successResult(homepage: Homepage, affectedSectionIds?: string[]): CommandResult {
    return {
      success: true,
      homepage,
      affectedSectionIds,
    };
  }

  /**
   * Helper to create an error result
   */
  protected errorResult(homepage: Homepage, error: string): CommandResult {
    return {
      success: false,
      homepage,
      error,
    };
  }

  /**
   * Helper to deep clone a section
   */
  protected cloneSection(section: Section): Section {
    return JSON.parse(JSON.stringify(section));
  }

  /**
   * Helper to update a section in the homepage
   */
  protected updateSectionInHomepage(
    homepage: Homepage,
    sectionId: string,
    updates: Partial<Section>
  ): Homepage {
    return {
      ...homepage,
      sections: homepage.sections.map((section) =>
        section.id === sectionId
          ? ({ ...section, ...updates, updated_at: new Date().toISOString() } as Section)
          : section
      ),
      updated_at: new Date().toISOString(),
    };
  }
}

/**
 * Command factory for creating commands from payloads
 * Used when restoring commands from persistence
 */
export interface CommandFactory {
  createFromPayload(payload: CommandPayload): CMSCommand | null;
}

/**
 * Batch command for grouping multiple commands
 */
export class BatchCommand extends BaseCMSCommand {
  readonly commands: CMSCommand[];
  private _description: string;

  constructor(commands: CMSCommand[], description?: string) {
    super();
    this.commands = commands;
    this._description = description || `Batch: ${commands.length} operations`;
  }

  get description(): string {
    return this._description;
  }

  get type(): CMSActionType {
    return 'section_update';
  }

  execute(context: CommandContext): CommandResult {
    let currentHomepage = context.homepage;
    const affectedIds: string[] = [];

    for (const command of this.commands) {
      const result = command.execute({ ...context, homepage: currentHomepage });
      if (!result.success) {
        return this.errorResult(currentHomepage, result.error || 'Batch operation failed');
      }
      currentHomepage = result.homepage;
      if (result.affectedSectionIds) {
        affectedIds.push(...result.affectedSectionIds);
      }
    }

    return this.successResult(currentHomepage, Array.from(new Set(affectedIds)));
  }

  undo(context: CommandContext): CommandResult {
    let currentHomepage = context.homepage;
    const affectedIds: string[] = [];

    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      const result = this.commands[i].undo({ ...context, homepage: currentHomepage });
      if (!result.success) {
        return this.errorResult(currentHomepage, result.error || 'Batch undo failed');
      }
      currentHomepage = result.homepage;
      if (result.affectedSectionIds) {
        affectedIds.push(...result.affectedSectionIds);
      }
    }

    return this.successResult(currentHomepage, Array.from(new Set(affectedIds)));
  }

  toPayload(): CommandPayload {
    return {
      type: this.type,
      timestamp: this.timestamp,
      data: {
        commands: this.commands.map((cmd) => cmd.toPayload()),
      },
      inverseData: {},
    };
  }
}
