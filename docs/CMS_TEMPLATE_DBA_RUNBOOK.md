# CMS Template Management System - DBA Operations Runbook

**Document Version:** 1.0.0
**Last Updated:** 2024-12-18
**Maintained By:** Database Operations Team
**On-Call Escalation:** #dba-oncall

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Critical Metrics & Monitoring](#critical-metrics--monitoring)
3. [Daily Operations](#daily-operations)
4. [Performance Optimization](#performance-optimization)
5. [Backup & Recovery](#backup--recovery)
6. [Disaster Recovery Procedures](#disaster-recovery-procedures)
7. [Scheduled Maintenance](#scheduled-maintenance)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Alerting Thresholds](#alerting-thresholds)
10. [Security Procedures](#security-procedures)

---

## System Overview

### Architecture

The CMS Template Management System consists of 6 core tables:

- `cms_templates` - Master template records (estimated growth: 1K/year)
- `cms_template_versions` - Version history (estimated growth: 10K/year)
- `cms_action_history` - Audit trail (estimated growth: 50K/year)
- `cms_template_schedules` - Publishing schedules (estimated growth: 2K/year)
- `cms_template_collaborators` - Access control (estimated growth: 5K/year)
- `cms_template_comments` - Review feedback (estimated growth: 20K/year)

### RTO/RPO Targets

- **Recovery Time Objective (RTO):** 4 hours
- **Recovery Point Objective (RPO):** 15 minutes
- **Availability Target:** 99.9% uptime
- **Performance SLA:** 95th percentile query time < 100ms

### Dependencies

- Supabase PostgreSQL 15+
- Authentication: Supabase Auth
- Storage: Supabase Storage (for media assets)
- External: Email notifications (optional)

---

## Critical Metrics & Monitoring

### Key Performance Indicators (KPIs)

Monitor these metrics continuously:

```sql
-- Query: System Health Dashboard
-- Run frequency: Every 5 minutes
-- Alert if: Any query > 200ms p95

WITH performance_metrics AS (
  SELECT
    'cms_templates' as table_name,
    COUNT(*) as row_count,
    COUNT(*) FILTER (WHERE is_deleted = false) as active_count,
    COUNT(*) FILTER (WHERE status = 'published') as published_count,
    MAX(updated_at) as last_update
  FROM public.cms_templates

  UNION ALL

  SELECT
    'cms_template_versions' as table_name,
    COUNT(*) as row_count,
    COUNT(*) FILTER (WHERE is_published = true) as active_count,
    NULL as published_count,
    MAX(created_at) as last_update
  FROM public.cms_template_versions

  UNION ALL

  SELECT
    'cms_action_history' as table_name,
    COUNT(*) as row_count,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as active_count,
    NULL as published_count,
    MAX(created_at) as last_update
  FROM public.cms_action_history

  UNION ALL

  SELECT
    'cms_template_schedules' as table_name,
    COUNT(*) as row_count,
    COUNT(*) FILTER (WHERE status = 'pending') as active_count,
    COUNT(*) FILTER (WHERE status = 'active') as published_count,
    MAX(updated_at) as last_update
  FROM public.cms_template_schedules
)
SELECT
  table_name,
  row_count,
  active_count,
  published_count,
  last_update,
  pg_size_pretty(pg_total_relation_size('public.' || table_name)) as table_size
FROM performance_metrics
ORDER BY row_count DESC;
```

### Index Health Check

```sql
-- Query: Index Usage Statistics
-- Run frequency: Daily
-- Alert if: idx_scan = 0 for any index (unused index)

SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  CASE
    WHEN idx_scan = 0 THEN 'UNUSED - Consider dropping'
    WHEN idx_scan < 100 THEN 'LOW USAGE'
    ELSE 'OK'
  END as status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'cms_%'
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;
```

### Query Performance Analysis

```sql
-- Query: Slow Query Detection
-- Run frequency: Every 15 minutes
-- Alert if: mean_exec_time > 100ms

SELECT
  queryid,
  LEFT(query, 100) as query_preview,
  calls,
  ROUND(total_exec_time::numeric / calls, 2) as mean_exec_time_ms,
  ROUND(total_exec_time::numeric, 2) as total_exec_time_ms,
  ROUND((100 * total_exec_time / SUM(total_exec_time) OVER ())::numeric, 2) as pct_total_time,
  rows as total_rows,
  ROUND(rows::numeric / calls, 2) as mean_rows
FROM pg_stat_statements
WHERE query LIKE '%cms_%'
  AND query NOT LIKE '%pg_stat%'
ORDER BY mean_exec_time_ms DESC
LIMIT 20;
```

### Connection Monitoring

```sql
-- Query: Active Connections
-- Run frequency: Every minute
-- Alert if: active_connections > 80% of max_connections

SELECT
  COUNT(*) as total_connections,
  COUNT(*) FILTER (WHERE state = 'active') as active_connections,
  COUNT(*) FILTER (WHERE state = 'idle') as idle_connections,
  COUNT(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
  COUNT(*) FILTER (WHERE wait_event_type IS NOT NULL) as waiting_connections,
  MAX(NOW() - query_start) as longest_running_query,
  MAX(NOW() - state_change) as longest_idle_transaction
FROM pg_stat_activity
WHERE datname = current_database();
```

### Lock Monitoring

```sql
-- Query: Lock Contention Detection
-- Run frequency: Every 5 minutes
-- Alert if: blocking_locks > 0 for > 30 seconds

SELECT
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS blocking_statement,
  blocked_activity.wait_event_type AS blocked_wait_type,
  blocked_activity.wait_event AS blocked_wait_event,
  NOW() - blocked_activity.query_start AS blocked_duration
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks
  ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
  AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
  AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
  AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
  AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
  AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
  AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
  AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
  AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

---

## Daily Operations

### Morning Health Check (9:00 AM Daily)

Run this sequence every morning:

```bash
# 1. Check replication lag (if applicable)
# Expected: < 10 seconds

# 2. Verify backup completion
# Expected: Last backup within 24 hours

# 3. Check table bloat
psql -c "SELECT * FROM pgstattuple('public.cms_templates');"
# Expected: dead_tuple_percent < 10%

# 4. Review error logs
# Check for: Connection errors, failed queries, constraint violations

# 5. Process scheduled publishes
SELECT * FROM public.cms_process_scheduled_publishes();
# Expected: No errors, scheduled items processed

# 6. Refresh analytics
SELECT public.cms_refresh_template_stats();
# Expected: Completes in < 5 seconds
```

### Template Metrics Dashboard

```sql
-- Query: Daily Template Activity Report
-- Run frequency: Daily at 9 AM
-- Purpose: Understanding system usage patterns

SELECT
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE action_type = 'create_template') as templates_created,
  COUNT(*) FILTER (WHERE action_type = 'create_version') as versions_created,
  COUNT(*) FILTER (WHERE action_type = 'publish_version') as versions_published,
  COUNT(*) FILTER (WHERE action_type = 'revert_version') as versions_reverted,
  COUNT(DISTINCT template_id) as unique_templates_modified,
  COUNT(DISTINCT performed_by) as unique_users_active
FROM public.cms_action_history
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## Performance Optimization

### Weekly VACUUM and ANALYZE

```sql
-- Run every Sunday at 2 AM (low traffic period)
-- Duration: ~10-30 minutes depending on table size

-- VACUUM reclaims dead tuple space
VACUUM (VERBOSE, ANALYZE) public.cms_templates;
VACUUM (VERBOSE, ANALYZE) public.cms_template_versions;
VACUUM (VERBOSE, ANALYZE) public.cms_action_history;
VACUUM (VERBOSE, ANALYZE) public.cms_template_schedules;
VACUUM (VERBOSE, ANALYZE) public.cms_template_collaborators;
VACUUM (VERBOSE, ANALYZE) public.cms_template_comments;

-- Verify bloat reduction
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public' AND tablename LIKE 'cms_%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Monthly REINDEX

```sql
-- Run monthly (first Sunday of month at 3 AM)
-- Duration: ~30-60 minutes depending on index size
-- CAUTION: Takes ACCESS EXCLUSIVE lock - run during maintenance window

-- Option 1: REINDEX CONCURRENTLY (Postgres 12+) - NO downtime
REINDEX INDEX CONCURRENTLY idx_cms_templates_status;
REINDEX INDEX CONCURRENTLY idx_cms_template_versions_history;
REINDEX INDEX CONCURRENTLY idx_cms_action_history_undoable;
-- Repeat for all indexes

-- Option 2: REINDEX entire table (faster but requires downtime)
-- REINDEX TABLE public.cms_templates;
-- REINDEX TABLE public.cms_template_versions;
```

### Query Optimization Candidates

```sql
-- Query: Find missing indexes
-- Run frequency: Monthly
-- Purpose: Identify potential index improvements

SELECT
  schemaname,
  tablename,
  attname as column_name,
  n_distinct as distinct_values,
  correlation,
  CASE
    WHEN n_distinct < 0 THEN 'High cardinality - consider index'
    WHEN n_distinct BETWEEN 1 AND 10 THEN 'Low cardinality - maybe not worth indexing'
    ELSE 'Medium cardinality - evaluate query patterns'
  END as recommendation
FROM pg_stats
WHERE schemaname = 'public'
  AND tablename LIKE 'cms_%'
  AND n_distinct IS NOT NULL
ORDER BY ABS(n_distinct) DESC;
```

### Partition Old Action History

For long-term scalability, consider partitioning the action history table:

```sql
-- Strategy: Partition cms_action_history by month
-- When to implement: When table exceeds 1M rows or 1 GB

-- Example implementation:
CREATE TABLE public.cms_action_history_2024_12 PARTITION OF public.cms_action_history
FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

CREATE TABLE public.cms_action_history_2025_01 PARTITION OF public.cms_action_history
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Create partitions 3 months in advance
-- Drop partitions older than 2 years (after archiving)
```

---

## Backup & Recovery

### Backup Strategy

**Tier 1: Continuous WAL Archiving**
- Method: Point-in-Time Recovery (PITR)
- Frequency: Continuous
- Retention: 7 days
- Storage: S3/GCS with versioning enabled

**Tier 2: Full Database Dumps**
- Method: pg_dump
- Frequency: Daily at 1 AM
- Retention: 30 days
- Compression: gzip -9

**Tier 3: Logical Backups (Templates Only)**
- Method: Custom script with COPY
- Frequency: Every 4 hours
- Retention: 7 days

### Backup Procedures

#### Full Database Backup

```bash
#!/bin/bash
# Script: /opt/scripts/backup_cms_database.sh
# Schedule: Daily at 1:00 AM via cron

BACKUP_DIR="/backups/cms"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATABASE="your_database_name"

# Create backup with custom format (allows parallel restore)
pg_dump -Fc -Z9 \
  --verbose \
  --no-owner \
  --no-acl \
  -f "${BACKUP_DIR}/cms_full_${TIMESTAMP}.dump" \
  "${DATABASE}"

# Verify backup integrity
pg_restore --list "${BACKUP_DIR}/cms_full_${TIMESTAMP}.dump" > /dev/null
if [ $? -eq 0 ]; then
  echo "Backup verified successfully: cms_full_${TIMESTAMP}.dump"

  # Upload to S3 (optional)
  aws s3 cp "${BACKUP_DIR}/cms_full_${TIMESTAMP}.dump" \
    "s3://your-bucket/backups/cms/cms_full_${TIMESTAMP}.dump"
else
  echo "ERROR: Backup verification failed!"
  exit 1
fi

# Clean up old backups (keep last 30 days)
find "${BACKUP_DIR}" -name "cms_full_*.dump" -mtime +30 -delete
```

#### Logical Template Backup

```sql
-- Script: Export templates and versions to CSV
-- Purpose: Quick restore of specific templates

COPY (
  SELECT
    t.id,
    t.name,
    t.slug,
    t.status,
    t.category,
    tv.version_number,
    tv.content,
    tv.created_at
  FROM public.cms_templates t
  JOIN public.cms_template_versions tv ON t.current_version_id = tv.id
  WHERE t.is_deleted = false
) TO '/backups/cms/templates_export.csv' WITH CSV HEADER;

-- Restore procedure:
-- 1. Import CSV
-- 2. Call cms_create_template() for each row
-- 3. Verify content integrity
```

### Recovery Procedures

#### Scenario 1: Accidental Template Deletion (< 1 hour ago)

**RTO: 5 minutes | RPO: 0 minutes**

```sql
-- Step 1: Identify deleted template
SELECT
  id,
  name,
  deleted_at,
  deleted_by
FROM public.cms_templates
WHERE is_deleted = true
  AND deleted_at > NOW() - INTERVAL '1 hour'
ORDER BY deleted_at DESC;

-- Step 2: Restore template (soft delete recovery)
UPDATE public.cms_templates
SET
  is_deleted = false,
  deleted_at = NULL,
  deleted_by = NULL
WHERE id = 'YOUR_TEMPLATE_ID';

-- Step 3: Verify restoration
SELECT * FROM public.cms_templates WHERE id = 'YOUR_TEMPLATE_ID';

-- Step 4: Notify user
-- Send email to affected users
```

#### Scenario 2: Corrupted Version Content

**RTO: 10 minutes | RPO: Version-dependent**

```sql
-- Step 1: Identify corrupted version
SELECT
  id,
  template_id,
  version_number,
  is_valid,
  validation_errors
FROM public.cms_template_versions
WHERE is_valid = false
ORDER BY created_at DESC;

-- Step 2: Revert to last known good version
SELECT * FROM public.cms_revert_to_version(
  'TEMPLATE_ID',
  'LAST_GOOD_VERSION_ID',
  'ADMIN_USER_ID'
);

-- Step 3: Document incident in action log
INSERT INTO public.cms_action_history (
  template_id,
  action_type,
  action_data,
  performed_by
) VALUES (
  'TEMPLATE_ID',
  'emergency_revert',
  '{"reason": "Corrupted content", "incident_ticket": "INC-12345"}',
  'ADMIN_USER_ID'
);
```

#### Scenario 3: Database Corruption (Full Restore Required)

**RTO: 4 hours | RPO: 15 minutes**

```bash
#!/bin/bash
# DISASTER RECOVERY PROCEDURE
# ONLY RUN DURING MAJOR INCIDENT

# 1. Stop application traffic
# - Set maintenance mode
# - Redirect to static page

# 2. Identify restore point
RESTORE_TIME="2024-12-18 14:30:00"  # Adjust to desired point

# 3. Create new database for restore
createdb cms_restore_temp

# 4. Restore from backup
pg_restore -d cms_restore_temp \
  --verbose \
  --no-owner \
  --no-acl \
  /backups/cms/cms_full_TIMESTAMP.dump

# 5. Apply WAL logs for PITR (if available)
# Follow Supabase PITR documentation

# 6. Verify data integrity
psql -d cms_restore_temp -c "
  SELECT COUNT(*) FROM public.cms_templates WHERE is_deleted = false;
  SELECT COUNT(*) FROM public.cms_template_versions;
  SELECT MAX(created_at) FROM public.cms_action_history;
"

# 7. Swap databases (coordinate with DevOps)
# - Rename original: cms_db -> cms_db_old
# - Rename restored: cms_restore_temp -> cms_db

# 8. Restore application traffic
# - Disable maintenance mode
# - Monitor error logs

# 9. Post-incident review
# - Document timeline
# - Identify root cause
# - Update runbook
```

---

## Disaster Recovery Procedures

### DR Scenario Matrix

| Scenario | Severity | RTO | RPO | Procedure |
|----------|----------|-----|-----|-----------|
| Accidental data modification | P3 | 5 min | 0 min | Revert to version |
| Table corruption | P2 | 1 hour | 15 min | Table restore |
| Database corruption | P1 | 4 hours | 15 min | Full DB restore |
| Data center failure | P1 | 8 hours | 15 min | Failover to replica |

### Failover Procedures

**Pre-requisites:**
- Streaming replication configured
- Replica lag < 10 seconds
- Failover scripts tested monthly

```sql
-- 1. Check replication status
SELECT
  client_addr,
  state,
  sync_state,
  sent_lsn,
  write_lsn,
  flush_lsn,
  replay_lsn,
  replay_lag
FROM pg_stat_replication;

-- 2. Promote replica (if primary is down)
-- Run on replica server:
-- pg_ctl promote -D /var/lib/postgresql/data

-- 3. Update application connection string
-- Point to new primary

-- 4. Verify writes are working
INSERT INTO public.cms_action_history (
  template_id,
  action_type,
  action_data,
  performed_by
) VALUES (
  gen_random_uuid(),
  'failover_test',
  '{"timestamp": "' || NOW() || '"}',
  NULL
) RETURNING *;
```

---

## Scheduled Maintenance

### Automated Jobs (Cron Schedule)

```bash
# /etc/cron.d/cms-maintenance

# Process scheduled publishes - Every minute
* * * * * postgres psql -d cms_db -c "SELECT * FROM public.cms_process_scheduled_publishes();" >> /var/log/cms/scheduled_publishes.log 2>&1

# Refresh analytics - Every hour
0 * * * * postgres psql -d cms_db -c "SELECT public.cms_refresh_template_stats();" >> /var/log/cms/analytics_refresh.log 2>&1

# Full backup - Daily at 1 AM
0 1 * * * root /opt/scripts/backup_cms_database.sh >> /var/log/cms/backup.log 2>&1

# VACUUM ANALYZE - Weekly on Sunday at 2 AM
0 2 * * 0 postgres /opt/scripts/vacuum_cms_tables.sh >> /var/log/cms/vacuum.log 2>&1

# REINDEX - Monthly on first Sunday at 3 AM
0 3 1-7 * 0 postgres /opt/scripts/reindex_cms_tables.sh >> /var/log/cms/reindex.log 2>&1

# Cleanup old action history - Monthly
0 4 1 * * postgres psql -d cms_db -c "DELETE FROM public.cms_action_history WHERE created_at < NOW() - INTERVAL '2 years';" >> /var/log/cms/cleanup.log 2>&1

# Check for unused indexes - Monthly
0 5 1 * * postgres /opt/scripts/check_unused_indexes.sh >> /var/log/cms/index_analysis.log 2>&1
```

### Maintenance Window Checklist

**Monthly Maintenance Window (First Sunday, 2-6 AM)**

- [ ] Announce maintenance window 7 days in advance
- [ ] Enable maintenance mode at 1:55 AM
- [ ] Take pre-maintenance backup
- [ ] Run VACUUM ANALYZE on all tables
- [ ] Run REINDEX CONCURRENTLY on large indexes
- [ ] Update table statistics
- [ ] Check for missing indexes
- [ ] Review slow query log
- [ ] Test backup restore (spot check)
- [ ] Review and rotate logs
- [ ] Disable maintenance mode
- [ ] Verify system health
- [ ] Send completion notification

---

## Troubleshooting Guide

### Issue: Slow Template Listing Page

**Symptoms:** API endpoint `/api/templates` taking > 2 seconds

**Diagnosis:**

```sql
-- 1. Check for missing index
EXPLAIN ANALYZE
SELECT
  id,
  name,
  status,
  category,
  created_at
FROM public.cms_templates
WHERE is_deleted = false
  AND status IN ('draft', 'published')
ORDER BY created_at DESC
LIMIT 50;

-- Expected: Index Scan on idx_cms_templates_list
-- If seeing Seq Scan: Index not being used or missing
```

**Resolution:**

```sql
-- Option 1: Update statistics
ANALYZE public.cms_templates;

-- Option 2: Recreate index
DROP INDEX IF EXISTS idx_cms_templates_list;
CREATE INDEX idx_cms_templates_list
  ON public.cms_templates(status, category, created_at DESC)
  WHERE is_deleted = false;

-- Option 3: Add materialized view caching
-- Already provided: cms_template_stats
REFRESH MATERIALIZED VIEW CONCURRENTLY public.cms_template_stats;
```

### Issue: Failed Scheduled Publish

**Symptoms:** Templates not publishing at scheduled time

**Diagnosis:**

```sql
-- 1. Check for pending schedules
SELECT
  id,
  template_id,
  version_id,
  status,
  publish_at,
  execution_attempts,
  last_execution_error
FROM public.cms_template_schedules
WHERE status = 'pending'
  AND publish_at <= NOW()
ORDER BY publish_at DESC;

-- 2. Check for errors in action log
SELECT
  action_type,
  action_data,
  created_at
FROM public.cms_action_history
WHERE action_type LIKE '%publish%'
  AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

**Resolution:**

```sql
-- Manual publish if cron failed
SELECT * FROM public.cms_publish_template(
  'TEMPLATE_ID',
  'VERSION_ID',
  'ADMIN_USER_ID'
);

-- Update schedule status
UPDATE public.cms_template_schedules
SET
  status = 'active',
  executed_at = NOW()
WHERE id = 'SCHEDULE_ID';

-- Check cron job is running
-- Verify: SELECT * FROM public.cms_process_scheduled_publishes();
```

### Issue: High Replication Lag

**Symptoms:** Replica lagging > 60 seconds behind primary

**Diagnosis:**

```sql
-- On primary server
SELECT
  client_addr,
  state,
  sync_state,
  sent_lsn,
  write_lsn,
  flush_lsn,
  replay_lsn,
  EXTRACT(EPOCH FROM replay_lag) as replay_lag_seconds
FROM pg_stat_replication;

-- Check for long-running queries blocking replication
SELECT
  pid,
  usename,
  application_name,
  state,
  NOW() - query_start as query_duration,
  query
FROM pg_stat_activity
WHERE state = 'active'
  AND NOW() - query_start > INTERVAL '5 minutes'
ORDER BY query_start;
```

**Resolution:**

```bash
# 1. Terminate blocking queries (if safe)
# pg_terminate_backend(PID)

# 2. Check network connectivity
# ping REPLICA_IP

# 3. Check disk I/O on replica
# iostat -x 5 10

# 4. If lag continues to grow: Consider failover
# Follow failover procedures above
```

### Issue: RLS Policy Blocking Admin Access

**Symptoms:** Admin users cannot view/edit templates

**Diagnosis:**

```sql
-- 1. Verify user role
SELECT id, email, role FROM public.users WHERE id = 'USER_ID';

-- 2. Test RLS policy
SET ROLE authenticated;
SET request.jwt.claim.sub = 'USER_ID';

SELECT * FROM public.cms_templates LIMIT 1;
-- If returns 0 rows: RLS policy blocking access

-- 3. Check policy definitions
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename LIKE 'cms_%'
ORDER BY tablename, policyname;
```

**Resolution:**

```sql
-- Temporary bypass for emergency (USE WITH CAUTION)
ALTER TABLE public.cms_templates DISABLE ROW LEVEL SECURITY;
-- Perform emergency operation
ALTER TABLE public.cms_templates ENABLE ROW LEVEL SECURITY;

-- Permanent fix: Update user role
UPDATE public.users
SET role = 'admin'
WHERE id = 'USER_ID';

-- Or: Add user as collaborator
INSERT INTO public.cms_template_collaborators (
  template_id,
  user_id,
  role
) VALUES (
  'TEMPLATE_ID',
  'USER_ID',
  'editor'
);
```

---

## Alerting Thresholds

### Critical Alerts (Page On-Call)

| Metric | Threshold | Action |
|--------|-----------|--------|
| Database connection failure | Any | Immediate investigation |
| Replication lag | > 5 minutes | Check primary/replica health |
| Disk space | < 10% free | Expand storage or archive data |
| Failed scheduled publish | > 5 consecutive | Check cron job and logs |
| Lock wait time | > 1 minute | Identify blocking query |

### Warning Alerts (Email/Slack)

| Metric | Threshold | Action |
|--------|-----------|--------|
| Query time p95 | > 200ms | Review slow queries |
| Connection pool usage | > 80% | Scale connection pool |
| Table bloat | > 30% | Schedule VACUUM |
| Index bloat | > 40% | Schedule REINDEX |
| Backup failure | Any | Verify backup system |

### Informational Alerts (Dashboard)

| Metric | Threshold | Action |
|--------|-----------|--------|
| Template creation rate | > 100/day | Review for bulk imports |
| Version creation rate | > 1000/day | Review for automation |
| Action history size | > 1 GB | Consider partitioning |

---

## Security Procedures

### Access Audit

```sql
-- Query: User access review
-- Run frequency: Monthly
-- Purpose: Verify principle of least privilege

SELECT
  u.id,
  u.email,
  u.role,
  COUNT(DISTINCT tc.template_id) as templates_accessible,
  ARRAY_AGG(DISTINCT tc.role) as collaborator_roles,
  MAX(tc.created_at) as last_access_grant
FROM public.users u
LEFT JOIN public.cms_template_collaborators tc ON u.id = tc.user_id
WHERE u.role IN ('admin', 'editor')
GROUP BY u.id, u.email, u.role
ORDER BY templates_accessible DESC;
```

### Data Breach Response

**Immediate Actions (< 5 minutes):**

1. Revoke compromised credentials
2. Enable maintenance mode
3. Take forensic snapshot
4. Notify security team

```sql
-- Revoke all sessions for compromised user
UPDATE public.users
SET
  role = 'suspended',
  metadata = metadata || '{"security_incident": "INCIDENT_ID", "suspended_at": "' || NOW() || '"}'
WHERE id = 'COMPROMISED_USER_ID';

-- Remove from all collaborators
DELETE FROM public.cms_template_collaborators
WHERE user_id = 'COMPROMISED_USER_ID';

-- Audit recent actions
SELECT
  action_type,
  action_data,
  template_id,
  created_at,
  ip_address,
  user_agent
FROM public.cms_action_history
WHERE performed_by = 'COMPROMISED_USER_ID'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Compliance & Data Retention

```sql
-- GDPR: Delete user data upon request
-- Must complete within 30 days

-- 1. Anonymize action history
UPDATE public.cms_action_history
SET
  performed_by = NULL,
  ip_address = NULL,
  user_agent = NULL,
  session_id = NULL
WHERE performed_by = 'USER_ID';

-- 2. Reassign templates to system user
UPDATE public.cms_templates
SET
  created_by = 'SYSTEM_USER_ID',
  updated_by = 'SYSTEM_USER_ID'
WHERE created_by = 'USER_ID' OR updated_by = 'USER_ID';

-- 3. Remove collaborator entries
DELETE FROM public.cms_template_collaborators
WHERE user_id = 'USER_ID';

-- 4. Anonymize comments
UPDATE public.cms_template_comments
SET
  created_by = NULL,
  content = '[Deleted by user request]'
WHERE created_by = 'USER_ID';

-- 5. Document deletion
INSERT INTO public.cms_action_history (
  template_id,
  action_type,
  action_data,
  performed_by
) VALUES (
  gen_random_uuid(),
  'gdpr_deletion',
  jsonb_build_object(
    'user_id', 'USER_ID',
    'deletion_date', NOW(),
    'ticket', 'GDPR-12345'
  ),
  'SYSTEM_USER_ID'
);
```

---

## Appendix

### Quick Reference Commands

```bash
# Connection info
psql -c "SELECT version();"
psql -c "SELECT current_database();"

# Table sizes
psql -c "\dt+ public.cms_*"

# Index sizes
psql -c "\di+ public.idx_cms_*"

# Active queries
psql -c "SELECT pid, query, state, NOW() - query_start FROM pg_stat_activity WHERE state = 'active';"

# Kill query
psql -c "SELECT pg_terminate_backend(PID);"

# Kill all idle connections
psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND NOW() - state_change > INTERVAL '10 minutes';"
```

### Escalation Contacts

| Issue Type | Contact | Response Time |
|------------|---------|---------------|
| Database down | #dba-oncall | 5 minutes |
| Performance degradation | #dba-team | 30 minutes |
| Data corruption | #dba-oncall + #security | 15 minutes |
| Security incident | #security-team | Immediate |

### Change Management

All schema changes must follow:

1. Peer review in GitHub PR
2. Testing in staging environment
3. Backup before applying
4. Rollback plan documented
5. Approval from DBA lead
6. Scheduled during maintenance window

---

**End of Runbook**

*This document should be reviewed and updated quarterly. Last review: 2024-12-18*
