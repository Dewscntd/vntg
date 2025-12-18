# CMS Template Management System - Implementation Plan

## Overview

This document outlines the complete implementation plan for adding template management with undo/redo functionality to the CMS.

---

## Features Summary

### 1. Undo/Redo System
- Command Pattern for all CMS operations
- 50-action history stack with merging
- Keyboard shortcuts (Cmd+Z / Cmd+Shift+Z)
- Visual history timeline panel

### 2. Template Management
- Save current homepage as reusable template
- Template library with search, filter, categorization
- Load/apply templates to homepage
- Edit, duplicate, and delete templates
- Template thumbnails and previews

### 3. Publishing Workflow
- Draft → Review → Published states
- Scheduled publishing with timezone support
- Version history with restore capability

---

## Architecture

### Frontend (React/Next.js)

```
/lib/cms/
├── commands/
│   ├── command-interface.ts      # Command Pattern base
│   └── section-commands.ts       # Section operation commands
├── history/
│   └── history-manager.ts        # Undo/redo stack management
└── utils/
    └── optimistic-updates.ts     # Optimistic update helpers

/lib/context/
└── cms-context-enhanced.tsx      # Enhanced context with history

/components/cms/admin/
├── command-palette.tsx           # Cmd+K interface
├── template-library-panel.tsx    # Template browser
├── save-template-dialog.tsx      # Save template modal
├── history-panel.tsx             # Undo/redo timeline
└── undo-redo-controls.tsx        # Toolbar controls
```

### Backend (API Routes)

```
/app/[locale]/api/cms/
├── templates/
│   ├── route.ts                  # GET (list), POST (create)
│   └── [templateId]/
│       ├── route.ts              # GET, PATCH, DELETE
│       ├── versions/route.ts     # Version management
│       ├── publish/route.ts      # Publishing workflow
│       └── history/route.ts      # Action history
```

### Database (Supabase/PostgreSQL)

```sql
-- Core Tables
cms_templates              -- Template metadata
template_versions          -- Version snapshots
template_actions           -- Action history (event sourcing)
template_collaborators     -- Sharing/permissions
template_schedules         -- Scheduled publishing
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Priority: High)
- [ ] Create database migration for templates
- [ ] Implement Command Pattern base classes
- [ ] Create HistoryManager for undo/redo
- [ ] Enhance CMSContext with history support

### Phase 2: Template CRUD (Priority: High)
- [ ] Create template API routes (CRUD)
- [ ] Implement template types and validation
- [ ] Create SaveTemplateDialog component
- [ ] Create TemplateLibraryPanel component

### Phase 3: Undo/Redo UI (Priority: High)
- [ ] Add UndoRedoControls to toolbar
- [ ] Implement keyboard shortcuts
- [ ] Create HistoryPanel component
- [ ] Add toast notifications for actions

### Phase 4: Publishing Workflow (Priority: Medium)
- [ ] Implement version management API
- [ ] Create publish/unpublish endpoints
- [ ] Add scheduled publishing
- [ ] Create workflow UI components

### Phase 5: Polish & Optimization (Priority: Medium)
- [ ] Command Palette (Cmd+K)
- [ ] Template thumbnails/previews
- [ ] Performance optimization
- [ ] Error handling improvements

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd+Z | Undo |
| Cmd+Shift+Z | Redo |
| Cmd+S | Save draft |
| Cmd+Shift+S | Save as template |
| Cmd+Shift+T | Open template library |
| Cmd+Shift+P | Publish |
| Cmd+K | Command palette |
| Cmd+Shift+H | Show history |
| Esc | Close dialogs/deselect |

---

## Database Schema

### cms_templates
```sql
CREATE TABLE cms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  locale TEXT NOT NULL DEFAULT 'en',
  category TEXT DEFAULT 'custom',
  status TEXT DEFAULT 'draft',
  thumbnail_url TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### template_versions
```sql
CREATE TABLE template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES cms_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  sections JSONB NOT NULL,
  metadata JSONB,
  change_summary TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### template_actions (Event Sourcing)
```sql
CREATE TABLE template_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES cms_templates(id) ON DELETE CASCADE,
  session_id UUID,
  action_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

### Templates
- `GET /api/cms/templates` - List templates
- `POST /api/cms/templates` - Create template
- `GET /api/cms/templates/:id` - Get template
- `PATCH /api/cms/templates/:id` - Update template
- `DELETE /api/cms/templates/:id` - Delete template
- `POST /api/cms/templates/:id/duplicate` - Duplicate template

### Versions
- `GET /api/cms/templates/:id/versions` - List versions
- `POST /api/cms/templates/:id/versions` - Create version
- `POST /api/cms/templates/:id/versions/:vid/restore` - Restore version

### Publishing
- `POST /api/cms/templates/:id/publish` - Publish template
- `POST /api/cms/templates/:id/unpublish` - Unpublish template

### History
- `GET /api/cms/templates/:id/history` - Get action history
- `POST /api/cms/templates/:id/undo` - Undo action
- `POST /api/cms/templates/:id/redo` - Redo action

---

## Component Specifications

### UndoRedoControls
- Undo button (disabled when stack empty)
- Redo button (disabled when stack empty)
- History dropdown (optional)
- Stack size indicator

### SaveTemplateDialog
- Template name input (required)
- Description textarea
- Category selector
- Tags input
- Options checkboxes (pin, include products)
- Save/Cancel buttons

### TemplateLibraryPanel
- Search input
- Category filter
- View mode toggle (grid/list)
- Template cards with preview
- Quick actions (load, edit, duplicate, delete)

### HistoryPanel
- Timeline visualization
- Action descriptions
- Timestamps (relative)
- Jump to point capability
- Current position indicator

---

## File Locations

All implementation files will be created in:
- Types: `/types/cms-templates.ts`
- Commands: `/lib/cms/commands/`
- History: `/lib/cms/history/`
- Context: `/lib/context/cms-context-enhanced.tsx`
- Components: `/components/cms/admin/`
- API Routes: `/app/[locale]/api/cms/templates/`
- Migration: `/supabase/migrations/20241218000000_cms_templates.sql`

---

## Success Metrics

- Undo/redo response time < 50ms
- Template save time < 500ms
- Template load time < 300ms
- 50-action undo history
- Support for 1000+ templates

---

## Next Steps

1. Create database migration
2. Implement command pattern infrastructure
3. Enhance CMS context with undo/redo
4. Build template API routes
5. Create UI components
6. Add keyboard shortcuts
7. Test and optimize

---

*Generated: December 18, 2024*
*Contributors: Frontend Architect, Backend Engineer, Database Admin, UI/UX Designer*
