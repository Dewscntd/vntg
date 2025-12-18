/**
 * CMS Template Management Type System
 *
 * Type definitions for template management, versioning, and collaboration.
 * Extends the base CMS types with template-specific functionality.
 */

import { Homepage } from './cms';

// ============================================================================
// CORE TYPES
// ============================================================================

export type TemplateStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived';

export type TemplateCategory =
  | 'seasonal'
  | 'promotional'
  | 'editorial'
  | 'product_launch'
  | 'event'
  | 'custom';

export type ChangeType = 'create' | 'edit' | 'revert' | 'merge' | 'duplicate';

export type ActionType =
  | 'create_template'
  | 'update_template'
  | 'delete_template'
  | 'create_version'
  | 'publish_version'
  | 'unpublish_version'
  | 'schedule_publish'
  | 'cancel_schedule'
  | 'revert_version'
  | 'duplicate_template'
  | 'update_sections'
  | 'reorder_sections'
  | 'add_section'
  | 'remove_section'
  | 'update_section';

export type ScheduleStatus = 'pending' | 'active' | 'expired' | 'cancelled' | 'failed';

export type CollaboratorRole = 'owner' | 'editor' | 'reviewer' | 'viewer';

export type CommentType = 'general' | 'suggestion' | 'issue' | 'approval' | 'rejection';

// ============================================================================
// TEMPLATE INTERFACES
// ============================================================================

/**
 * Master template record with metadata and version references
 */
export interface CMSTemplate {
  id: string;

  // Identity
  name: string;
  slug: string;
  description: string | null;

  // Categorization
  category: TemplateCategory;
  tags: string[];
  thumbnail_url: string | null;

  // Version Management
  current_version_id: string | null;
  published_version_id: string | null;

  // Status
  status: TemplateStatus;

  // Publishing Schedule
  scheduled_publish_at: string | null;
  scheduled_unpublish_at: string | null;
  published_at: string | null;
  unpublished_at: string | null;

  // User Attribution
  created_by: string | null;
  updated_by: string | null;
  published_by: string | null;

  // Metadata
  metadata: Record<string, unknown>;

  // Analytics
  view_count: number;
  last_viewed_at: string | null;

  // Soft Delete
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Template version with complete content snapshot
 */
export interface CMSTemplateVersion {
  id: string;
  template_id: string;

  // Version Identity
  version_number: number;
  version_name: string | null;

  // Content Snapshot (Homepage configuration)
  content: Homepage;
  sections_count: number;

  // Version Metadata
  change_summary: string | null;
  change_type: ChangeType;

  // Version Relationships
  parent_version_id: string | null;
  based_on_version_id: string | null;

  // Publication Status
  is_published: boolean;
  published_at: string | null;

  // User Attribution
  created_by: string | null;

  // Content Validation
  is_valid: boolean;
  validation_errors: ValidationError[] | null;

  // Content Hash (auto-generated)
  content_hash: string;

  // Timestamps
  created_at: string;
}

/**
 * Action history for undo/redo operations
 */
export interface CMSActionHistory {
  id: string;

  // Action Context
  template_id: string;
  version_id: string | null;

  // Action Details
  action_type: ActionType;
  action_data: Record<string, unknown>;

  // Reversal Support
  is_undoable: boolean;
  is_undone: boolean;
  undone_at: string | null;
  undone_by: string | null;

  // Action Grouping
  action_group_id: string | null;
  action_sequence: number | null;

  // User Attribution
  performed_by: string | null;

  // Session Tracking
  session_id: string | null;
  ip_address: string | null;
  user_agent: string | null;

  // Timestamps
  created_at: string;

  // Metadata
  metadata: Record<string, unknown>;
}

/**
 * Template publishing schedule
 */
export interface CMSTemplateSchedule {
  id: string;

  // Schedule Context
  template_id: string;
  version_id: string;

  // Schedule Configuration
  publish_at: string;
  unpublish_at: string | null;
  timezone: string;

  // Recurrence
  is_recurring: boolean;
  recurrence_rule: string | null;
  recurrence_end_date: string | null;

  // Execution Status
  status: ScheduleStatus;
  executed_at: string | null;
  execution_attempts: number;
  last_execution_error: string | null;

  // Notification Configuration
  notify_on_publish: boolean;
  notify_on_unpublish: boolean;
  notification_emails: string[] | null;

  // User Attribution
  created_by: string | null;
  updated_by: string | null;

  // Metadata
  notes: string | null;
  metadata: Record<string, unknown>;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Template collaborator with role-based permissions
 */
export interface CMSTemplateCollaborator {
  id: string;

  // Collaboration Context
  template_id: string;
  user_id: string;

  // Permission Level
  role: CollaboratorRole;

  // Access Control (computed)
  can_edit: boolean;
  can_publish: boolean;
  can_delete: boolean;

  // Invitation Tracking
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;

  // Metadata
  notes: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Template comment for review and collaboration
 */
export interface CMSTemplateComment {
  id: string;

  // Comment Context
  template_id: string;
  version_id: string | null;

  // Comment Content
  content: string;
  comment_type: CommentType;

  // Threading
  parent_comment_id: string | null;
  thread_level: number;

  // Section Reference
  section_id: string | null;

  // Resolution Status
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;

  // User Attribution
  created_by: string;

  // Soft Delete
  is_deleted: boolean;
  deleted_at: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

/**
 * Template statistics (from materialized view)
 */
export interface CMSTemplateStats {
  template_id: string;
  name: string;
  category: TemplateCategory;
  status: TemplateStatus;
  version_count: number;
  comment_count: number;
  collaborator_count: number;
  last_version_at: string | null;
  last_comment_at: string | null;
  view_count: number;
  created_at: string;
  published_at: string | null;
}

/**
 * User information for attribution
 */
export interface CMSUser {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

// ============================================================================
// EXTENDED TYPES WITH RELATIONS
// ============================================================================

/**
 * Template with current version populated
 */
export interface CMSTemplateWithVersion extends CMSTemplate {
  current_version: CMSTemplateVersion | null;
  published_version: CMSTemplateVersion | null;
}

/**
 * Template with all related data
 */
export interface CMSTemplateWithRelations extends CMSTemplate {
  current_version: CMSTemplateVersion | null;
  published_version: CMSTemplateVersion | null;
  collaborators: (CMSTemplateCollaborator & { user: CMSUser })[];
  schedules: CMSTemplateSchedule[];
  stats: CMSTemplateStats | null;
}

/**
 * Version with user information
 */
export interface CMSTemplateVersionWithUser extends CMSTemplateVersion {
  created_by_user: CMSUser | null;
}

/**
 * Action history with user information
 */
export interface CMSActionHistoryWithUser extends CMSActionHistory {
  performed_by_user: CMSUser | null;
  version: CMSTemplateVersion | null;
}

/**
 * Comment with user and replies
 */
export interface CMSTemplateCommentWithReplies extends CMSTemplateComment {
  created_by_user: CMSUser;
  replies: CMSTemplateComment[];
  resolved_by_user: CMSUser | null;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Request to create a new template
 */
export interface CreateTemplateRequest {
  name: string;
  slug: string;
  description?: string;
  category: TemplateCategory;
  tags?: string[];
  content: Homepage;
}

/**
 * Response from create template operation
 */
export interface CreateTemplateResponse {
  template_id: string;
  version_id: string;
  version_number: number;
}

/**
 * Request to update a template
 */
export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  category?: TemplateCategory;
  tags?: string[];
  content?: Homepage;
  change_summary?: string;
}

/**
 * Request to publish a template
 */
export interface PublishTemplateRequest {
  template_id: string;
  version_id?: string; // Defaults to current version
}

/**
 * Response from publish operation
 */
export interface PublishTemplateResponse {
  template_id: string;
  version_id: string;
  published_at: string;
}

/**
 * Request to revert to a previous version
 */
export interface RevertVersionRequest {
  template_id: string;
  target_version_id: string;
}

/**
 * Response from revert operation
 */
export interface RevertVersionResponse {
  template_id: string;
  new_version_id: string;
  new_version_number: number;
  reverted_from_version: number;
}

/**
 * Request to schedule a template publish
 */
export interface SchedulePublishRequest {
  template_id: string;
  version_id: string;
  publish_at: string; // ISO 8601 timestamp
  unpublish_at?: string; // ISO 8601 timestamp
  timezone?: string; // IANA timezone (default: UTC)
  is_recurring?: boolean;
  recurrence_rule?: string; // iCal RRULE format
  notify_on_publish?: boolean;
  notify_on_unpublish?: boolean;
  notification_emails?: string[];
  notes?: string;
}

/**
 * Request to duplicate a template
 */
export interface DuplicateTemplateRequest {
  source_template_id: string;
  new_name: string;
  new_slug: string;
}

/**
 * Response from duplicate operation
 */
export interface DuplicateTemplateResponse {
  template_id: string;
  version_id: string;
}

/**
 * Request to add a collaborator
 */
export interface AddCollaboratorRequest {
  template_id: string;
  user_id: string;
  role: CollaboratorRole;
  notes?: string;
}

/**
 * Request to add a comment
 */
export interface AddCommentRequest {
  template_id: string;
  version_id?: string;
  content: string;
  comment_type?: CommentType;
  parent_comment_id?: string;
  section_id?: string;
}

/**
 * Undo/redo action request
 */
export interface UndoRedoRequest {
  template_id: string;
  action_id: string;
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

/**
 * Template list filters
 */
export interface TemplateListFilters {
  status?: TemplateStatus[];
  category?: TemplateCategory[];
  tags?: string[];
  created_by?: string;
  search?: string; // Full-text search on name
  sort_by?: 'created_at' | 'updated_at' | 'name' | 'view_count';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Version history filters
 */
export interface VersionHistoryFilters {
  template_id: string;
  created_by?: string;
  change_type?: ChangeType[];
  is_published?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Action history filters
 */
export interface ActionHistoryFilters {
  template_id: string;
  action_type?: ActionType[];
  performed_by?: string;
  date_from?: string;
  date_to?: string;
  is_undoable?: boolean;
  is_undone?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================================
// EDITOR STATE TYPES
// ============================================================================

/**
 * Template editor state
 */
export interface TemplateEditorState {
  template: CMSTemplate | null;
  currentVersion: CMSTemplateVersion | null;
  publishedVersion: CMSTemplateVersion | null;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  validationErrors: ValidationError[];

  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  actionHistory: CMSActionHistory[];

  // Collaboration
  collaborators: (CMSTemplateCollaborator & { user: CMSUser })[];
  comments: CMSTemplateCommentWithReplies[];

  // UI State
  selectedSectionId: string | null;
  previewMode: boolean;
  showComments: boolean;
  showVersionHistory: boolean;
}

/**
 * Template editor actions
 */
export type TemplateEditorAction =
  | { type: 'LOAD_TEMPLATE'; payload: { template: CMSTemplate; version: CMSTemplateVersion } }
  | { type: 'UPDATE_CONTENT'; payload: { content: Homepage } }
  | { type: 'SAVE_VERSION'; payload: { version: CMSTemplateVersion } }
  | { type: 'PUBLISH'; payload: { publishedAt: string } }
  | { type: 'REVERT'; payload: { version: CMSTemplateVersion } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'ADD_COMMENT'; payload: { comment: CMSTemplateComment } }
  | { type: 'RESOLVE_COMMENT'; payload: { commentId: string } }
  | { type: 'SELECT_SECTION'; payload: { sectionId: string | null } }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'TOGGLE_COMMENTS' }
  | { type: 'TOGGLE_VERSION_HISTORY' }
  | { type: 'SET_VALIDATION_ERRORS'; payload: { errors: ValidationError[] } };

// ============================================================================
// UTILITY FUNCTIONS TYPES
// ============================================================================

/**
 * Template comparison result
 */
export interface TemplateComparison {
  added_sections: string[];
  removed_sections: string[];
  modified_sections: string[];
  metadata_changes: Record<string, { old: unknown; new: unknown }>;
}

/**
 * Template export format
 */
export interface TemplateExport {
  export_version: string; // Export format version
  exported_at: string;
  template: CMSTemplate;
  template_version: CMSTemplateVersion;
  collaborators: CMSTemplateCollaborator[];
}

// ============================================================================
// FUNCTION RETURN TYPES (Database Functions)
// ============================================================================

/**
 * Return type for cms_create_template()
 */
export interface CreateTemplateResult {
  template_id: string;
  version_id: string;
  version_number: number;
}

/**
 * Return type for cms_publish_template()
 */
export interface PublishTemplateResult {
  template_id: string;
  version_id: string;
  published_at: string;
}

/**
 * Return type for cms_revert_to_version()
 */
export interface RevertToVersionResult {
  template_id: string;
  new_version_id: string;
  new_version_number: number;
  reverted_from_version: number;
}

/**
 * Return type for cms_process_scheduled_publishes()
 */
export interface ScheduledPublishResult {
  template_id: string;
  version_id: string;
  action: 'published' | 'unpublished';
  executed_at: string;
}

/**
 * Return type for cms_get_action_history()
 */
export interface ActionHistoryResult {
  action_id: string;
  action_type: ActionType;
  action_data: Record<string, unknown>;
  version_id: string | null;
  version_number: number | null;
  performed_by: string | null;
  performed_by_email: string | null;
  created_at: string;
  is_undoable: boolean;
  is_undone: boolean;
}

/**
 * Return type for cms_duplicate_template()
 */
export interface DuplicateTemplateResult {
  template_id: string;
  version_id: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isCMSTemplate(obj: unknown): obj is CMSTemplate {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'slug' in obj &&
    'status' in obj
  );
}

export function isCMSTemplateVersion(obj: unknown): obj is CMSTemplateVersion {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'template_id' in obj &&
    'version_number' in obj &&
    'content' in obj
  );
}

export function isValidationError(obj: unknown): obj is ValidationError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'field' in obj &&
    'message' in obj &&
    'code' in obj &&
    'severity' in obj
  );
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'seasonal',
  'promotional',
  'editorial',
  'product_launch',
  'event',
  'custom',
];

export const TEMPLATE_STATUSES: TemplateStatus[] = [
  'draft',
  'review',
  'scheduled',
  'published',
  'archived',
];

export const COLLABORATOR_ROLES: CollaboratorRole[] = ['owner', 'editor', 'reviewer', 'viewer'];

export const COMMENT_TYPES: CommentType[] = [
  'general',
  'suggestion',
  'issue',
  'approval',
  'rejection',
];

// Permissions mapping
export const ROLE_PERMISSIONS: Record<
  CollaboratorRole,
  {
    can_view: boolean;
    can_edit: boolean;
    can_comment: boolean;
    can_publish: boolean;
    can_delete: boolean;
    can_manage_collaborators: boolean;
  }
> = {
  owner: {
    can_view: true,
    can_edit: true,
    can_comment: true,
    can_publish: true,
    can_delete: true,
    can_manage_collaborators: true,
  },
  editor: {
    can_view: true,
    can_edit: true,
    can_comment: true,
    can_publish: true,
    can_delete: false,
    can_manage_collaborators: false,
  },
  reviewer: {
    can_view: true,
    can_edit: false,
    can_comment: true,
    can_publish: false,
    can_delete: false,
    can_manage_collaborators: false,
  },
  viewer: {
    can_view: true,
    can_edit: false,
    can_comment: false,
    can_publish: false,
    can_delete: false,
    can_manage_collaborators: false,
  },
};
