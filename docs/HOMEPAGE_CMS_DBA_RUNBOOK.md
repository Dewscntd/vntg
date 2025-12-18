# Homepage CMS - DBA Operations Runbook

## Overview

This runbook provides operational procedures, monitoring queries, backup strategies, and disaster recovery instructions for the Homepage CMS system in production.

**Target Audience:** Database Administrators, DevOps Engineers, On-call Engineers
**System:** Supabase PostgreSQL (Homepage CMS)
**Last Updated:** December 17, 2025
**On-call Priority:** P1 (Homepage is critical user-facing content)

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Monitoring & Alerting](#monitoring--alerting)
3. [Backup & Recovery](#backup--recovery)
4. [Performance Tuning](#performance-tuning)
5. [Scheduled Tasks](#scheduled-tasks)
6. [Incident Response](#incident-response)
7. [Maintenance Procedures](#maintenance-procedures)
8. [Capacity Planning](#capacity-planning)

---

## Quick Reference

### Critical Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Homepage load time | > 500ms | > 1000ms | Check indexes, cache |
| Scheduled publish lag | > 5min | > 15min | Check cron job |
| Failed publishes | > 1/hour | > 5/hour | Check logs, RLS |
| Media storage | > 80% | > 90% | Archive old media |
| Version table size | > 10GB | > 50GB | Archive old versions |

### Key Contacts

- **Primary DBA:** [Name] - [Contact]
- **Backup DBA:** [Name] - [Contact]
- **DevOps Lead:** [Name] - [Contact]
- **Escalation:** [Manager] - [Contact]

### Emergency Commands

```bash
# Check system health
psql -c "SELECT * FROM pg_stat_database WHERE datname = 'vntg';"

# Kill runaway query
psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE query LIKE '%homepage%' AND state = 'active' AND query_start < NOW() - INTERVAL '5 minutes';"

# Force scheduled publish processing
psql -c "SELECT * FROM process_scheduled_publishes();"

# Disable all sections (emergency homepage kill switch)
psql -c "UPDATE homepage_sections SET is_active = false WHERE locale = 'en';"

# Re-enable sections
psql -c "UPDATE homepage_sections SET is_active = true WHERE locale = 'en' AND status = 'published';"
```

---

## Monitoring & Alerting

### Health Check Queries

Run these queries every 5 minutes via monitoring system (Prometheus, Datadog, etc.)

#### 1. Homepage Rendering Performance

```sql
-- Monitor get_homepage_content execution time
EXPLAIN ANALYZE
SELECT * FROM get_homepage_content('en');

-- Expected: < 100ms total runtime
-- Alert if: > 500ms
```

**Expected Output:**
```
Planning Time: 2-5ms
Execution Time: 50-100ms
```

**If slow:**
1. Check if indexes are being used
2. Verify statistics are up to date: `ANALYZE homepage_sections;`
3. Check for table bloat
4. Review recent schema changes

---

#### 2. Scheduled Publish Lag

```sql
-- Check pending schedules that should have been processed
SELECT
  COUNT(*) as overdue_count,
  MAX(NOW() - publish_at) as max_lag
FROM section_schedules
WHERE status = 'pending'
  AND publish_at <= NOW() - INTERVAL '5 minutes';

-- Expected: overdue_count = 0
-- Alert if: overdue_count > 0 OR max_lag > 15 minutes
```

**If failing:**
1. Check cron job status
2. Manually trigger: `SELECT * FROM process_scheduled_publishes();`
3. Review function logs for errors
4. Check RLS policies blocking publishes

---

#### 3. Version Table Growth

```sql
-- Monitor version table size and growth rate
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE tablename IN ('section_versions', 'homepage_sections', 'section_schedules')
ORDER BY size_bytes DESC;

-- Alert if: section_versions > 10GB
```

**Mitigation:**
- Archive versions older than 6 months
- Implement version retention policy
- Consider partitioning by created_at

---

#### 4. Failed Publish Attempts

```sql
-- Monitor publish errors (requires application-level logging)
-- This query assumes you've added error tracking to publish_section_version

-- Check recent section status changes
SELECT
  section_key,
  status,
  updated_at,
  LAG(status) OVER (PARTITION BY id ORDER BY updated_at) as previous_status
FROM homepage_sections
WHERE updated_at > NOW() - INTERVAL '1 hour'
  AND status = 'draft' -- Indicating failed publish attempt
ORDER BY updated_at DESC;

-- Alert if: multiple failed publish attempts in short time
```

---

#### 5. RLS Policy Violations

```sql
-- Check for RLS policy denials (requires pgAudit or log analysis)
-- Monitor Supabase logs for "permission denied" errors

-- Verify RLS policies are active
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename LIKE 'homepage%' OR tablename LIKE 'section%'
  AND rowsecurity = false;

-- Expected: 0 rows (all tables should have RLS enabled)
-- Alert if: any tables with rowsecurity = false
```

---

#### 6. Media Storage Capacity

```sql
-- Monitor media assets storage usage
SELECT
  COUNT(*) as total_files,
  SUM(file_size) as total_bytes,
  pg_size_pretty(SUM(file_size)) as total_size,
  AVG(file_size) as avg_file_size,
  MAX(file_size) as max_file_size,
  MIN(created_at) as oldest_file,
  MAX(created_at) as newest_file
FROM media_assets;

-- Alert if: total_bytes > 80% of storage quota
```

**Cleanup Strategy:**
```sql
-- Find unused media assets (not referenced by any section)
SELECT ma.*
FROM media_assets ma
WHERE NOT EXISTS (
  SELECT 1 FROM section_versions sv
  WHERE sv.content::text LIKE '%' || ma.file_path || '%'
)
  AND ma.created_at < NOW() - INTERVAL '90 days';

-- Archive or delete after verification
```

---

### Alerting Configuration

**Prometheus/Grafana Alerts:**

```yaml
# homepage_cms_alerts.yml
groups:
  - name: homepage_cms
    interval: 1m
    rules:
      - alert: HomepageSlowQuery
        expr: homepage_render_duration_seconds > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Homepage rendering is slow"
          description: "get_homepage_content() taking {{ $value }}s"

      - alert: ScheduledPublishLag
        expr: homepage_scheduled_publish_lag_minutes > 15
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Scheduled publishes are delayed"
          description: "{{ $value }} minutes behind schedule"

      - alert: HighPublishFailureRate
        expr: rate(homepage_publish_failures_total[5m]) > 0.1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High rate of publish failures"

      - alert: MediaStorageHigh
        expr: homepage_media_storage_percent > 80
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Media storage at {{ $value }}%"
```

---

## Backup & Recovery

### Backup Strategy

**RTO (Recovery Time Objective):** 15 minutes
**RPO (Recovery Point Objective):** 5 minutes

#### Automated Backups

**Supabase Automatic Backups:**
- Point-in-time recovery (PITR) enabled
- Hourly snapshots retained for 7 days
- Daily backups retained for 30 days
- Weekly backups retained for 90 days

**Verify Backup Status:**
```bash
# Supabase CLI
supabase db backups list

# Expected: Recent backups within last hour
```

#### Manual Backup Procedures

**Full Homepage CMS Backup:**

```bash
#!/bin/bash
# backup_homepage_cms.sh

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/homepage_cms"
DB_NAME="vntg"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Dump homepage CMS tables
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  -t public.homepage_sections \
  -t public.section_versions \
  -t public.section_schedules \
  -t public.section_products \
  -t public.section_categories \
  -t public.media_assets \
  --no-acl --no-owner \
  -F c \
  -f "$BACKUP_DIR/homepage_cms_${BACKUP_DATE}.dump"

# Compress backup
gzip "$BACKUP_DIR/homepage_cms_${BACKUP_DATE}.dump"

# Upload to S3/Cloud Storage
aws s3 cp "$BACKUP_DIR/homepage_cms_${BACKUP_DATE}.dump.gz" \
  s3://vntg-backups/homepage_cms/

# Verify backup integrity
pg_restore --list "$BACKUP_DIR/homepage_cms_${BACKUP_DATE}.dump.gz" > /dev/null
if [ $? -eq 0 ]; then
  echo "Backup verified successfully"
else
  echo "ERROR: Backup verification failed!"
  # Alert ops team
fi

# Cleanup old local backups (keep 7 days)
find "$BACKUP_DIR" -name "*.dump.gz" -mtime +7 -delete

echo "Backup completed: homepage_cms_${BACKUP_DATE}.dump.gz"
```

**Schedule via cron:**
```cron
# Run backup every 6 hours
0 */6 * * * /scripts/backup_homepage_cms.sh
```

---

### Recovery Procedures

#### Scenario 1: Restore Specific Section to Previous State

**Incident:** Section content accidentally overwritten

**Steps:**

1. **Identify the target version:**
```sql
-- View version history
SELECT
  version_number,
  created_at,
  change_summary,
  is_published,
  created_by
FROM section_versions
WHERE section_id = '<section-uuid>'
ORDER BY version_number DESC
LIMIT 20;
```

2. **Revert to previous version:**
```sql
-- Use built-in revert function
SELECT * FROM revert_section_to_version(
  '<section-uuid>',
  '<target-version-uuid>'
);
```

3. **Publish reverted version:**
```sql
-- Publish the new version created by revert
SELECT * FROM publish_section_version(
  '<section-uuid>',
  '<new-version-uuid-from-revert>'
);
```

4. **Verify restoration:**
```sql
SELECT * FROM get_homepage_content('en')
WHERE section_id = '<section-uuid>';
```

**Recovery Time:** < 5 minutes
**Data Loss:** None (uses built-in versioning)

---

#### Scenario 2: Restore Entire Homepage from Backup

**Incident:** Multiple sections corrupted, database-level issue

**Steps:**

1. **Identify recovery point:**
```bash
# List available backups
supabase db backups list

# Choose backup closest to incident start time
BACKUP_ID="<backup-id>"
```

2. **Create restore point (safety):**
```bash
# Take snapshot before restore
pg_dump -h $DB_HOST -U $DB_USER -d vntg -F c -f pre_restore_$(date +%Y%m%d_%H%M%S).dump
```

3. **Restore from backup:**
```bash
# Option A: Point-in-time recovery (Supabase)
supabase db restore --backup-id $BACKUP_ID

# Option B: Manual restore from dump
pg_restore -h $DB_HOST -U $DB_USER -d vntg \
  --clean --if-exists \
  -t homepage_sections \
  -t section_versions \
  -t section_schedules \
  -t section_products \
  -t section_categories \
  homepage_cms_backup.dump
```

4. **Verify data integrity:**
```sql
-- Check section count
SELECT COUNT(*) FROM homepage_sections;

-- Check version integrity
SELECT
  hs.section_key,
  hs.status,
  sv.version_number,
  sv.is_published
FROM homepage_sections hs
LEFT JOIN section_versions sv ON hs.published_version_id = sv.id
WHERE hs.locale = 'en';

-- Verify homepage renders
SELECT COUNT(*) FROM get_homepage_content('en');
```

5. **Clear application cache:**
```bash
# Invalidate Next.js cache
curl -X POST https://api.vntg.com/api/revalidate?path=/

# Or manual cache purge
redis-cli FLUSHDB
```

6. **Monitor for issues:**
```sql
-- Watch for errors in next hour
SELECT * FROM pg_stat_activity
WHERE query LIKE '%homepage%'
  AND state = 'active';
```

**Recovery Time:** 15-30 minutes
**Data Loss:** Up to 5 minutes (based on RPO)

---

#### Scenario 3: Disaster Recovery (Complete Database Loss)

**Incident:** Database server failure, complete data loss

**Steps:**

1. **Activate DR plan:**
   - Notify stakeholders (ETA: 1-2 hours for full recovery)
   - Spin up new Supabase instance or restore to standby

2. **Restore from latest backup:**
```bash
# Restore full database from S3/Cloud Storage
aws s3 cp s3://vntg-backups/latest_full_backup.dump.gz /tmp/
gunzip /tmp/latest_full_backup.dump.gz

# Restore to new instance
pg_restore -h $NEW_DB_HOST -U $DB_USER -d vntg \
  --no-acl --no-owner \
  -j 4 \
  /tmp/latest_full_backup.dump
```

3. **Run migrations if needed:**
```bash
# Ensure schema is up to date
supabase db push

# Or manually apply migrations
psql -f /migrations/20241217000001_homepage_cms_system.sql
```

4. **Verify all functions and triggers:**
```sql
-- Check all functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%section%'
  OR routine_name LIKE '%homepage%';

-- Expected functions:
-- - get_homepage_content
-- - publish_section_version
-- - revert_section_to_version
-- - process_scheduled_publishes
-- - etc.
```

5. **Re-enable scheduled jobs:**
```sql
-- Re-create cron job
SELECT cron.schedule(
  'process-scheduled-publishes',
  '*/5 * * * *',
  $$SELECT process_scheduled_publishes()$$
);
```

6. **Smoke test critical paths:**
```bash
# Test homepage load
curl -I https://vntg.com/

# Test admin publish flow
curl -X POST https://api.vntg.com/api/admin/sections/publish \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"section_id": "test-id", "version_id": "test-version"}'
```

7. **Update DNS/connection strings:**
```bash
# Update application environment variables
export DATABASE_URL="postgresql://..."

# Restart application servers
kubectl rollout restart deployment/vntg-web
```

**Recovery Time:** 1-2 hours
**Data Loss:** Up to 1 hour (depends on backup frequency)

---

## Performance Tuning

### Index Optimization

#### Verify Index Usage

```sql
-- Check index usage statistics
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND (tablename LIKE 'homepage%' OR tablename LIKE 'section%')
ORDER BY idx_scan DESC;

-- Indexes with idx_scan = 0 are unused and can be dropped
```

**Expected High-Usage Indexes:**
- `idx_homepage_sections_render` - Used for every homepage load
- `idx_section_versions_history` - Used for version lookups
- `idx_section_schedules_pending` - Used by cron job

---

#### Create Missing Indexes

If monitoring shows slow queries, create targeted indexes:

```sql
-- Example: Index for filtering by created_at
CREATE INDEX CONCURRENTLY idx_section_versions_created_at
ON section_versions(created_at DESC)
WHERE is_published = false;

-- Example: Index for admin queries
CREATE INDEX CONCURRENTLY idx_homepage_sections_admin
ON homepage_sections(locale, status, updated_at DESC)
WHERE is_active = true;
```

**Always use `CREATE INDEX CONCURRENTLY`** to avoid locking the table.

---

#### Remove Unused Indexes

```sql
-- Drop unused index (example)
DROP INDEX CONCURRENTLY idx_old_unused_index;
```

---

### Query Optimization

#### Analyze Slow Queries

**Enable slow query logging:**
```sql
-- Set threshold to 500ms
ALTER DATABASE vntg SET log_min_duration_statement = 500;
```

**Review slow query log:**
```sql
-- Query pg_stat_statements (requires extension)
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query LIKE '%homepage%'
ORDER BY mean_time DESC
LIMIT 10;
```

---

#### Optimize get_homepage_content()

**Current implementation uses:**
- Correlated subqueries for products/categories
- LEFT JOINs for version data
- WHERE filtering for published sections

**If slow, consider:**

1. **Materialized view approach:**
```sql
CREATE MATERIALIZED VIEW homepage_content_cache AS
SELECT * FROM get_homepage_content('en');

CREATE UNIQUE INDEX ON homepage_content_cache(section_id);

-- Refresh on publish
CREATE OR REPLACE FUNCTION refresh_homepage_cache()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY homepage_content_cache;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_cache_on_publish
AFTER INSERT OR UPDATE ON section_versions
FOR EACH ROW
WHEN (NEW.is_published = true)
EXECUTE FUNCTION refresh_homepage_cache();
```

2. **Denormalization:**
```sql
-- Add computed column for faster access
ALTER TABLE homepage_sections
ADD COLUMN published_content JSONB;

-- Update on publish
CREATE OR REPLACE FUNCTION cache_published_content()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE homepage_sections
  SET published_content = (
    SELECT content FROM section_versions
    WHERE id = NEW.id AND is_published = true
  )
  WHERE id = NEW.section_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### Connection Pooling

**Recommended Pool Settings (PgBouncer/Supabase Pooler):**

```ini
[databases]
vntg = host=db.supabase.co port=5432 dbname=vntg

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 10
reserve_pool_size = 5
reserve_pool_timeout = 3
```

**Monitor pool usage:**
```sql
SELECT
  datname,
  numbackends as connections,
  xact_commit as transactions_committed,
  xact_rollback as transactions_rolled_back,
  blks_read as blocks_read,
  blks_hit as blocks_hit_cache,
  ROUND(blks_hit::numeric / NULLIF(blks_hit + blks_read, 0) * 100, 2) as cache_hit_ratio
FROM pg_stat_database
WHERE datname = 'vntg';

-- Target: cache_hit_ratio > 95%
```

---

## Scheduled Tasks

### Cron Job: Process Scheduled Publishes

**Frequency:** Every 5 minutes
**Function:** `process_scheduled_publishes()`
**Expected Runtime:** < 1 second
**Failure Impact:** Scheduled content won't publish on time

**Setup:**

```sql
-- Using pg_cron extension
SELECT cron.schedule(
  'process-scheduled-publishes',
  '*/5 * * * *',
  $$SELECT process_scheduled_publishes()$$
);

-- Verify schedule
SELECT * FROM cron.job WHERE jobname = 'process-scheduled-publishes';
```

**Monitoring:**

```sql
-- Check cron job execution history
SELECT
  jobid,
  runid,
  job_pid,
  database,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (
  SELECT jobid FROM cron.job
  WHERE jobname = 'process-scheduled-publishes'
)
ORDER BY start_time DESC
LIMIT 20;

-- Alert if: status != 'succeeded' OR end_time - start_time > 5 seconds
```

**Manual Execution:**

```sql
-- Force run if cron job is stuck
SELECT * FROM process_scheduled_publishes();

-- Expected output: Array of {section_id, version_id, action}
```

---

### Maintenance Task: Version Cleanup

**Frequency:** Weekly
**Purpose:** Archive old draft versions to prevent table bloat
**Expected Runtime:** 5-10 minutes

**Script:**

```sql
-- cleanup_old_versions.sql

BEGIN;

-- Archive versions older than 6 months (keep only published or latest 50)
WITH versions_to_keep AS (
  SELECT DISTINCT id
  FROM (
    -- Keep all published versions
    SELECT id FROM section_versions WHERE is_published = true
    UNION
    -- Keep latest 50 per section
    SELECT id FROM (
      SELECT
        id,
        ROW_NUMBER() OVER (PARTITION BY section_id ORDER BY version_number DESC) as rn
      FROM section_versions
    ) ranked WHERE rn <= 50
  ) keep
),
versions_to_archive AS (
  SELECT id, section_id, version_number, content, created_at
  FROM section_versions
  WHERE id NOT IN (SELECT id FROM versions_to_keep)
    AND created_at < NOW() - INTERVAL '6 months'
)
-- Move to archive table
INSERT INTO section_versions_archive
SELECT * FROM versions_to_archive;

-- Delete archived versions
DELETE FROM section_versions
WHERE id IN (SELECT id FROM versions_to_archive);

-- Log results
DO $$
DECLARE
  archived_count INTEGER;
BEGIN
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RAISE NOTICE 'Archived % old versions', archived_count;
END $$;

COMMIT;

-- Vacuum to reclaim space
VACUUM ANALYZE section_versions;
```

**Schedule:**

```bash
# crontab
0 2 * * 0 psql -f /scripts/cleanup_old_versions.sql >> /logs/version_cleanup.log 2>&1
```

---

### Maintenance Task: Statistics Update

**Frequency:** Daily
**Purpose:** Keep query planner statistics current

```sql
-- update_statistics.sql

-- Analyze all homepage CMS tables
ANALYZE homepage_sections;
ANALYZE section_versions;
ANALYZE section_schedules;
ANALYZE section_products;
ANALYZE section_categories;
ANALYZE media_assets;

-- Log completion
SELECT NOW() as analyzed_at, 'Homepage CMS statistics updated' as status;
```

**Schedule:**

```bash
# crontab
0 3 * * * psql -f /scripts/update_statistics.sql
```

---

## Incident Response

### P1: Homepage Not Loading

**Symptoms:**
- Users report blank homepage
- `get_homepage_content()` returns no results
- Application errors referencing homepage sections

**Triage:**

1. **Check if sections exist:**
```sql
SELECT COUNT(*) FROM homepage_sections
WHERE locale = 'en' AND is_active = true AND status = 'published';

-- Expected: > 0
-- If 0: All sections disabled or deleted
```

2. **Check RLS policies:**
```sql
SET ROLE anon;
SELECT * FROM homepage_sections WHERE locale = 'en';

-- Should return published sections
-- If empty: RLS policy issue
```

3. **Check function execution:**
```sql
SELECT * FROM get_homepage_content('en');

-- If error: Function broken or permissions issue
```

**Resolution Paths:**

**Path A: Sections disabled (accidental update)**
```sql
-- Re-enable sections
UPDATE homepage_sections
SET is_active = true
WHERE locale = 'en' AND status = 'published';

-- Clear cache
-- Verify homepage loads
```

**Path B: RLS policy blocking public access**
```sql
-- Temporarily grant access (emergency only)
DROP POLICY "Published sections viewable by everyone" ON homepage_sections;

CREATE POLICY "Published sections viewable by everyone" ON homepage_sections
  FOR SELECT USING (status = 'published' AND is_active = true);

-- Reload policies
SELECT pg_reload_conf();
```

**Path C: Function execution error**
```sql
-- Check function exists
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'get_homepage_content';

-- If missing, re-run migration
\i /migrations/20241217000001_homepage_cms_system.sql
```

**Path D: Complete failure - Use fallback**
```sql
-- Emergency: Serve static homepage
-- Update application to use hardcoded fallback content
-- (This should be pre-configured in application code)
```

**Post-Incident:**
- Document root cause
- Add monitoring to prevent recurrence
- Review change management process

---

### P2: Scheduled Publish Not Working

**Symptoms:**
- Scheduled content not going live on time
- `section_schedules` shows pending status past `publish_at`

**Triage:**

1. **Check cron job status:**
```sql
SELECT * FROM cron.job WHERE jobname = 'process-scheduled-publishes';

-- Verify: active = true
```

2. **Check recent job runs:**
```sql
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'process-scheduled-publishes')
ORDER BY start_time DESC
LIMIT 5;

-- Look for: status = 'failed' or long runtimes
```

3. **Manually process:**
```sql
SELECT * FROM process_scheduled_publishes();

-- Check output for errors
```

**Resolution:**

**Path A: Cron job disabled**
```sql
-- Re-enable cron job
SELECT cron.unschedule('process-scheduled-publishes');

SELECT cron.schedule(
  'process-scheduled-publishes',
  '*/5 * * * *',
  $$SELECT process_scheduled_publishes()$$
);
```

**Path B: Function error**
```sql
-- Check function logs
-- Re-run migration if function corrupted
\i /migrations/20241217000001_homepage_cms_system.sql
```

**Path C: RLS blocking publish**
```sql
-- Ensure function has SECURITY DEFINER
ALTER FUNCTION process_scheduled_publishes() SECURITY DEFINER;
```

---

### P3: Performance Degradation

**Symptoms:**
- Homepage load time > 1 second
- Database CPU high
- Connection pool exhaustion

**Triage:**

1. **Identify slow queries:**
```sql
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE state = 'active'
  AND query LIKE '%homepage%'
ORDER BY duration DESC;
```

2. **Check index usage:**
```sql
SELECT * FROM pg_stat_user_indexes
WHERE tablename LIKE 'homepage%' OR tablename LIKE 'section%';

-- Look for: idx_scan = 0 (unused) or very low
```

3. **Check table bloat:**
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  ROUND(n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100, 2) as dead_row_percent
FROM pg_stat_user_tables
WHERE tablename LIKE 'homepage%' OR tablename LIKE 'section%'
ORDER BY dead_row_percent DESC;

-- Alert if: dead_row_percent > 20%
```

**Resolution:**

**Path A: Table bloat**
```sql
-- VACUUM FULL (requires table lock, run during maintenance window)
VACUUM FULL ANALYZE section_versions;

-- Or use pg_repack (no lock required)
pg_repack -t section_versions
```

**Path B: Missing statistics**
```sql
ANALYZE homepage_sections;
ANALYZE section_versions;
ANALYZE section_products;
ANALYZE section_categories;
```

**Path C: Query optimization needed**
```sql
-- Add missing index
CREATE INDEX CONCURRENTLY idx_custom_optimization
ON section_versions(section_id, is_published)
WHERE is_published = true;
```

---

## Maintenance Procedures

### Weekly Maintenance Checklist

**Every Sunday 2:00 AM UTC:**

- [ ] Run version cleanup script
- [ ] VACUUM ANALYZE all tables
- [ ] Verify backup integrity
- [ ] Review slow query log
- [ ] Check scheduled publish success rate
- [ ] Archive old media assets
- [ ] Update monitoring dashboards

**Script:**

```bash
#!/bin/bash
# weekly_maintenance.sh

echo "=== Weekly Homepage CMS Maintenance ==="
date

# 1. Version cleanup
echo "Running version cleanup..."
psql -f /scripts/cleanup_old_versions.sql

# 2. VACUUM ANALYZE
echo "Running VACUUM ANALYZE..."
psql -c "VACUUM ANALYZE homepage_sections;"
psql -c "VACUUM ANALYZE section_versions;"
psql -c "VACUUM ANALYZE section_schedules;"

# 3. Verify backups
echo "Verifying latest backup..."
LATEST_BACKUP=$(aws s3 ls s3://vntg-backups/homepage_cms/ | sort | tail -n 1 | awk '{print $4}')
aws s3 cp "s3://vntg-backups/homepage_cms/$LATEST_BACKUP" /tmp/verify_backup.dump.gz
gunzip /tmp/verify_backup.dump.gz
pg_restore --list /tmp/verify_backup.dump > /dev/null
if [ $? -eq 0 ]; then
  echo "✓ Backup verified"
else
  echo "✗ Backup verification failed!"
  # Alert ops team
fi

# 4. Slow query review
echo "Reviewing slow queries..."
psql -c "SELECT query, calls, mean_time FROM pg_stat_statements WHERE query LIKE '%homepage%' ORDER BY mean_time DESC LIMIT 10;"

# 5. Scheduled publish metrics
echo "Scheduled publish success rate..."
psql -c "SELECT status, COUNT(*) FROM section_schedules WHERE updated_at > NOW() - INTERVAL '7 days' GROUP BY status;"

# 6. Media cleanup
echo "Archiving old unused media..."
# (Implementation depends on media usage tracking)

echo "=== Maintenance Complete ==="
```

---

### Monthly Maintenance Checklist

**First Sunday of each month:**

- [ ] Review and optimize indexes
- [ ] Capacity planning review
- [ ] Disaster recovery test
- [ ] Security audit (RLS policies)
- [ ] Performance baseline measurements
- [ ] Update runbook documentation

---

## Capacity Planning

### Growth Metrics to Track

**1. Section Count Growth**
```sql
-- Track section creation rate
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as sections_created
FROM homepage_sections
GROUP BY month
ORDER BY month DESC;

-- Project 6 months forward based on 3-month average
```

**2. Version Storage Growth**
```sql
-- Track version table size over time
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as versions_created,
  SUM(LENGTH(content::text)) as total_content_bytes,
  pg_size_pretty(SUM(LENGTH(content::text))) as total_content_size
FROM section_versions
GROUP BY month
ORDER BY month DESC;

-- Alert if: growth rate > 20% month-over-month
```

**3. Media Storage Growth**
```sql
-- Track media asset growth
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as files_uploaded,
  SUM(file_size) as total_bytes,
  pg_size_pretty(SUM(file_size)) as total_size
FROM media_assets
GROUP BY month
ORDER BY month DESC;
```

### Scaling Thresholds

| Metric | Current | Warning | Action Required |
|--------|---------|---------|-----------------|
| Sections per locale | < 20 | > 50 | Review section architecture |
| Versions per section | < 100 | > 500 | Implement archival strategy |
| Media assets | < 10,000 | > 100,000 | Implement CDN, compression |
| DB size (CMS tables) | < 5GB | > 20GB | Consider partitioning |
| Query latency p95 | < 100ms | > 500ms | Optimize queries, add indexes |

### Vertical Scaling Plan

**Current:** Supabase Small (2 CPU, 4GB RAM)

**Upgrade Path:**
1. **Medium (4 CPU, 8GB RAM)** - When DB size > 10GB or connections > 100
2. **Large (8 CPU, 16GB RAM)** - When DB size > 50GB or connections > 500
3. **Extra Large (16 CPU, 32GB RAM)** - Enterprise scale

**Trigger Upgrade When:**
- CPU sustained > 70% for 1 hour
- Memory usage > 80%
- Connection pool exhaustion events
- Query latency p95 > 500ms consistently

---

## Appendix

### Useful Diagnostic Queries

**Table Sizes:**
```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
  AND (tablename LIKE 'homepage%' OR tablename LIKE 'section%')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Active Queries:**
```sql
SELECT
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  NOW() - query_start AS duration,
  query
FROM pg_stat_activity
WHERE state != 'idle'
  AND query NOT LIKE '%pg_stat_activity%'
ORDER BY query_start;
```

**Lock Monitoring:**
```sql
SELECT
  locked.pid,
  locked.usename,
  locked.query,
  locking.pid AS locking_pid,
  locking.usename AS locking_user,
  locking.query AS locking_query
FROM pg_stat_activity locked
JOIN pg_locks ON pg_locks.pid = locked.pid
JOIN pg_stat_activity locking ON pg_locks.granted = false AND locking.pid != locked.pid;
```

---

**Document Version:** 1.0
**Last Updated:** December 17, 2025
**Next Review:** January 17, 2026
**Owner:** Database Operations Team
