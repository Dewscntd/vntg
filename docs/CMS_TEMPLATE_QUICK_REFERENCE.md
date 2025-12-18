# CMS Template Management - Quick Reference

**Version:** 1.0.0 | **Last Updated:** 2024-12-18

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Database Functions](#database-functions)
- [Common Queries](#common-queries)
- [API Endpoints](#api-endpoints)
- [Monitoring Queries](#monitoring-queries)
- [Troubleshooting](#troubleshooting)
- [Emergency Procedures](#emergency-procedures)

---

## System Architecture

### Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `cms_templates` | Master templates | id, name, slug, status, current_version_id |
| `cms_template_versions` | Version history | id, template_id, version_number, content |
| `cms_action_history` | Audit trail | id, template_id, action_type, performed_by |
| `cms_template_schedules` | Publish schedules | id, template_id, publish_at, status |
| `cms_template_collaborators` | Access control | id, template_id, user_id, role |
| `cms_template_comments` | Review feedback | id, template_id, content, created_by |

### Relationships

```
cms_templates
├── current_version_id → cms_template_versions
├── published_version_id → cms_template_versions
└── has_many:
    ├── cms_template_versions
    ├── cms_action_history
    ├── cms_template_schedules
    ├── cms_template_collaborators
    └── cms_template_comments
```

---

## Database Functions

### cms_create_template()

**Purpose:** Create new template with initial version

**Parameters:**
```sql
cms_create_template(
  p_name TEXT,              -- Template name
  p_slug TEXT,              -- URL-friendly identifier
  p_description TEXT,       -- Description (optional)
  p_category TEXT,          -- Category
  p_content JSONB,          -- Homepage configuration
  p_created_by UUID         -- User ID (default: auth.uid())
)
```

**Returns:** `{ template_id, version_id, version_number }`

**Example:**
```sql
SELECT * FROM cms_create_template(
  'Holiday 2024',
  'holiday-2024',
  'Seasonal homepage for holidays',
  'seasonal',
  '{"sections": [...]}'::jsonb
);
```

### cms_publish_template()

**Purpose:** Publish a template version

**Parameters:**
```sql
cms_publish_template(
  p_template_id UUID,       -- Template to publish
  p_version_id UUID,        -- Version to publish (NULL = current)
  p_published_by UUID       -- User ID (default: auth.uid())
)
```

**Returns:** `{ template_id, version_id, published_at }`

**Example:**
```sql
SELECT * FROM cms_publish_template(
  '123e4567-e89b-12d3-a456-426614174000',
  NULL  -- Publish current version
);
```

### cms_revert_to_version()

**Purpose:** Rollback to previous version

**Parameters:**
```sql
cms_revert_to_version(
  p_template_id UUID,       -- Template to revert
  p_target_version_id UUID, -- Version to revert to
  p_reverted_by UUID        -- User ID (default: auth.uid())
)
```

**Returns:** `{ template_id, new_version_id, new_version_number, reverted_from_version }`

**Example:**
```sql
SELECT * FROM cms_revert_to_version(
  '123e4567-e89b-12d3-a456-426614174000',
  '234e5678-e89b-12d3-a456-426614174001'
);
```

### cms_process_scheduled_publishes()

**Purpose:** Process pending scheduled publishes (run via cron)

**Parameters:** None

**Returns:** `{ template_id, version_id, action, executed_at }`

**Cron Setup:**
```bash
# Every minute
* * * * * psql -d your_db -c "SELECT * FROM cms_process_scheduled_publishes();"
```

### cms_duplicate_template()

**Purpose:** Clone existing template

**Parameters:**
```sql
cms_duplicate_template(
  p_source_template_id UUID,
  p_new_name TEXT,
  p_new_slug TEXT,
  p_created_by UUID
)
```

**Returns:** `{ template_id, version_id }`

### cms_get_action_history()

**Purpose:** Get undo/redo history

**Parameters:**
```sql
cms_get_action_history(
  p_template_id UUID,
  p_limit INTEGER DEFAULT 50
)
```

**Returns:** Action history records with user info

### cms_refresh_template_stats()

**Purpose:** Refresh materialized view for analytics

**Parameters:** None

**Cron Setup:**
```bash
# Every hour
0 * * * * psql -d your_db -c "SELECT cms_refresh_template_stats();"
```

---

## Common Queries

### List All Templates

```sql
SELECT
  id,
  name,
  slug,
  status,
  category,
  created_at,
  updated_at
FROM cms_templates
WHERE is_deleted = false
ORDER BY created_at DESC
LIMIT 50;
```

### Get Template with Current Version

```sql
SELECT
  t.*,
  tv.version_number,
  tv.content,
  tv.change_summary,
  tv.created_at as version_created_at
FROM cms_templates t
LEFT JOIN cms_template_versions tv ON t.current_version_id = tv.id
WHERE t.id = 'YOUR_TEMPLATE_ID';
```

### Get Version History

```sql
SELECT
  tv.id,
  tv.version_number,
  tv.change_summary,
  tv.change_type,
  tv.is_published,
  tv.created_at,
  u.email as created_by_email
FROM cms_template_versions tv
LEFT JOIN users u ON tv.created_by = u.id
WHERE tv.template_id = 'YOUR_TEMPLATE_ID'
ORDER BY tv.version_number DESC
LIMIT 20;
```

### Get Pending Schedules

```sql
SELECT
  s.id,
  s.template_id,
  t.name,
  s.publish_at,
  s.unpublish_at,
  s.status
FROM cms_template_schedules s
JOIN cms_templates t ON s.template_id = t.id
WHERE s.status = 'pending'
  AND s.publish_at > NOW()
ORDER BY s.publish_at ASC;
```

### Get Template Collaborators

```sql
SELECT
  c.id,
  c.role,
  u.email,
  c.invited_at,
  c.accepted_at
FROM cms_template_collaborators c
JOIN users u ON c.user_id = u.id
WHERE c.template_id = 'YOUR_TEMPLATE_ID'
ORDER BY c.role, u.email;
```

### Search Templates

```sql
SELECT
  id,
  name,
  slug,
  category,
  status
FROM cms_templates
WHERE
  is_deleted = false
  AND (
    name ILIKE '%search_term%'
    OR 'search_term' = ANY(tags)
  )
ORDER BY created_at DESC;
```

---

## API Endpoints

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/templates` | List templates |
| POST | `/api/admin/templates` | Create template |
| GET | `/api/admin/templates/[id]` | Get template detail |
| PATCH | `/api/admin/templates/[id]` | Update template |
| DELETE | `/api/admin/templates/[id]` | Delete template |

### Versions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/templates/[id]/versions` | List versions |
| POST | `/api/admin/templates/[id]/versions` | Create version |
| GET | `/api/admin/templates/[id]/versions/[versionId]` | Get version |

### Publishing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/templates/[id]/publish` | Publish template |
| POST | `/api/admin/templates/[id]/versions/[versionId]/publish` | Publish specific version |
| POST | `/api/admin/templates/[id]/revert` | Revert to version |

### Schedules

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/templates/[id]/schedules` | List schedules |
| POST | `/api/admin/templates/[id]/schedules` | Create schedule |
| DELETE | `/api/admin/templates/[id]/schedules/[scheduleId]` | Cancel schedule |

### Collaboration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/templates/[id]/collaborators` | List collaborators |
| POST | `/api/admin/templates/[id]/collaborators` | Add collaborator |
| DELETE | `/api/admin/templates/[id]/collaborators/[userId]` | Remove collaborator |
| GET | `/api/admin/templates/[id]/comments` | List comments |
| POST | `/api/admin/templates/[id]/comments` | Add comment |

### Utilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/templates/[id]/duplicate` | Duplicate template |
| GET | `/api/admin/templates/[id]/actions` | Get action history |

---

## Monitoring Queries

### System Health Check

```sql
-- Run every 5 minutes
SELECT
  'cms_templates' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE is_deleted = false) as active_rows,
  COUNT(*) FILTER (WHERE status = 'published') as published_count,
  pg_size_pretty(pg_total_relation_size('public.cms_templates')) as size
FROM cms_templates
UNION ALL
SELECT
  'cms_template_versions',
  COUNT(*),
  COUNT(*) FILTER (WHERE is_published = true),
  NULL,
  pg_size_pretty(pg_total_relation_size('public.cms_template_versions'))
FROM cms_template_versions;
```

### Active Connections

```sql
-- Alert if > 80% of max_connections
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE state = 'active') as active,
  COUNT(*) FILTER (WHERE state = 'idle') as idle
FROM pg_stat_activity
WHERE datname = current_database();
```

### Slow Queries

```sql
-- Check pg_stat_statements
SELECT
  LEFT(query, 100) as query,
  calls,
  ROUND(mean_exec_time::numeric, 2) as avg_ms,
  ROUND(total_exec_time::numeric, 2) as total_ms
FROM pg_stat_statements
WHERE query LIKE '%cms_%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Index Usage

```sql
-- Alert if idx_scan = 0 (unused index)
SELECT
  indexname,
  idx_scan,
  idx_tup_read,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'cms_%'
ORDER BY idx_scan ASC;
```

### Lock Contention

```sql
-- Alert if any locks waiting > 30 seconds
SELECT
  blocked_locks.pid AS blocked_pid,
  blocked_activity.query AS blocked_query,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.query AS blocking_query,
  NOW() - blocked_activity.query_start AS wait_duration
FROM pg_locks blocked_locks
JOIN pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted
  AND blocking_locks.pid != blocked_locks.pid;
```

---

## Troubleshooting

### Template Won't Publish

**Check 1: RLS Policies**
```sql
-- Verify user has admin role
SELECT id, email, role FROM users WHERE id = 'USER_ID';

-- Test publish permission
SET ROLE authenticated;
SET request.jwt.claim.sub = 'USER_ID';
SELECT * FROM cms_publish_template('TEMPLATE_ID', NULL);
RESET ROLE;
```

**Check 2: Validation Errors**
```sql
-- Check version validation
SELECT
  id,
  is_valid,
  validation_errors
FROM cms_template_versions
WHERE template_id = 'TEMPLATE_ID'
ORDER BY version_number DESC
LIMIT 1;
```

### Scheduled Publish Not Working

**Check 1: Cron Job Running**
```bash
# Check if cron job executed
tail -f /var/log/cms/scheduled_publishes.log

# Manual execution
SELECT * FROM cms_process_scheduled_publishes();
```

**Check 2: Schedule Status**
```sql
SELECT
  id,
  status,
  publish_at,
  execution_attempts,
  last_execution_error
FROM cms_template_schedules
WHERE template_id = 'TEMPLATE_ID'
ORDER BY publish_at DESC;
```

### Version Revert Failed

**Check 1: Version Exists**
```sql
SELECT
  id,
  version_number,
  content IS NOT NULL as has_content
FROM cms_template_versions
WHERE id = 'VERSION_ID';
```

**Check 2: Revert Manually**
```sql
-- Create new version based on old content
BEGIN;

INSERT INTO cms_template_versions (
  template_id,
  content,
  change_summary,
  change_type,
  created_by
)
SELECT
  template_id,
  content,
  'Manual revert to v' || version_number,
  'revert',
  'ADMIN_USER_ID'
FROM cms_template_versions
WHERE id = 'TARGET_VERSION_ID';

COMMIT;
```

### Slow Template Listing

**Check 1: Index Usage**
```sql
EXPLAIN ANALYZE
SELECT * FROM cms_templates
WHERE is_deleted = false
  AND status = 'published'
ORDER BY created_at DESC
LIMIT 50;
-- Should use idx_cms_templates_list
```

**Check 2: Update Statistics**
```sql
ANALYZE cms_templates;
```

**Check 3: Use Materialized View**
```sql
-- Refresh stats
SELECT cms_refresh_template_stats();

-- Query from stats view
SELECT * FROM cms_template_stats
ORDER BY created_at DESC;
```

---

## Emergency Procedures

### Restore Deleted Template (Soft Delete)

```sql
-- Find deleted template
SELECT id, name, deleted_at, deleted_by
FROM cms_templates
WHERE is_deleted = true
  AND deleted_at > NOW() - INTERVAL '24 hours'
ORDER BY deleted_at DESC;

-- Restore
UPDATE cms_templates
SET is_deleted = false, deleted_at = NULL, deleted_by = NULL
WHERE id = 'TEMPLATE_ID';
```

### Emergency Unpublish

```sql
-- Unpublish template immediately
BEGIN;

UPDATE cms_templates
SET
  status = 'archived',
  unpublished_at = NOW()
WHERE id = 'TEMPLATE_ID';

UPDATE cms_template_versions
SET is_published = false
WHERE template_id = 'TEMPLATE_ID' AND is_published = true;

COMMIT;
```

### Emergency Rollback

```sql
-- Revert to last known good version
SELECT * FROM cms_revert_to_version(
  'TEMPLATE_ID',
  (
    SELECT id FROM cms_template_versions
    WHERE template_id = 'TEMPLATE_ID'
      AND is_valid = true
      AND created_at < NOW() - INTERVAL '1 hour'
    ORDER BY version_number DESC
    LIMIT 1
  )
);

-- Then publish
SELECT * FROM cms_publish_template('TEMPLATE_ID', NULL);
```

### Kill Stuck Query

```sql
-- Find long-running query
SELECT pid, NOW() - query_start as duration, query
FROM pg_stat_activity
WHERE state = 'active'
  AND NOW() - query_start > INTERVAL '5 minutes'
ORDER BY duration DESC;

-- Terminate
SELECT pg_terminate_backend(PID);
```

### Full Database Restore

```bash
# EMERGENCY ONLY
# See CMS_TEMPLATE_DBA_RUNBOOK.md for detailed procedure

# 1. Stop application
# 2. Create restore database
createdb cms_restore_temp

# 3. Restore from backup
pg_restore -d cms_restore_temp /backups/cms_full_TIMESTAMP.dump

# 4. Verify data
psql -d cms_restore_temp -c "SELECT COUNT(*) FROM cms_templates;"

# 5. Swap databases (coordinate with DevOps)
```

---

## Performance Tuning

### Weekly Maintenance

```sql
-- Run every Sunday at 2 AM
VACUUM (VERBOSE, ANALYZE) cms_templates;
VACUUM (VERBOSE, ANALYZE) cms_template_versions;
VACUUM (VERBOSE, ANALYZE) cms_action_history;
```

### Monthly Reindex

```sql
-- Run first Sunday of month at 3 AM
REINDEX INDEX CONCURRENTLY idx_cms_templates_list;
REINDEX INDEX CONCURRENTLY idx_cms_template_versions_history;
REINDEX INDEX CONCURRENTLY idx_cms_action_history_undoable;
```

### Query Optimization

```sql
-- Check for missing indexes
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct
FROM pg_stats
WHERE schemaname = 'public'
  AND tablename LIKE 'cms_%'
  AND n_distinct < -0.1  -- High cardinality
ORDER BY ABS(n_distinct) DESC;
```

---

## Useful Commands

### psql Meta-Commands

```bash
# List tables
\dt+ cms_*

# List indexes
\di+ idx_cms_*

# Describe table
\d+ cms_templates

# Show RLS policies
\dp cms_templates

# Show functions
\df cms_*
```

### Export/Import

```bash
# Export templates to JSON
psql -t -A -c "
  SELECT jsonb_build_object(
    'template', row_to_json(t.*),
    'version', row_to_json(tv.*)
  )
  FROM cms_templates t
  JOIN cms_template_versions tv ON t.current_version_id = tv.id
  WHERE t.slug = 'holiday-2024'
" > template_export.json

# Import (use API or direct SQL)
```

---

## Contact & Escalation

| Issue | Contact | Response Time |
|-------|---------|---------------|
| Database down | #dba-oncall | 5 min |
| Slow queries | #dba-team | 30 min |
| Data corruption | #dba-oncall + #security | 15 min |
| Feature requests | #product-team | 1 business day |

---

**Quick Reference Card - Print This Section**

```
╔═══════════════════════════════════════════════════════════════╗
║                  CMS TEMPLATE QUICK COMMANDS                   ║
╠═══════════════════════════════════════════════════════════════╣
║ Create Template:                                               ║
║   SELECT * FROM cms_create_template(name, slug, desc, cat, content); ║
║                                                                ║
║ Publish Template:                                              ║
║   SELECT * FROM cms_publish_template(template_id, NULL);       ║
║                                                                ║
║ Revert Template:                                               ║
║   SELECT * FROM cms_revert_to_version(t_id, target_v_id);     ║
║                                                                ║
║ Process Schedules (Cron):                                      ║
║   SELECT * FROM cms_process_scheduled_publishes();             ║
║                                                                ║
║ Refresh Analytics (Hourly):                                    ║
║   SELECT cms_refresh_template_stats();                         ║
║                                                                ║
║ Health Check:                                                  ║
║   SELECT COUNT(*) FROM cms_templates WHERE status='published'; ║
║                                                                ║
║ Emergency Unpublish:                                           ║
║   UPDATE cms_templates SET status='archived' WHERE id='...';   ║
╚═══════════════════════════════════════════════════════════════╝
```

---

**End of Quick Reference**

For detailed procedures, see:
- **DBA Runbook:** `/docs/CMS_TEMPLATE_DBA_RUNBOOK.md`
- **Implementation Guide:** `/docs/CMS_TEMPLATE_IMPLEMENTATION_GUIDE.md`
- **Migration File:** `/supabase/migrations/20241218000000_cms_template_management.sql`
