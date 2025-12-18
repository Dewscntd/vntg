# Homepage CMS Optimization - Quick Reference

## Key Database Functions

### Public Functions (Available to all users)

```sql
-- Get optimized homepage content
SELECT * FROM get_homepage_content_optimized('en');
-- Returns: All published sections with products/categories
-- Performance: 30-80ms

-- Get content from materialized view (fastest)
SELECT * FROM get_homepage_from_mv('en');
-- Returns: Cached homepage content
-- Performance: 3-5ms
```

### Admin Functions (Requires authentication)

```sql
-- List all sections with metadata
SELECT * FROM get_admin_sections_list('en', NULL, NULL);
-- Params: locale, status (optional), section_type (optional)
-- Performance: 20-40ms

-- Get section version history
SELECT * FROM get_section_version_history(
  'section-uuid',  -- section_id
  20,              -- limit
  0                -- offset
);
-- Performance: 15-25ms

-- Count total versions
SELECT count_section_versions('section-uuid');
-- Performance: <5ms

-- Manually refresh materialized view
SELECT manual_refresh_homepage_mv();
-- Returns: Refresh duration
-- Run after: Bulk publishes, data migrations
```

### System Functions (Scheduled/automated)

```sql
-- Process scheduled publishes
SELECT * FROM process_scheduled_publishes_optimized();
-- Run: Every 5 minutes via cron
-- Performance: 200-400ms per batch (50 sections)
```

## Performance Monitoring Queries

```sql
-- Quick health check (run daily)
SELECT * FROM get_cache_hit_ratio();
-- Target: >99%

-- Query performance stats
SELECT * FROM get_cms_query_performance();
-- Check: mean_time_ms for each query type

-- Index effectiveness
SELECT * FROM get_cms_index_usage_stats();
-- Look for: Low idx_scan on large indexes

-- Find unused indexes (candidates for removal)
SELECT * FROM get_unused_cms_indexes();
-- Action: Review and potentially drop

-- Health alerts
SELECT * FROM check_cms_health_alerts();
-- Immediate action required for CRITICAL alerts
```

## Cache Management

### Cache Keys

```typescript
// Homepage content by locale
CACHE_KEYS.HOMEPAGE_CONTENT('en')
// → "homepage:content:en:v2"

// Section detail
CACHE_KEYS.SECTION_DETAIL(sectionId)
// → "section:abc-123:detail"

// Admin section list
CACHE_KEYS.ADMIN_SECTIONS('en', 'draft')
// → "admin:sections:en:draft"
```

### Cache TTLs

| Content Type | TTL | Use Case |
|-------------|-----|----------|
| Homepage Content | 3600s (1h) | Public homepage |
| Section Detail | 3600s (1h) | Individual sections |
| Media Assets | 86400s (24h) | Static images/videos |
| Admin Sections | 300s (5m) | Admin dashboard |
| Version History | 300s (5m) | Version browser |
| Scheduled Sections | 60s (1m) | Upcoming publishes |

### Invalidation

```typescript
// After publishing a section
await handleSectionPublishCache(sectionId, locale);
// Invalidates: homepage, section detail, admin list

// After updating a draft
await handleSectionUpdateCache(sectionId, locale);
// Invalidates: admin list only

// After reordering sections
await handleSectionReorderCache(locale);
// Invalidates: homepage, admin list

// Manual invalidation via API
POST /api/homepage/content
{
  "locale": "en",
  "section_id": "abc-123"
}
```

## API Endpoints

### GET /api/homepage/content

Fetch homepage content with caching

**Query Parameters:**
- `locale` (default: 'en') - Language code
- `source` ('mv' | 'db') - Force data source
- `no_cache` (true/false) - Bypass cache for preview

**Response Headers:**
- `X-Cache-Status` - Cache source (edge-cache, data-cache, materialized-view, database)
- `X-Response-Time` - Response time in ms
- `Cache-Control` - Browser/CDN cache directives

**Example:**
```bash
curl "https://your-domain.com/api/homepage/content?locale=en"
```

### POST /api/homepage/content

Manually revalidate cache (Admin only)

**Request Body:**
```json
{
  "locale": "en",
  "section_id": "optional-section-id"
}
```

**Response:**
```json
{
  "success": true,
  "revalidated_tags": ["homepage:en", "section:abc-123"],
  "revalidated_paths": ["/en", "/"],
  "materialized_view_refresh": "Refreshed in 45 ms"
}
```

## Performance Targets

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Homepage Render (uncached) | <100ms | >150ms |
| Homepage Render (cached) | <10ms | >20ms |
| Materialized View Query | <5ms | >10ms |
| Cache Hit Ratio | >98% | <95% |
| Index Scans | >95% | <80% |
| Connection Pool Usage | <70% | >85% |

## Common Operations

### Publish a Section

```sql
-- Publish a specific version
SELECT * FROM publish_section_version(
  'section-uuid',  -- section_id
  'version-uuid'   -- version_id
);

-- Then invalidate cache
SELECT pg_notify('cache_invalidate',
  json_build_object(
    'action', 'section_publish',
    'section_id', 'section-uuid',
    'locale', 'en'
  )::text
);
```

### Revert to Previous Version

```sql
-- Create new version from old content
SELECT * FROM revert_section_to_version(
  'section-uuid',        -- section_id
  'old-version-uuid'     -- version_id to revert to
);
```

### Reorder Sections

```sql
-- Bulk reorder
SELECT reorder_homepage_sections('[
  {"id": "section-1-uuid", "display_order": 0},
  {"id": "section-2-uuid", "display_order": 1},
  {"id": "section-3-uuid", "display_order": 2}
]'::jsonb);
```

### Archive Old Versions

```sql
-- Archive versions older than 12 months
SELECT archive_old_versions(12);
-- Returns: Count of archived versions
```

## Index Maintenance

### Weekly Reindex (Sunday 2 AM)

```sql
-- Reindex critical indexes
REINDEX INDEX CONCURRENTLY idx_section_versions_content_gin;
REINDEX INDEX CONCURRENTLY idx_homepage_sections_render;
REINDEX INDEX CONCURRENTLY idx_section_versions_section_published;

-- Analyze tables
ANALYZE homepage_sections;
ANALYZE section_versions;
ANALYZE section_products;
ANALYZE section_categories;
```

### Monitor Index Bloat

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename LIKE '%section%'
ORDER BY pg_relation_size(indexrelid) DESC;
```

## Troubleshooting Commands

### Slow Homepage

```sql
-- Check materialized view freshness
SELECT locale, last_updated FROM mv_published_homepage;

-- Manually refresh if stale
SELECT manual_refresh_homepage_mv();

-- Check query plan
EXPLAIN ANALYZE SELECT * FROM get_homepage_content_optimized('en');
```

### High Database CPU

```sql
-- Find slow queries
SELECT pid, now() - query_start as duration, query
FROM pg_stat_activity
WHERE state = 'active'
  AND now() - query_start > interval '1 second'
ORDER BY duration DESC;

-- Kill problematic query (if necessary)
SELECT pg_terminate_backend(pid);
```

### Cache Not Working

```bash
# Check cache headers
curl -I "https://your-domain.com/api/homepage/content?locale=en"

# Look for:
# - X-Cache-Status: Should be 'data-cache' or 'edge-cache'
# - Cache-Control: Should have s-maxage=3600

# Manual cache clear
curl -X POST "https://your-domain.com/api/homepage/content" \
  -H "Content-Type: application/json" \
  -d '{"locale":"en"}'
```

### Connection Pool Exhaustion

```sql
-- Check active connections
SELECT
  count(*) as total_connections,
  count(*) FILTER (WHERE state = 'active') as active,
  count(*) FILTER (WHERE state = 'idle') as idle
FROM pg_stat_activity
WHERE datname = current_database();

-- Kill idle connections (if needed)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database()
  AND state = 'idle'
  AND state_change < now() - interval '10 minutes';
```

## Emergency Procedures

### Rollback Optimization (if critical issues)

```sql
-- Use original functions
SELECT * FROM get_homepage_content('en');
-- Falls back to original implementation

-- Disable materialized view
-- (Keep using optimized query)
```

### Full Rollback

```bash
# Revert database changes
psql $DATABASE_URL < rollback_script.sql

# Revert application code
git revert <optimization-commit>
git push
```

### Performance Regression

1. Check monitoring: `SELECT * FROM check_cms_health_alerts();`
2. Review recent changes: `git log --oneline -10`
3. Compare metrics: Before/after query times
4. Consider partial rollback: Disable MV, keep indexes

## Useful Monitoring Dashboards

### Supabase Dashboard

1. Go to Database → Query Performance
2. Filter by: Functions containing 'homepage' or 'section'
3. Check: Execution time, call frequency
4. Alert on: >100ms avg execution time

### Application Monitoring

```typescript
// Add to your monitoring service (e.g., Vercel Analytics)
track('homepage_render', {
  cache_status: cacheStatus,
  response_time: duration,
  locale: locale,
});
```

### Custom Monitoring Endpoint

```bash
# Health check endpoint
curl https://your-domain.com/api/monitoring/health-check

# Expected response:
{
  "alerts": [],
  "cache_hit_ratio": 99.2,
  "avg_response_time": 8,
  "status": "healthy"
}
```

## Best Practices

1. **Always use optimized functions** in production
2. **Warm cache after deployments** via API call
3. **Monitor cache hit ratio daily** (target >98%)
4. **Reindex weekly** during low-traffic periods
5. **Archive old versions monthly** (keep last 12 months)
6. **Test before scaling** (load test with k6)
7. **Set up alerts** for critical thresholds
8. **Document incidents** and resolution steps

## Quick Links

- [Full Strategy](/Users/michael/Projects/vntg/docs/DATABASE_OPTIMIZATION_STRATEGY.md)
- [Implementation Guide](/Users/michael/Projects/vntg/docs/IMPLEMENTATION_GUIDE.md)
- [Migration File](/Users/michael/Projects/vntg/supabase/migrations/20241217000002_homepage_cms_optimizations.sql)
- [Cache Module](/Users/michael/Projects/vntg/lib/cache/cms-cache.ts)
- [API Route](/Users/michael/Projects/vntg/app/api/homepage/content/route.ts)
