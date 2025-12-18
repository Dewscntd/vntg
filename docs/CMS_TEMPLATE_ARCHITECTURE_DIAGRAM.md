# CMS Template Management - Architecture Diagrams

**Version:** 1.0.0
**Last Updated:** 2024-12-18

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Template   │  │   Version    │  │ Collaboration│             │
│  │     List     │  │   History    │  │  & Comments  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                      │
│  ┌──────────────────────────────────────────────────┐              │
│  │          Template Editor (React Context)          │              │
│  │  - Content editing                                │              │
│  │  - Version control (undo/redo)                    │              │
│  │  - Real-time preview                              │              │
│  │  - Collaboration features                         │              │
│  └──────────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER (Next.js)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  GET /api/admin/templates              ┌──────────────────┐        │
│  POST /api/admin/templates             │   Validation     │        │
│  GET /api/admin/templates/[id]         │   (Zod schemas)  │        │
│  PATCH /api/admin/templates/[id]       └──────────────────┘        │
│  DELETE /api/admin/templates/[id]               │                   │
│  POST /api/admin/templates/[id]/publish         │                   │
│  POST /api/admin/templates/[id]/revert          │                   │
│  POST /api/admin/templates/[id]/duplicate       │                   │
│  GET /api/admin/templates/[id]/versions         │                   │
│  GET /api/admin/templates/[id]/actions          │                   │
│  POST /api/admin/templates/[id]/schedules       │                   │
│  GET /api/admin/templates/[id]/collaborators    │                   │
│  POST /api/admin/templates/[id]/comments        │                   │
│                                                  │                   │
└──────────────────────────────────────────────────┼───────────────────┘
                              │                    │
                              ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Auth Session │  │ Row Level    │  │  Database    │             │
│  │ Verification │  │  Security    │  │  Functions   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (PostgreSQL)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                     CORE TABLES                             │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │                                                             │    │
│  │  cms_templates                                              │    │
│  │  ├── id (PK)                                                │    │
│  │  ├── name, slug, description, category                      │    │
│  │  ├── status, tags, thumbnail_url                            │    │
│  │  ├── current_version_id → cms_template_versions            │    │
│  │  ├── published_version_id → cms_template_versions          │    │
│  │  ├── scheduled_publish_at, published_at                     │    │
│  │  ├── created_by → users, updated_by → users                │    │
│  │  └── metadata (JSONB), view_count, timestamps               │    │
│  │                                                             │    │
│  │  cms_template_versions                                      │    │
│  │  ├── id (PK), template_id (FK)                              │    │
│  │  ├── version_number (auto-increment)                        │    │
│  │  ├── content (JSONB) ← Complete homepage config            │    │
│  │  ├── change_summary, change_type                            │    │
│  │  ├── parent_version_id, based_on_version_id                │    │
│  │  ├── is_published, published_at                             │    │
│  │  ├── created_by → users                                     │    │
│  │  ├── is_valid, validation_errors                            │    │
│  │  └── content_hash (computed)                                │    │
│  │                                                             │    │
│  │  cms_action_history                                         │    │
│  │  ├── id (PK), template_id (FK), version_id (FK)            │    │
│  │  ├── action_type (enum)                                     │    │
│  │  ├── action_data (JSONB)                                    │    │
│  │  ├── is_undoable, is_undone                                 │    │
│  │  ├── action_group_id (for composite operations)            │    │
│  │  ├── performed_by → users                                   │    │
│  │  ├── session_id, ip_address, user_agent                     │    │
│  │  └── timestamps, metadata                                   │    │
│  │                                                             │    │
│  │  cms_template_schedules                                     │    │
│  │  ├── id (PK), template_id (FK), version_id (FK)            │    │
│  │  ├── publish_at, unpublish_at, timezone                     │    │
│  │  ├── is_recurring, recurrence_rule                          │    │
│  │  ├── status (pending/active/expired/cancelled/failed)       │    │
│  │  ├── executed_at, execution_attempts                        │    │
│  │  ├── notification_emails                                    │    │
│  │  └── created_by → users, notes                              │    │
│  │                                                             │    │
│  │  cms_template_collaborators                                 │    │
│  │  ├── id (PK), template_id (FK), user_id (FK)               │    │
│  │  ├── role (owner/editor/reviewer/viewer)                    │    │
│  │  ├── can_edit, can_publish, can_delete (computed)           │    │
│  │  ├── invited_by → users                                     │    │
│  │  └── invited_at, accepted_at                                │    │
│  │                                                             │    │
│  │  cms_template_comments                                      │    │
│  │  ├── id (PK), template_id (FK), version_id (FK)            │    │
│  │  ├── content, comment_type                                  │    │
│  │  ├── parent_comment_id (threading)                          │    │
│  │  ├── section_id (optional section reference)               │    │
│  │  ├── is_resolved, resolved_by → users                       │    │
│  │  ├── created_by → users                                     │    │
│  │  └── is_deleted, timestamps                                 │    │
│  │                                                             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                  DATABASE FUNCTIONS                         │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │                                                             │    │
│  │  cms_create_template()                                      │    │
│  │    → Creates template + initial version + owner role        │    │
│  │                                                             │    │
│  │  cms_publish_template()                                     │    │
│  │    → Unpublishes old + publishes new + logs action          │    │
│  │                                                             │    │
│  │  cms_revert_to_version()                                    │    │
│  │    → Creates new version based on old content               │    │
│  │                                                             │    │
│  │  cms_duplicate_template()                                   │    │
│  │    → Clones template with new name/slug                     │    │
│  │                                                             │    │
│  │  cms_process_scheduled_publishes()                          │    │
│  │    → Processes pending schedules (called by cron)           │    │
│  │                                                             │    │
│  │  cms_get_action_history()                                   │    │
│  │    → Returns undo/redo history with user info               │    │
│  │                                                             │    │
│  │  cms_refresh_template_stats()                               │    │
│  │    → Refreshes materialized view for analytics              │    │
│  │                                                             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                      INDEXES (40+)                          │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │                                                             │    │
│  │  Single-column: status, category, created_by, etc.          │    │
│  │  Composite: (status, category, created_at DESC)             │    │
│  │  Partial: WHERE is_deleted = false AND status = 'published' │    │
│  │  GIN: tags[], name (full-text search)                       │    │
│  │                                                             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    ROW LEVEL SECURITY                        │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │                                                             │    │
│  │  Public: Can view published templates only                  │    │
│  │  Admins: Can view/edit all templates                        │    │
│  │  Collaborators: Can view/edit their templates based on role │    │
│  │  Anonymous: No write access                                 │    │
│  │                                                             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKGROUND JOBS (Cron)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Every minute:  cms_process_scheduled_publishes()                   │
│  Every hour:    cms_refresh_template_stats()                        │
│  Daily 1 AM:    Full database backup                                │
│  Daily 9 AM:    Health check report                                 │
│  Weekly Sun 2AM: VACUUM ANALYZE                                     │
│  Monthly 1st Sun 3AM: REINDEX                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Create Template Flow

```
User Action: Click "Create Template"
     │
     ▼
Frontend: Validate form inputs
     │
     ▼
API: POST /api/admin/templates
     │
     ├─→ Validate with Zod schema
     │
     ├─→ Check slug uniqueness
     │
     └─→ Call cms_create_template()
            │
            ▼
Database: BEGIN TRANSACTION
     │
     ├─→ INSERT into cms_templates
     │      └─→ Returns template_id
     │
     ├─→ INSERT into cms_template_versions
     │      ├─→ Auto-increment version_number (trigger)
     │      └─→ Returns version_id
     │
     ├─→ UPDATE cms_templates
     │      └─→ Set current_version_id
     │
     ├─→ INSERT into cms_template_collaborators
     │      └─→ Add creator as owner
     │
     ├─→ INSERT into cms_action_history (trigger)
     │      └─→ Log "create_template" action
     │
     └─→ COMMIT
            │
            ▼
API: Return { template_id, version_id, version_number }
     │
     ▼
Frontend: Redirect to template editor
```

### 2. Publish Template Flow

```
User Action: Click "Publish"
     │
     ▼
Frontend: Confirm publish dialog
     │
     ▼
API: POST /api/admin/templates/[id]/publish
     │
     └─→ Call cms_publish_template()
            │
            ▼
Database: BEGIN TRANSACTION
     │
     ├─→ Get current_version_id
     │
     ├─→ UPDATE cms_template_versions
     │      └─→ Set is_published = false for old version
     │
     ├─→ UPDATE cms_template_versions
     │      └─→ Set is_published = true for new version
     │      └─→ Set published_at = NOW()
     │
     ├─→ UPDATE cms_templates
     │      ├─→ Set status = 'published'
     │      ├─→ Set published_version_id
     │      ├─→ Set published_at = NOW()
     │      └─→ Set published_by = user_id
     │
     ├─→ INSERT into cms_action_history
     │      └─→ Log "publish_version" action
     │
     └─→ COMMIT
            │
            ▼
API: Invalidate cache
     │
     ├─→ Clear template cache
     │
     └─→ Send notification emails
            │
            ▼
Frontend: Show success message + update UI
```

### 3. Scheduled Publish Flow

```
User Action: Schedule future publish
     │
     ▼
Frontend: Select date/time in calendar
     │
     ▼
API: POST /api/admin/templates/[id]/schedules
     │
     └─→ INSERT into cms_template_schedules
            │
            ├─→ publish_at = selected_datetime
            ├─→ status = 'pending'
            └─→ version_id = current_version_id
                   │
                   ▼
           Database: Wait for scheduled time
                   │
                   ▼
Cron Job: Every minute
     │
     └─→ Call cms_process_scheduled_publishes()
            │
            ▼
Database: SELECT schedules WHERE publish_at <= NOW()
     │
     └─→ For each pending schedule:
            │
            ├─→ Call cms_publish_template()
            │
            ├─→ UPDATE schedule status = 'active'
            │
            ├─→ Set executed_at = NOW()
            │
            └─→ Send notification email
                   │
                   ▼
Frontend: WebSocket/polling detects change
     │
     └─→ Show "Template published" notification
```

### 4. Version Revert Flow

```
User Action: Click "Revert to v5"
     │
     ▼
Frontend: Confirm revert dialog
     │
     ▼
API: POST /api/admin/templates/[id]/revert
     │
     └─→ Call cms_revert_to_version()
            │
            ▼
Database: BEGIN TRANSACTION
     │
     ├─→ SELECT content FROM target_version
     │
     ├─→ INSERT into cms_template_versions
     │      ├─→ content = target_version.content
     │      ├─→ change_summary = "Reverted to v5"
     │      ├─→ change_type = 'revert'
     │      ├─→ based_on_version_id = target_version_id
     │      └─→ Returns new_version_id
     │
     ├─→ UPDATE cms_templates
     │      └─→ Set current_version_id = new_version_id
     │
     ├─→ INSERT into cms_action_history
     │      └─→ Log "revert_version" action
     │
     └─→ COMMIT
            │
            ▼
API: Return { new_version_id, new_version_number }
     │
     ▼
Frontend: Reload editor with reverted content
```

### 5. Collaboration Flow

```
Owner: Invite collaborator
     │
     ▼
API: POST /api/admin/templates/[id]/collaborators
     │
     └─→ INSERT into cms_template_collaborators
            │
            ├─→ template_id, user_id, role
            └─→ invited_by = owner_id
                   │
                   ▼
           Send invitation email
                   │
                   ▼
Collaborator: Accept invitation
     │
     └─→ UPDATE cms_template_collaborators
            └─→ Set accepted_at = NOW()
                   │
                   ▼
           RLS grants access
                   │
                   ▼
Collaborator: Can now view/edit template
     │
     ├─→ SELECT queries filtered by RLS
     │      └─→ Policy checks collaborator role
     │
     └─→ INSERT/UPDATE queries validated by RLS
            └─→ Policy checks can_edit permission
```

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
└────────┬────────┘
         │
         │ created_by, updated_by, published_by
         │
         ▼
┌─────────────────────────────────────────┐
│          cms_templates                  │
│  ─────────────────────────────────────  │
│  id (PK)                                │
│  name, slug, description                │◄──────┐
│  category, tags, status                 │       │
│  current_version_id (FK) ───────────┐  │       │
│  published_version_id (FK) ─────┐   │  │       │
│  scheduled_publish_at            │   │  │       │
│  created_by (FK) ────────────────┼───┼──┘       │
│  updated_by (FK)                 │   │          │
│  published_by (FK)               │   │          │
│  metadata (JSONB)                │   │          │
│  view_count, timestamps          │   │          │
└──────────┬───────────────────────┼───┼──────────┘
           │                       │   │
           │                       │   │
           │                       ▼   ▼
           │              ┌─────────────────────────┐
           │              │ cms_template_versions   │
           │              │  ────────────────────── │
           │              │  id (PK)                │
           │              │  template_id (FK) ──────┼──┐
           │              │  version_number         │  │
           │              │  content (JSONB)        │  │
           │              │  change_summary         │  │
           │              │  change_type            │  │
           │              │  parent_version_id (FK) │◄─┘
           │              │  is_published           │
           │              │  created_by (FK)        │
           │              │  content_hash           │
           │              │  timestamps             │
           │              └──────────┬──────────────┘
           │                         │
           │                         │
           ├─────────────────────────┼─────────────────────────┐
           │                         │                         │
           ▼                         ▼                         ▼
┌──────────────────────┐  ┌──────────────────┐  ┌─────────────────────┐
│ cms_action_history   │  │ cms_template_    │  │ cms_template_       │
│  ──────────────────  │  │    schedules     │  │   collaborators     │
│  id (PK)             │  │  ─────────────── │  │  ────────────────── │
│  template_id (FK)    │  │  id (PK)         │  │  id (PK)            │
│  version_id (FK)     │  │  template_id (FK)│  │  template_id (FK)   │
│  action_type         │  │  version_id (FK) │  │  user_id (FK)       │
│  action_data (JSONB) │  │  publish_at      │  │  role (enum)        │
│  is_undoable         │  │  unpublish_at    │  │  can_edit (computed)│
│  performed_by (FK)   │  │  timezone        │  │  can_publish (comp) │
│  session_id          │  │  is_recurring    │  │  invited_by (FK)    │
│  ip_address          │  │  status          │  │  timestamps         │
│  timestamps          │  │  created_by (FK) │  │                     │
└──────────────────────┘  └──────────────────┘  └─────────────────────┘
           │
           │
           ▼
┌──────────────────────┐
│ cms_template_        │
│    comments          │
│  ──────────────────  │
│  id (PK)             │
│  template_id (FK)    │
│  version_id (FK)     │
│  content             │
│  comment_type        │
│  parent_comment_id   │◄──┐
│  section_id          │   │
│  is_resolved         │   │
│  created_by (FK)     │   │
│  timestamps          │   │
└──────────┬───────────┘   │
           └───────────────┘
              (threading)
```

---

## Permission Matrix

```
┌────────────────────┬─────────┬─────────┬──────────┬─────────┬─────────┐
│    Permission      │  Owner  │ Editor  │ Reviewer │ Viewer  │  Admin  │
├────────────────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ View template      │    ✓    │    ✓    │    ✓     │    ✓    │    ✓    │
│ Edit content       │    ✓    │    ✓    │    ✗     │    ✗    │    ✓    │
│ Create version     │    ✓    │    ✓    │    ✗     │    ✗    │    ✓    │
│ Publish            │    ✓    │    ✓    │    ✗     │    ✗    │    ✓    │
│ Schedule publish   │    ✓    │    ✓    │    ✗     │    ✗    │    ✓    │
│ Revert version     │    ✓    │    ✓    │    ✗     │    ✗    │    ✓    │
│ Add comment        │    ✓    │    ✓    │    ✓     │    ✗    │    ✓    │
│ Resolve comment    │    ✓    │    ✓    │    ✓     │    ✗    │    ✓    │
│ Add collaborator   │    ✓    │    ✗    │    ✗     │    ✗    │    ✓    │
│ Remove collaborator│    ✓    │    ✗    │    ✗     │    ✗    │    ✓    │
│ Delete template    │    ✓    │    ✗    │    ✗     │    ✗    │    ✓    │
│ View all templates │    ✗    │    ✗    │    ✗     │    ✗    │    ✓    │
└────────────────────┴─────────┴─────────┴──────────┴─────────┴─────────┘
```

---

## State Machine Diagram

### Template Status Transitions

```
                    ┌──────────┐
         ┌──────────│  draft   │◄─────────┐
         │          └──────────┘          │
         │               │                │
         │               │ submit for     │
         │               │ review         │
         │               ▼                │
         │          ┌──────────┐          │
         │          │  review  │          │
         │          └──────────┘          │
         │           │        │           │
         │  reject   │        │ approve   │
         │           │        │           │
         │           ▼        ▼           │
         │          draft  ┌──────────┐  │
         │                 │scheduled │  │
         │                 └──────────┘  │
         │                      │        │
         │                      │ cron   │
         │                      │ job    │
         │                      ▼        │
         │                 ┌──────────┐  │
         └─────────────────│published │  │
            unpublish      └──────────┘  │
                                │        │
                                │ archive│
                                ▼        │
                           ┌──────────┐ │
                           │ archived │─┘
                           └──────────┘
                                │
                                │ reactivate
                                │
                                ▼
                              draft
```

### Schedule Status Transitions

```
    ┌──────────┐
    │ pending  │
    └──────────┘
         │
         │ publish_at reached
         │
         ▼
    ┌──────────┐
    │  active  │───────────┐
    └──────────┘           │
         │                 │ cancel
         │ unpublish_at    │
         │ reached         │
         ▼                 ▼
    ┌──────────┐      ┌──────────┐
    │ expired  │      │cancelled │
    └──────────┘      └──────────┘
         │                 │
         │                 │
         └────────┬────────┘
                  │
                  │ error during
                  │ execution
                  ▼
             ┌──────────┐
             │  failed  │
             └──────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Load Balancer / CDN                          │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js Application Servers                  │  │
│  │              (Multiple instances)                         │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Supabase (Managed PostgreSQL)                │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Primary Database                                  │  │  │
│  │  │  - cms_templates                                   │  │  │
│  │  │  - cms_template_versions                           │  │  │
│  │  │  - cms_action_history                              │  │  │
│  │  │  - cms_template_schedules                          │  │  │
│  │  │  - cms_template_collaborators                      │  │  │
│  │  │  - cms_template_comments                           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │               │                          │                │  │
│  │               │ Streaming Replication    │                │  │
│  │               ▼                          ▼                │  │
│  │  ┌──────────────────┐      ┌──────────────────────┐     │  │
│  │  │ Read Replica 1   │      │   Read Replica 2     │     │  │
│  │  └──────────────────┘      └──────────────────────┘     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Backup Storage (S3)                     │  │
│  │  - Daily full backups (30 days)                          │  │
│  │  - Continuous WAL archiving (7 days)                     │  │
│  │  - Logical backups every 4 hours (7 days)                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Cron Jobs (Edge Functions)              │  │
│  │  - Process scheduled publishes (every minute)             │  │
│  │  - Refresh analytics (every hour)                         │  │
│  │  - Cleanup old data (monthly)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Monitoring & Alerting                   │  │
│  │  - Database metrics (Datadog/New Relic)                   │  │
│  │  - Application logs (CloudWatch/Papertrail)               │  │
│  │  - Error tracking (Sentry)                                │  │
│  │  - Uptime monitoring (Pingdom)                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

**End of Architecture Diagrams**

For implementation details, see:
- **Migration:** `/supabase/migrations/20241218000000_cms_template_management.sql`
- **DBA Runbook:** `/docs/CMS_TEMPLATE_DBA_RUNBOOK.md`
- **Implementation Guide:** `/docs/CMS_TEMPLATE_IMPLEMENTATION_GUIDE.md`
