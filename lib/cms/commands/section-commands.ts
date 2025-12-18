/**
 * Section Commands for CMS Operations
 *
 * Implements specific command classes for section manipulation.
 * Each command supports execute and undo operations.
 */

import { Section, Homepage, SectionType } from '@/types/cms';
import {
  BaseCMSCommand,
  CMSActionType,
  CommandContext,
  CommandResult,
  CommandPayload,
  CMSCommand,
} from './command-interface';

/**
 * Add Section Command
 */
export class AddSectionCommand extends BaseCMSCommand {
  private section: Section;
  private insertIndex: number;

  constructor(section: Section, insertIndex?: number) {
    super();
    this.section = this.cloneSection(section);
    this.insertIndex = insertIndex ?? -1;
  }

  get description(): string {
    return `Add ${this.section.type.replace('_', ' ')} section`;
  }

  get type(): CMSActionType {
    return 'section_add';
  }

  execute(context: CommandContext): CommandResult {
    const { homepage } = context;
    const newSections = [...homepage.sections];

    // Insert at specified index or at the end
    const index = this.insertIndex >= 0 ? this.insertIndex : newSections.length;
    newSections.splice(index, 0, this.section);

    // Update order values
    const reorderedSections = newSections.map((section, i) => ({
      ...section,
      order: i,
    })) as Section[];

    return this.successResult(
      {
        ...homepage,
        sections: reorderedSections,
        updated_at: new Date().toISOString(),
      },
      [this.section.id]
    );
  }

  undo(context: CommandContext): CommandResult {
    const { homepage } = context;
    const newSections = homepage.sections.filter((s) => s.id !== this.section.id);

    // Update order values
    const reorderedSections = newSections.map((section, i) => ({
      ...section,
      order: i,
    })) as Section[];

    return this.successResult(
      {
        ...homepage,
        sections: reorderedSections,
        updated_at: new Date().toISOString(),
      },
      [this.section.id]
    );
  }

  toPayload(): CommandPayload {
    return {
      type: this.type,
      timestamp: this.timestamp,
      data: {
        section: this.section,
        insertIndex: this.insertIndex,
      },
      inverseData: {
        sectionId: this.section.id,
      },
    };
  }
}

/**
 * Remove Section Command
 */
export class RemoveSectionCommand extends BaseCMSCommand {
  private sectionId: string;
  private removedSection: Section | null = null;
  private originalIndex: number = -1;

  constructor(sectionId: string) {
    super();
    this.sectionId = sectionId;
  }

  get description(): string {
    const type = this.removedSection?.type.replace('_', ' ') || 'section';
    return `Remove ${type}`;
  }

  get type(): CMSActionType {
    return 'section_remove';
  }

  execute(context: CommandContext): CommandResult {
    const { homepage } = context;

    // Find and store the section being removed
    this.originalIndex = homepage.sections.findIndex((s) => s.id === this.sectionId);

    if (this.originalIndex === -1) {
      return this.errorResult(homepage, `Section ${this.sectionId} not found`);
    }

    this.removedSection = this.cloneSection(homepage.sections[this.originalIndex]);

    // Remove the section
    const newSections = homepage.sections.filter((s) => s.id !== this.sectionId);

    // Update order values
    const reorderedSections = newSections.map((section, i) => ({
      ...section,
      order: i,
    })) as Section[];

    return this.successResult(
      {
        ...homepage,
        sections: reorderedSections,
        updated_at: new Date().toISOString(),
      },
      [this.sectionId]
    );
  }

  undo(context: CommandContext): CommandResult {
    if (!this.removedSection) {
      return this.errorResult(context.homepage, 'No section to restore');
    }

    const { homepage } = context;
    const newSections = [...homepage.sections];

    // Re-insert at original position
    newSections.splice(this.originalIndex, 0, this.removedSection);

    // Update order values
    const reorderedSections = newSections.map((section, i) => ({
      ...section,
      order: i,
    })) as Section[];

    return this.successResult(
      {
        ...homepage,
        sections: reorderedSections,
        updated_at: new Date().toISOString(),
      },
      [this.sectionId]
    );
  }

  toPayload(): CommandPayload {
    return {
      type: this.type,
      timestamp: this.timestamp,
      data: {
        sectionId: this.sectionId,
      },
      inverseData: {
        section: this.removedSection,
        originalIndex: this.originalIndex,
      },
    };
  }
}

/**
 * Update Section Command
 */
export class UpdateSectionCommand extends BaseCMSCommand {
  private sectionId: string;
  private updates: Partial<Section>;
  private previousState: Section | null = null;
  private mergeWindow: number = 500; // ms to merge rapid edits

  constructor(sectionId: string, updates: Partial<Section>) {
    super();
    this.sectionId = sectionId;
    this.updates = { ...updates };
  }

  get description(): string {
    const keys = Object.keys(this.updates);
    if (keys.includes('config')) {
      return 'Update section settings';
    }
    if (keys.includes('visible')) {
      return this.updates.visible ? 'Show section' : 'Hide section';
    }
    if (keys.includes('title')) {
      return 'Update section title';
    }
    return 'Update section';
  }

  get type(): CMSActionType {
    if ('visible' in this.updates) {
      return 'section_visibility';
    }
    return 'section_update';
  }

  execute(context: CommandContext): CommandResult {
    const { homepage } = context;

    // Find the section
    const section = homepage.sections.find((s) => s.id === this.sectionId);
    if (!section) {
      return this.errorResult(homepage, `Section ${this.sectionId} not found`);
    }

    // Store previous state for undo
    this.previousState = this.cloneSection(section);

    // Apply updates
    const updatedHomepage = this.updateSectionInHomepage(homepage, this.sectionId, this.updates);

    return this.successResult(updatedHomepage, [this.sectionId]);
  }

  undo(context: CommandContext): CommandResult {
    if (!this.previousState) {
      return this.errorResult(context.homepage, 'No previous state to restore');
    }

    const updatedHomepage = this.updateSectionInHomepage(
      context.homepage,
      this.sectionId,
      this.previousState
    );

    return this.successResult(updatedHomepage, [this.sectionId]);
  }

  canMergeWith(other: CMSCommand): boolean {
    if (!(other instanceof UpdateSectionCommand)) return false;
    if (other.sectionId !== this.sectionId) return false;

    // Only merge within time window
    const timeDiff = Math.abs(this.timestamp - other.timestamp);
    return timeDiff < this.mergeWindow;
  }

  mergeWith(other: CMSCommand): CMSCommand {
    if (!(other instanceof UpdateSectionCommand)) return this;

    // Create merged command with combined updates
    // Cast required due to discriminated union types
    const merged = new UpdateSectionCommand(this.sectionId, {
      ...this.updates,
      ...other.updates,
    } as Partial<Section>);

    // Preserve original previous state
    merged.previousState = this.previousState;

    return merged;
  }

  toPayload(): CommandPayload {
    return {
      type: this.type,
      timestamp: this.timestamp,
      data: {
        sectionId: this.sectionId,
        updates: this.updates,
      },
      inverseData: {
        sectionId: this.sectionId,
        previousState: this.previousState,
      },
    };
  }
}

/**
 * Reorder Section Command
 */
export class ReorderSectionCommand extends BaseCMSCommand {
  private sectionId: string;
  private fromIndex: number;
  private toIndex: number;

  constructor(sectionId: string, fromIndex: number, toIndex: number) {
    super();
    this.sectionId = sectionId;
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
  }

  get description(): string {
    const direction = this.toIndex < this.fromIndex ? 'up' : 'down';
    return `Move section ${direction}`;
  }

  get type(): CMSActionType {
    return 'section_reorder';
  }

  execute(context: CommandContext): CommandResult {
    const { homepage } = context;

    if (this.fromIndex === this.toIndex) {
      return this.successResult(homepage);
    }

    const newSections = [...homepage.sections];
    const [movedSection] = newSections.splice(this.fromIndex, 1);
    newSections.splice(this.toIndex, 0, movedSection);

    // Update order values
    const reorderedSections = newSections.map((section, i) => ({
      ...section,
      order: i,
    })) as Section[];

    return this.successResult(
      {
        ...homepage,
        sections: reorderedSections,
        updated_at: new Date().toISOString(),
      },
      [this.sectionId]
    );
  }

  undo(context: CommandContext): CommandResult {
    // Reverse the move
    const { homepage } = context;
    const newSections = [...homepage.sections];
    const [movedSection] = newSections.splice(this.toIndex, 1);
    newSections.splice(this.fromIndex, 0, movedSection);

    // Update order values
    const reorderedSections = newSections.map((section, i) => ({
      ...section,
      order: i,
    })) as Section[];

    return this.successResult(
      {
        ...homepage,
        sections: reorderedSections,
        updated_at: new Date().toISOString(),
      },
      [this.sectionId]
    );
  }

  toPayload(): CommandPayload {
    return {
      type: this.type,
      timestamp: this.timestamp,
      data: {
        sectionId: this.sectionId,
        fromIndex: this.fromIndex,
        toIndex: this.toIndex,
      },
      inverseData: {
        sectionId: this.sectionId,
        fromIndex: this.toIndex,
        toIndex: this.fromIndex,
      },
    };
  }
}

/**
 * Duplicate Section Command
 */
export class DuplicateSectionCommand extends BaseCMSCommand {
  private sourceSectionId: string;
  private newSectionId: string;
  private duplicatedSection: Section | null = null;

  constructor(sourceSectionId: string) {
    super();
    this.sourceSectionId = sourceSectionId;
    this.newSectionId = crypto.randomUUID();
  }

  get description(): string {
    return 'Duplicate section';
  }

  get type(): CMSActionType {
    return 'section_duplicate';
  }

  execute(context: CommandContext): CommandResult {
    const { homepage } = context;

    // Find source section
    const sourceIndex = homepage.sections.findIndex((s) => s.id === this.sourceSectionId);
    if (sourceIndex === -1) {
      return this.errorResult(homepage, `Source section ${this.sourceSectionId} not found`);
    }

    const sourceSection = homepage.sections[sourceIndex];

    // Create duplicate with new ID
    const now = new Date().toISOString();
    this.duplicatedSection = {
      ...this.cloneSection(sourceSection),
      id: this.newSectionId,
      created_at: now,
      updated_at: now,
    };

    // Insert after source
    const newSections = [...homepage.sections];
    newSections.splice(sourceIndex + 1, 0, this.duplicatedSection);

    // Update order values
    const reorderedSections = newSections.map((section, i) => ({
      ...section,
      order: i,
    })) as Section[];

    return this.successResult(
      {
        ...homepage,
        sections: reorderedSections,
        updated_at: now,
      },
      [this.newSectionId]
    );
  }

  undo(context: CommandContext): CommandResult {
    const { homepage } = context;

    // Remove the duplicated section
    const newSections = homepage.sections.filter((s) => s.id !== this.newSectionId);

    // Update order values
    const reorderedSections = newSections.map((section, i) => ({
      ...section,
      order: i,
    })) as Section[];

    return this.successResult(
      {
        ...homepage,
        sections: reorderedSections,
        updated_at: new Date().toISOString(),
      },
      [this.newSectionId]
    );
  }

  toPayload(): CommandPayload {
    return {
      type: this.type,
      timestamp: this.timestamp,
      data: {
        sourceSectionId: this.sourceSectionId,
        newSectionId: this.newSectionId,
      },
      inverseData: {
        sectionId: this.newSectionId,
      },
    };
  }
}

/**
 * Toggle Section Visibility Command
 */
export class ToggleVisibilityCommand extends BaseCMSCommand {
  private sectionId: string;
  private newVisible: boolean;
  private previousVisible: boolean | null = null;

  constructor(sectionId: string, visible?: boolean) {
    super();
    this.sectionId = sectionId;
    this.newVisible = visible ?? true;
  }

  get description(): string {
    return this.newVisible ? 'Show section' : 'Hide section';
  }

  get type(): CMSActionType {
    return 'section_visibility';
  }

  execute(context: CommandContext): CommandResult {
    const { homepage } = context;

    // Find the section
    const section = homepage.sections.find((s) => s.id === this.sectionId);
    if (!section) {
      return this.errorResult(homepage, `Section ${this.sectionId} not found`);
    }

    // Store previous state
    this.previousVisible = section.visible;

    // If no explicit value provided, toggle current state
    if (this.newVisible === null) {
      this.newVisible = !section.visible;
    }

    const updatedHomepage = this.updateSectionInHomepage(homepage, this.sectionId, {
      visible: this.newVisible,
    });

    return this.successResult(updatedHomepage, [this.sectionId]);
  }

  undo(context: CommandContext): CommandResult {
    if (this.previousVisible === null) {
      return this.errorResult(context.homepage, 'No previous visibility state');
    }

    const updatedHomepage = this.updateSectionInHomepage(context.homepage, this.sectionId, {
      visible: this.previousVisible,
    });

    return this.successResult(updatedHomepage, [this.sectionId]);
  }

  toPayload(): CommandPayload {
    return {
      type: this.type,
      timestamp: this.timestamp,
      data: {
        sectionId: this.sectionId,
        visible: this.newVisible,
      },
      inverseData: {
        sectionId: this.sectionId,
        visible: this.previousVisible,
      },
    };
  }
}

/**
 * Create default section configuration based on type
 */
export function createDefaultSection(sectionType: SectionType): Section {
  const now = new Date().toISOString();
  const baseSection = {
    id: crypto.randomUUID(),
    type: sectionType,
    status: 'draft' as const,
    order: 0,
    visible: true,
    created_at: now,
    updated_at: now,
  };

  switch (sectionType) {
    case 'hero':
      return {
        ...baseSection,
        config: {
          headline: 'New Hero Section',
          subheadline: 'Add your subheadline here',
          textAlignment: 'center',
          textColor: '#FFFFFF',
          overlayOpacity: 0.4,
          height: 'lg',
          contentPosition: 'center',
        },
      } as Section;

    case 'product_carousel':
      return {
        ...baseSection,
        title: 'Featured Products',
        subtitle: '',
        config: {
          products: [],
          dynamicSelection: {
            enabled: true,
            source: 'featured',
            limit: 8,
          },
          itemsPerView: { mobile: 1, tablet: 2, desktop: 4 },
          gap: 16,
          autoplay: { enabled: false, delay: 3000 },
          loop: true,
          showArrows: true,
          showDots: true,
          animation: { type: 'slide', duration: 0.3 },
          cardStyle: {
            hoverEffect: 'lift',
            showQuickView: true,
            showAddToCart: true,
            showWishlist: true,
          },
        },
      } as Section;

    case 'category_grid':
      return {
        ...baseSection,
        config: {
          title: 'Shop by Category',
          categories: [],
          columns: { mobile: 2, tablet: 3, desktop: 4 },
          cardStyle: 'overlay',
        },
      } as Section;

    case 'text_block':
      return {
        ...baseSection,
        config: {
          content: '<p>Enter your content here...</p>',
          alignment: 'center',
          maxWidth: 'lg',
          padding: { top: 48, bottom: 48, left: 16, right: 16 },
        },
      } as Section;

    case 'image_banner':
      return {
        ...baseSection,
        config: {
          image: '',
          alt: 'Banner image',
          height: 'md',
          objectFit: 'cover',
        },
      } as Section;

    default:
      return baseSection as Section;
  }
}
