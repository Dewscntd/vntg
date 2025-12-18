# CMS Template Management - Implementation Guide

**Version:** 1.0.0
**Last Updated:** 2024-12-18
**Status:** Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Design](#api-design)
5. [Frontend Integration](#frontend-integration)
6. [Security Considerations](#security-considerations)
7. [Performance Optimization](#performance-optimization)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Checklist](#deployment-checklist)
10. [Migration Path](#migration-path)

---

## Overview

### What This Adds

The CMS Template Management system extends your existing homepage CMS with:

1. **Template Library**: Save and reuse homepage configurations
2. **Version Control**: Full history with undo/redo capabilities
3. **Collaboration**: Multi-user editing with role-based permissions
4. **Scheduling**: Automated publish/unpublish workflows
5. **Audit Trail**: Complete action history for compliance

### Key Benefits

- **Efficiency**: Reuse proven layouts across campaigns
- **Safety**: Revert to any previous version instantly
- **Collaboration**: Team review and approval workflows
- **Automation**: Schedule content changes in advance
- **Compliance**: Full audit trail for all changes

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  Template Editor  │  Version History  │  Collaboration UI  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   API Routes (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  /api/templates   │  /api/versions   │  /api/collaborators  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Client Library                    │
├─────────────────────────────────────────────────────────────┤
│  Row Level Security  │  Database Functions  │  Real-time    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL Database (Supabase)                │
├─────────────────────────────────────────────────────────────┤
│  Templates  │  Versions  │  Actions  │  Schedules  │  etc.  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Background Jobs (Cron)                    │
├─────────────────────────────────────────────────────────────┤
│  Process Schedules  │  Refresh Analytics  │  Send Alerts    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Creating a Template:**
1. User creates template in UI
2. API validates and calls `cms_create_template()`
3. Database creates template + initial version
4. Trigger logs action to history
5. Frontend updates with new template ID

**Publishing a Template:**
1. User clicks "Publish" in UI
2. API calls `cms_publish_template()`
3. Database unpublishes old version
4. Database publishes new version
5. Trigger logs publish action
6. Frontend shows published status

**Scheduled Publishing:**
1. User schedules publish for future date
2. Database creates schedule record
3. Cron job runs every minute
4. Calls `cms_process_scheduled_publishes()`
5. Publishes templates when time arrives
6. Sends notification emails

---

## Database Schema

### Tables Overview

| Table | Purpose | Growth Rate | Indexes |
|-------|---------|-------------|---------|
| `cms_templates` | Master records | 1K/year | 8 indexes |
| `cms_template_versions` | Version history | 10K/year | 7 indexes |
| `cms_action_history` | Audit trail | 50K/year | 8 indexes |
| `cms_template_schedules` | Publish schedules | 2K/year | 6 indexes |
| `cms_template_collaborators` | Access control | 5K/year | 4 indexes |
| `cms_template_comments` | Review feedback | 20K/year | 6 indexes |

### Key Indexes

**Performance-Critical:**
- `idx_cms_templates_list` - Template listing page (composite)
- `idx_cms_template_versions_history` - Version history queries
- `idx_cms_action_history_undoable` - Undo/redo operations

**Security-Critical:**
- RLS policies use `auth.uid()` - ensure proper authentication
- Collaborator checks in all policies

### Database Functions

**Operational Functions:**
- `cms_create_template()` - Create template with initial version
- `cms_publish_template()` - Publish a version
- `cms_revert_to_version()` - Rollback to previous version
- `cms_duplicate_template()` - Clone existing template
- `cms_process_scheduled_publishes()` - Automated publishing (cron)
- `cms_get_action_history()` - Undo/redo history
- `cms_refresh_template_stats()` - Analytics refresh

**When to Use:**
- Always use database functions for complex operations
- Direct table access only for simple CRUD
- Functions ensure data integrity and audit logging

---

## API Design

### API Routes Structure

```
/api/admin/templates/
├── route.ts                    # GET (list), POST (create)
├── [id]/
│   ├── route.ts                # GET (detail), PATCH (update), DELETE
│   ├── versions/
│   │   ├── route.ts            # GET (list versions)
│   │   └── [versionId]/
│   │       ├── route.ts        # GET (version detail)
│   │       └── publish/
│   │           └── route.ts    # POST (publish version)
│   ├── publish/
│   │   └── route.ts            # POST (publish current)
│   ├── duplicate/
│   │   └── route.ts            # POST (duplicate template)
│   ├── revert/
│   │   └── route.ts            # POST (revert to version)
│   ├── schedules/
│   │   └── route.ts            # GET (list), POST (create)
│   ├── collaborators/
│   │   └── route.ts            # GET (list), POST (add), DELETE (remove)
│   ├── comments/
│   │   └── route.ts            # GET (list), POST (add)
│   └── actions/
│       └── route.ts            # GET (history)
```

### Example API Implementation

**File:** `/app/[locale]/api/admin/templates/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import type { CreateTemplateRequest, CMSTemplate } from '@/types/cms-templates';

// Validation schema
const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  category: z.enum(['seasonal', 'promotional', 'editorial', 'product_launch', 'event', 'custom']),
  tags: z.array(z.string()).optional(),
  content: z.object({
    sections: z.array(z.any()),
    status: z.enum(['draft', 'published']),
    metadata: z.record(z.any()).optional(),
  }),
});

// GET /api/admin/templates - List templates
export async function GET(request: NextRequest) {
  const supabase = createServerComponentClient({ cookies });

  // Verify authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Build query
  let query = supabase
    .from('cms_templates')
    .select(`
      *,
      current_version:cms_template_versions!current_version_id(*),
      stats:cms_template_stats(*)
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (category) query = query.eq('category', category);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }

  return NextResponse.json({
    templates: data,
    total: count,
    limit,
    offset,
  });
}

// POST /api/admin/templates - Create template
export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient({ cookies });

  // Verify authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse and validate request body
  const body = await request.json();
  const validation = createTemplateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.errors },
      { status: 400 }
    );
  }

  const { name, slug, description, category, tags, content } = validation.data;

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from('cms_templates')
    .select('id')
    .eq('slug', slug)
    .eq('is_deleted', false)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'Template with this slug already exists' },
      { status: 409 }
    );
  }

  // Call database function to create template
  const { data, error } = await supabase.rpc('cms_create_template', {
    p_name: name,
    p_slug: slug,
    p_description: description || null,
    p_category: category,
    p_content: content,
    p_created_by: session.user.id,
  });

  if (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }

  // Update tags if provided
  if (tags && tags.length > 0) {
    await supabase
      .from('cms_templates')
      .update({ tags })
      .eq('id', data[0].template_id);
  }

  return NextResponse.json(
    {
      template_id: data[0].template_id,
      version_id: data[0].version_id,
      version_number: data[0].version_number,
    },
    { status: 201 }
  );
}
```

**File:** `/app/[locale]/api/admin/templates/[id]/publish/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface RouteParams {
  params: { id: string };
}

// POST /api/admin/templates/[id]/publish - Publish template
export async function POST(request: NextRequest, { params }: RouteParams) {
  const supabase = createServerComponentClient({ cookies });

  // Verify authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const templateId = params.id;
  const body = await request.json();
  const versionId = body.version_id || null;

  // Call database function to publish
  const { data, error } = await supabase.rpc('cms_publish_template', {
    p_template_id: templateId,
    p_version_id: versionId,
    p_published_by: session.user.id,
  });

  if (error) {
    console.error('Error publishing template:', error);
    return NextResponse.json({ error: 'Failed to publish template' }, { status: 500 });
  }

  // TODO: Trigger cache invalidation
  // TODO: Send notification emails

  return NextResponse.json({
    template_id: data[0].template_id,
    version_id: data[0].version_id,
    published_at: data[0].published_at,
  });
}
```

### Error Handling

Always return consistent error format:

```typescript
{
  error: string,           // Human-readable message
  code?: string,           // Machine-readable error code
  details?: unknown        // Additional context
}
```

---

## Frontend Integration

### React Context for Template Editor

**File:** `/lib/context/template-editor-context.tsx`

```typescript
'use client';

import { createContext, useContext, useReducer, useCallback } from 'react';
import type {
  TemplateEditorState,
  TemplateEditorAction,
  CMSTemplate,
  CMSTemplateVersion,
} from '@/types/cms-templates';

const TemplateEditorContext = createContext<{
  state: TemplateEditorState;
  dispatch: React.Dispatch<TemplateEditorAction>;
  saveVersion: () => Promise<void>;
  publish: () => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
} | null>(null);

function templateEditorReducer(
  state: TemplateEditorState,
  action: TemplateEditorAction
): TemplateEditorState {
  switch (action.type) {
    case 'LOAD_TEMPLATE':
      return {
        ...state,
        template: action.payload.template,
        currentVersion: action.payload.version,
        isDirty: false,
      };

    case 'UPDATE_CONTENT':
      return {
        ...state,
        isDirty: true,
        currentVersion: state.currentVersion
          ? {
              ...state.currentVersion,
              content: action.payload.content,
            }
          : null,
      };

    case 'SAVE_VERSION':
      return {
        ...state,
        currentVersion: action.payload.version,
        isDirty: false,
        isSaving: false,
      };

    case 'PUBLISH':
      return {
        ...state,
        publishedVersion: state.currentVersion,
        isPublishing: false,
      };

    // ... other cases
    default:
      return state;
  }
}

export function TemplateEditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(templateEditorReducer, {
    template: null,
    currentVersion: null,
    publishedVersion: null,
    isDirty: false,
    isSaving: false,
    isPublishing: false,
    validationErrors: [],
    canUndo: false,
    canRedo: false,
    actionHistory: [],
    collaborators: [],
    comments: [],
    selectedSectionId: null,
    previewMode: false,
    showComments: false,
    showVersionHistory: false,
  });

  const saveVersion = useCallback(async () => {
    if (!state.template || !state.currentVersion) return;

    dispatch({ type: 'SET_SAVING', payload: true });

    try {
      const response = await fetch(`/api/admin/templates/${state.template.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: state.currentVersion.content,
          change_summary: 'Manual save',
        }),
      });

      if (!response.ok) throw new Error('Failed to save version');

      const version = await response.json();
      dispatch({ type: 'SAVE_VERSION', payload: { version } });
    } catch (error) {
      console.error('Error saving version:', error);
      // TODO: Show error toast
    }
  }, [state.template, state.currentVersion]);

  const publish = useCallback(async () => {
    if (!state.template) return;

    dispatch({ type: 'SET_PUBLISHING', payload: true });

    try {
      const response = await fetch(`/api/admin/templates/${state.template.id}/publish`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to publish');

      const result = await response.json();
      dispatch({ type: 'PUBLISH', payload: { publishedAt: result.published_at } });
    } catch (error) {
      console.error('Error publishing:', error);
      // TODO: Show error toast
    }
  }, [state.template]);

  // ... implement undo/redo

  return (
    <TemplateEditorContext.Provider value={{ state, dispatch, saveVersion, publish, undo, redo }}>
      {children}
    </TemplateEditorContext.Provider>
  );
}

export function useTemplateEditor() {
  const context = useContext(TemplateEditorContext);
  if (!context) {
    throw new Error('useTemplateEditor must be used within TemplateEditorProvider');
  }
  return context;
}
```

### Template Editor Component

**File:** `/components/admin/templates/template-editor.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useTemplateEditor } from '@/lib/context/template-editor-context';
import { Button } from '@/components/ui/button';
import { HomepagePreview } from '@/components/cms/homepage-preview';
import { VersionHistory } from '@/components/admin/templates/version-history';
import { CommentsPanel } from '@/components/admin/templates/comments-panel';

interface TemplateEditorProps {
  templateId: string;
}

export function TemplateEditor({ templateId }: TemplateEditorProps) {
  const { state, saveVersion, publish, undo, redo } = useTemplateEditor();

  useEffect(() => {
    // Load template on mount
    async function loadTemplate() {
      const response = await fetch(`/api/admin/templates/${templateId}`);
      const data = await response.json();
      dispatch({
        type: 'LOAD_TEMPLATE',
        payload: { template: data.template, version: data.current_version },
      });
    }
    loadTemplate();
  }, [templateId]);

  if (!state.template || !state.currentVersion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar: Version History */}
      {state.showVersionHistory && (
        <div className="w-64 border-r">
          <VersionHistory templateId={templateId} />
        </div>
      )}

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4 flex items-center gap-4">
          <h1 className="text-2xl font-bold">{state.template.name}</h1>
          <div className="flex-1" />

          {/* Undo/Redo */}
          <Button onClick={undo} disabled={!state.canUndo} variant="ghost" size="sm">
            Undo
          </Button>
          <Button onClick={redo} disabled={!state.canRedo} variant="ghost" size="sm">
            Redo
          </Button>

          {/* Save/Publish */}
          <Button onClick={saveVersion} disabled={!state.isDirty || state.isSaving} variant="outline">
            {state.isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={publish} disabled={state.isPublishing} variant="default">
            {state.isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto">
          <HomepagePreview content={state.currentVersion.content} />
        </div>
      </div>

      {/* Right Sidebar: Comments */}
      {state.showComments && (
        <div className="w-80 border-l">
          <CommentsPanel templateId={templateId} />
        </div>
      )}
    </div>
  );
}
```

---

## Security Considerations

### Authentication

- All API routes must verify `session.user.id`
- Use `createServerComponentClient` for server-side requests
- Never trust client-provided user IDs

### Row Level Security (RLS)

RLS policies enforce:
- Public can only view published templates
- Admins can view/edit all templates
- Collaborators can only access their templates
- Role-based permissions (owner/editor/reviewer/viewer)

**Testing RLS:**

```sql
-- Test as anonymous user
SET ROLE anon;
SELECT * FROM cms_templates;
-- Should only return published templates

-- Test as authenticated user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-id-here';
SELECT * FROM cms_templates;
-- Should return user's templates + published

-- Reset
RESET ROLE;
```

### Input Validation

Always validate with Zod:

```typescript
import { z } from 'zod';

const templateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  content: z.object({
    sections: z.array(z.any()),
  }),
});

// In API route:
const validation = templateSchema.safeParse(body);
if (!validation.success) {
  return NextResponse.json({ error: validation.error }, { status: 400 });
}
```

### SQL Injection Prevention

- Always use parameterized queries
- Database functions use `$1, $2` placeholders
- Supabase client escapes automatically

### CSRF Protection

- Next.js API routes have CSRF protection
- Use `sameSite: 'strict'` for cookies
- Verify `Origin` header for sensitive operations

---

## Performance Optimization

### Database Optimization

**Indexes:**
- All foreign keys have indexes
- Composite indexes for common queries
- Partial indexes for filtered queries

**Query Optimization:**
```sql
-- Bad: N+1 query
SELECT * FROM cms_templates;
-- Then for each template:
SELECT * FROM cms_template_versions WHERE template_id = ?;

-- Good: Single query with join
SELECT
  t.*,
  tv.*
FROM cms_templates t
LEFT JOIN cms_template_versions tv ON t.current_version_id = tv.id;
```

**Materialized Views:**
```sql
-- Refresh hourly via cron
SELECT cms_refresh_template_stats();
```

### API Caching

Use Next.js caching:

```typescript
// Revalidate every 60 seconds
export const revalidate = 60;

// Or use React Cache
import { cache } from 'react';

const getTemplate = cache(async (id: string) => {
  const supabase = createServerComponentClient({ cookies });
  return await supabase.from('cms_templates').select('*').eq('id', id).single();
});
```

### Frontend Optimization

- Use React.memo for heavy components
- Debounce autosave operations
- Lazy load version history and comments
- Virtualize long lists (react-window)

---

## Testing Strategy

### Unit Tests

Test database functions:

```sql
-- Test cms_create_template
BEGIN;
SELECT * FROM cms_create_template(
  'Test Template',
  'test-template',
  'Description',
  'custom',
  '{"sections": []}'::jsonb
);
-- Verify template and version created
ROLLBACK;
```

### Integration Tests

Test API endpoints:

```typescript
// tests/api/templates.test.ts
import { POST } from '@/app/[locale]/api/admin/templates/route';

describe('/api/admin/templates', () => {
  it('creates a template', async () => {
    const request = new NextRequest('http://localhost/api/admin/templates', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test',
        slug: 'test',
        category: 'custom',
        content: { sections: [] },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.template_id).toBeDefined();
  });
});
```

### E2E Tests

Use Playwright:

```typescript
// tests/e2e/template-editor.spec.ts
import { test, expect } from '@playwright/test';

test('create and publish template', async ({ page }) => {
  await page.goto('/admin/templates/new');

  await page.fill('[name="name"]', 'Holiday 2024');
  await page.fill('[name="slug"]', 'holiday-2024');
  await page.selectOption('[name="category"]', 'seasonal');

  await page.click('button:has-text("Save")');
  await expect(page.locator('text=Template saved')).toBeVisible();

  await page.click('button:has-text("Publish")');
  await expect(page.locator('text=Template published')).toBeVisible();
});
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Run migration in staging environment
- [ ] Verify all indexes created
- [ ] Test RLS policies
- [ ] Load test with production-like data
- [ ] Review slow query log
- [ ] Verify backup schedule
- [ ] Update TypeScript types

### Deployment Steps

1. **Database Migration**
   ```bash
   # Apply migration
   psql -f supabase/migrations/20241218000000_cms_template_management.sql

   # Verify tables created
   psql -c "\dt+ cms_*"

   # Verify indexes created
   psql -c "\di+ idx_cms_*"
   ```

2. **Setup Cron Jobs**
   ```bash
   # Add to cron (or use Supabase Edge Functions)
   # Process scheduled publishes every minute
   * * * * * psql -c "SELECT * FROM cms_process_scheduled_publishes();"

   # Refresh analytics hourly
   0 * * * * psql -c "SELECT cms_refresh_template_stats();"
   ```

3. **Deploy Frontend**
   ```bash
   npm run type-check
   npm run lint
   npm run test
   npm run build
   npm run deploy
   ```

### Post-Deployment

- [ ] Verify health check endpoints
- [ ] Monitor error logs for 24 hours
- [ ] Check slow query log
- [ ] Verify scheduled publishes working
- [ ] Test critical user flows
- [ ] Update documentation

---

## Migration Path

### From Current CMS to Template System

**Option 1: Gradual Migration**

1. Deploy template system alongside existing CMS
2. Keep existing homepage functionality
3. Add "Save as Template" button to current editor
4. Migrate templates one by one

**Option 2: Full Migration**

1. Export all current homepages
2. Import as templates
3. Switch to template system
4. Deprecate old system

### Migration Script

```typescript
// scripts/migrate-to-templates.ts
import { createClient } from '@supabase/supabase-js';

async function migrateToTemplates() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

  // Get existing homepages
  const { data: homepages } = await supabase
    .from('homepage_sections')
    .select('*')
    .eq('is_active', true);

  for (const homepage of homepages || []) {
    // Create template from homepage
    await supabase.rpc('cms_create_template', {
      p_name: `Migrated: ${homepage.section_key}`,
      p_slug: `migrated-${homepage.section_key}`,
      p_description: 'Auto-migrated from legacy CMS',
      p_category: 'custom',
      p_content: homepage.content,
    });
  }

  console.log(`Migrated ${homepages?.length || 0} templates`);
}

migrateToTemplates().catch(console.error);
```

---

## Summary

### File Locations

**Database:**
- Migration: `/supabase/migrations/20241218000000_cms_template_management.sql`
- Runbook: `/docs/CMS_TEMPLATE_DBA_RUNBOOK.md`

**Types:**
- TypeScript types: `/types/cms-templates.ts`

**API Routes (to be created):**
- `/app/[locale]/api/admin/templates/route.ts`
- `/app/[locale]/api/admin/templates/[id]/route.ts`
- `/app/[locale]/api/admin/templates/[id]/publish/route.ts`
- (etc.)

**Components (to be created):**
- `/components/admin/templates/template-editor.tsx`
- `/components/admin/templates/version-history.tsx`
- `/components/admin/templates/comments-panel.tsx`

**Context (to be created):**
- `/lib/context/template-editor-context.tsx`

### Next Steps

1. **Apply Migration**
   ```bash
   npm run db:migrate
   ```

2. **Setup Cron Jobs**
   - Configure scheduled publish processing
   - Configure analytics refresh

3. **Implement API Routes**
   - Start with basic CRUD
   - Add advanced features (publish, revert, etc.)

4. **Build Frontend Components**
   - Template list page
   - Template editor
   - Version history UI

5. **Testing**
   - Write unit tests for database functions
   - Write integration tests for API
   - Write E2E tests for critical flows

6. **Documentation**
   - API documentation
   - User guide
   - Admin manual

---

**Questions or Issues?**

Contact: #dba-team or #frontend-team

**End of Implementation Guide**
