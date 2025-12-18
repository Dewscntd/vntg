# Homepage CMS Optimization Implementation Guide

This guide walks through implementing and testing the database optimizations for the Homepage CMS system.

## Overview

The optimization strategy consists of:
1. Optimized SQL queries using CTEs
2. Strategic database indexes
3. Materialized views for ultra-fast rendering
4. Multi-layer application caching
5. Performance monitoring and alerting

**Expected Performance Improvements:**
- Homepage render: 150-300ms → 30-80ms (50-70% faster)
- Materialized view: <5ms (95%+ faster)
- Cache hit ratio: 85-90% → 98-99%

## Prerequisites

- PostgreSQL 14+ (Supabase)
- Next.js 14+ with App Router
- Node.js 18+
- Admin access to Supabase database

## Step-by-Step Implementation

### Phase 1: Database Optimizations (Week 1)

#### Step 1.1: Apply Database Migration

```bash
# Connect to Supabase
cd /Users/michael/Projects/vntg

# Review the migration
cat supabase/migrations/20241217000002_homepage_cms_optimizations.sql

# Apply migration via Supabase CLI
npx supabase db push

# Or apply via Supabase Dashboard:
# 1. Go to Database → SQL Editor
# 2. Paste contents of 20241217000002_homepage_cms_optimizations.sql
# 3. Run the migration
```

#### Step 1.2: Verify Migration Success

```sql
-- Run verification queries
SELECT 'OPTIMIZED FUNCTIONS' as section;
SELECT proname, prokind
FROM pg_proc
WHERE proname LIKE '%homepage%' OR proname LIKE '%section%'
  AND pronamespace = 'public'::regnamespace;

SELECT 'INDEXES CREATED' as section;
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'homepage_sections',
    'section_versions',
    'section_products',
    'section_categories'
  )
ORDER BY tablename, indexname;

SELECT 'MATERIALIZED VIEWS' as section;
SELECT schemaname, matviewname
FROM pg_matviews
WHERE schemaname = 'public';
```

Expected output:
- 8+ new functions created
- 10+ new indexes created
- 1 materialized view (mv_published_homepage)

#### Step 1.3: Initial Materialized View Refresh

```sql
-- Manually refresh the materialized view
SELECT * FROM manual_refresh_homepage_mv();

-- Verify data exists
SELECT locale, jsonb_array_length(sections) as section_count, last_updated
FROM mv_published_homepage;
```

### Phase 2: Application Integration (Week 1-2)

#### Step 2.1: Update API Routes

The optimized API route has been created at:
```
/Users/michael/Projects/vntg/app/api/homepage/content/route.ts
```

**To integrate:**

1. Update homepage page to use the new API:

```typescript
// app/[locale]/page.tsx
import { createClient } from '@/lib/supabase/server';

export const revalidate = 3600; // 1 hour ISR

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = createClient();

  // Use optimized function
  const { data: sections } = await supabase.rpc('get_homepage_content_optimized', {
    p_locale: locale,
  });

  // Or use materialized view for even faster performance
  // const { data: sections } = await supabase.rpc('get_homepage_from_mv', {
  //   p_locale: locale,
  // });

  return <LandingTemplate sections={sections} />;
}
```

2. Update admin section listing:

```typescript
// app/[locale]/admin/homepage/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function AdminHomepage({ params: { locale } }) {
  const supabase = createClient();

  const { data: sections } = await supabase.rpc('get_admin_sections_list', {
    p_locale: locale,
    p_status: null, // or 'draft', 'published', etc.
    p_section_type: null,
  });

  return <AdminSectionList sections={sections} />;
}
```

#### Step 2.2: Implement Cache Invalidation

Create a webhook handler for cache invalidation:

```typescript
// app/api/webhooks/cache-invalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleSectionPublishCache } from '@/lib/cache/cms-cache';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, section_id, locale } = body;

  switch (action) {
    case 'section_publish':
      await handleSectionPublishCache(section_id, locale);
      break;

    case 'section_update':
      await handleSectionUpdateCache(section_id, locale);
      break;

    case 'section_reorder':
      await handleSectionReorderCache(locale);
      break;
  }

  return NextResponse.json({ success: true });
}
```

Then call this webhook from your admin actions:

```typescript
// After publishing a section
await fetch('/api/webhooks/cache-invalidate', {
  method: 'POST',
  body: JSON.stringify({
    action: 'section_publish',
    section_id: sectionId,
    locale: locale,
  }),
});
```

#### Step 2.3: Set Up Cron Job for Scheduled Publishes

Option A: Vercel Cron (Recommended)

```typescript
// app/api/cron/process-schedules/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();

  const { data: results } = await supabase.rpc('process_scheduled_publishes_optimized');

  return NextResponse.json({
    success: true,
    processed: results?.length || 0,
    results,
  });
}
```

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/process-schedules",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Option B: GitHub Actions

```yaml
# .github/workflows/process-schedules.yml
name: Process Scheduled CMS Publishes

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes

jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger cron endpoint
        run: |
          curl -X GET "${{ secrets.APP_URL }}/api/cron/process-schedules" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Phase 3: Performance Monitoring (Week 2)

#### Step 3.1: Create Monitoring Dashboard

```typescript
// app/[locale]/admin/performance/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function PerformanceDashboard() {
  const supabase = createClient();

  const [
    { data: queryPerf },
    { data: tableStats },
    { data: cacheHitRatio },
    { data: indexUsage },
    { data: healthAlerts },
  ] = await Promise.all([
    supabase.rpc('get_cms_query_performance'),
    supabase.rpc('get_cms_table_stats'),
    supabase.rpc('get_cache_hit_ratio'),
    supabase.rpc('get_cms_index_usage_stats'),
    supabase.rpc('check_cms_health_alerts'),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h2>Query Performance</h2>
        <PerformanceTable data={queryPerf} />
      </section>

      <section>
        <h2>Cache Hit Ratio</h2>
        <CacheMetrics data={cacheHitRatio} />
      </section>

      <section>
        <h2>Health Alerts</h2>
        <AlertsList alerts={healthAlerts} />
      </section>

      <section>
        <h2>Index Usage</h2>
        <IndexTable data={indexUsage} />
      </section>
    </div>
  );
}
```

#### Step 3.2: Set Up Alerts

Configure alerts in Supabase:

```sql
-- Create pg_cron job for health monitoring (if pg_cron is available)
SELECT cron.schedule(
  'cms-health-alerts',
  '*/15 * * * *', -- Every 15 minutes
  $$
  DO $$
  DECLARE
    v_alerts RECORD;
  BEGIN
    FOR v_alerts IN
      SELECT * FROM check_cms_health_alerts()
      WHERE alert_level IN ('CRITICAL', 'WARNING')
    LOOP
      -- Send notification (implement your notification system)
      RAISE WARNING 'CMS Alert [%]: % (current: %, threshold: %)',
        v_alerts.alert_level,
        v_alerts.message,
        v_alerts.current_value,
        v_alerts.threshold;
    END LOOP;
  END $$;
  $$
);
```

Or create an API route that polls regularly:

```typescript
// app/api/monitoring/health-check/route.ts
export async function GET() {
  const supabase = createClient();
  const { data: alerts } = await supabase.rpc('check_cms_health_alerts');

  const criticalAlerts = alerts?.filter((a) => a.alert_level === 'CRITICAL');

  if (criticalAlerts?.length) {
    // Send to monitoring service (e.g., Sentry, DataDog)
    console.error('[CMS Health] Critical alerts:', criticalAlerts);
  }

  return NextResponse.json({ alerts });
}
```

### Phase 4: Testing & Validation

#### Step 4.1: Performance Benchmarks

Run benchmark tests:

```sql
-- Test homepage render performance
SELECT * FROM benchmark_homepage_render(100);

-- Expected results:
-- get_homepage_content_optimized: avg ~40ms
-- get_homepage_from_mv: avg ~3ms
```

#### Step 4.2: Load Testing

Use a load testing tool to validate performance under traffic:

```bash
# Install k6 (load testing tool)
brew install k6

# Create load test script
cat > load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<100', 'p(99)<200'], // 95% < 100ms, 99% < 200ms
  },
};

export default function () {
  const res = http.get('https://your-domain.com/api/homepage/content?locale=en');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100,
    'has sections': (r) => JSON.parse(r.body).sections.length > 0,
  });

  sleep(1);
}
EOF

# Run load test
k6 run load-test.js
```

Expected results:
- p95 response time: <100ms
- p99 response time: <200ms
- Error rate: <0.1%

#### Step 4.3: Cache Effectiveness Test

```typescript
// Test cache hit rates
async function testCacheEffectiveness() {
  const iterations = 100;
  const results = { hits: 0, misses: 0, totalTime: 0 };

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const res = await fetch('/api/homepage/content?locale=en');
    const end = performance.now();

    const cacheStatus = res.headers.get('X-Cache-Status');
    if (cacheStatus === 'data-cache' || cacheStatus === 'edge-cache') {
      results.hits++;
    } else {
      results.misses++;
    }

    results.totalTime += end - start;
  }

  console.log({
    hitRate: (results.hits / iterations) * 100 + '%',
    avgResponseTime: results.totalTime / iterations + 'ms',
  });
}
```

Target: >95% cache hit rate after warm-up

### Phase 5: Monitoring & Maintenance

#### Step 5.1: Daily Monitoring Checklist

Create a monitoring script:

```bash
#!/bin/bash
# monitoring/daily-check.sh

echo "=== Daily CMS Health Check ==="
echo ""

echo "1. Cache Hit Ratio:"
psql $DATABASE_URL -c "SELECT * FROM get_cache_hit_ratio();"

echo ""
echo "2. Query Performance:"
psql $DATABASE_URL -c "SELECT * FROM get_cms_query_performance() LIMIT 5;"

echo ""
echo "3. Health Alerts:"
psql $DATABASE_URL -c "SELECT * FROM check_cms_health_alerts();"

echo ""
echo "4. Index Usage:"
psql $DATABASE_URL -c "SELECT * FROM get_unused_cms_indexes();"
```

Run daily via cron:
```bash
0 9 * * * /path/to/monitoring/daily-check.sh | mail -s "CMS Daily Report" team@example.com
```

#### Step 5.2: Weekly Maintenance Tasks

```sql
-- Run weekly (Sunday 2 AM)
-- 1. Reindex for performance
REINDEX INDEX CONCURRENTLY idx_section_versions_content_gin;
REINDEX INDEX CONCURRENTLY idx_homepage_sections_render;

-- 2. Archive old versions (12+ months)
SELECT archive_old_versions(12);

-- 3. Refresh statistics
ANALYZE homepage_sections;
ANALYZE section_versions;
ANALYZE section_products;
ANALYZE section_categories;

-- 4. Check for bloat
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%section%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Troubleshooting

### Issue: Slow Homepage Rendering

**Diagnosis:**
```sql
EXPLAIN ANALYZE SELECT * FROM get_homepage_content_optimized('en');
```

**Solutions:**
1. Check if materialized view is up to date: `SELECT * FROM mv_published_homepage;`
2. Manually refresh: `SELECT manual_refresh_homepage_mv();`
3. Check for missing indexes: `SELECT * FROM get_unused_cms_indexes();`
4. Verify cache is working: Check `X-Cache-Status` header

### Issue: High Database Load

**Diagnosis:**
```sql
SELECT * FROM pg_stat_activity
WHERE state = 'active'
  AND query LIKE '%homepage%'
ORDER BY query_start;
```

**Solutions:**
1. Increase connection pool size in Supabase
2. Enable more aggressive caching
3. Use materialized view exclusively during peak traffic
4. Consider read replicas for high traffic

### Issue: Stale Content After Publishing

**Diagnosis:**
```sql
-- Check when MV was last refreshed
SELECT locale, last_updated FROM mv_published_homepage;

-- Check if triggers are firing
SELECT * FROM pg_stat_user_triggers
WHERE schemaname = 'public'
  AND relname IN ('homepage_sections', 'section_versions');
```

**Solutions:**
1. Manually trigger cache invalidation: `POST /api/homepage/content`
2. Manually refresh MV: `SELECT manual_refresh_homepage_mv();`
3. Check trigger status: Ensure triggers are enabled
4. Verify webhook endpoints are reachable

### Issue: Cache Hit Ratio Below 95%

**Diagnosis:**
```sql
SELECT * FROM get_cache_hit_ratio();
```

**Solutions:**
1. Increase cache TTL if content doesn't change frequently
2. Warm cache after deployments
3. Check for cache invalidation abuse
4. Review cache key patterns for collisions

## Performance Targets

| Metric | Baseline | Target | Achieved |
|--------|----------|--------|----------|
| Homepage Render (uncached) | 150-300ms | <100ms | ⬜ |
| Homepage Render (cached) | N/A | <10ms | ⬜ |
| Materialized View Query | N/A | <5ms | ⬜ |
| Admin Section List | 80-150ms | <50ms | ⬜ |
| Cache Hit Ratio | 85-90% | >98% | ⬜ |
| p95 Response Time | 200-400ms | <100ms | ⬜ |
| p99 Response Time | 400-800ms | <200ms | ⬜ |

## Rollback Plan

If issues occur, rollback using:

```sql
-- Run the rollback script
BEGIN;

DROP MATERIALIZED VIEW IF EXISTS public.mv_published_homepage CASCADE;
DROP FUNCTION IF EXISTS public.get_homepage_content_optimized(TEXT);
DROP FUNCTION IF EXISTS public.get_admin_sections_list(TEXT, TEXT, TEXT);

-- Drop added indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_section_versions_section_published;
DROP INDEX CONCURRENTLY IF EXISTS idx_section_products_covering;
DROP INDEX CONCURRENTLY IF EXISTS idx_section_categories_covering;

-- Drop triggers
DROP TRIGGER IF EXISTS homepage_sections_cache_invalidate ON public.homepage_sections;
DROP TRIGGER IF EXISTS refresh_mv_on_section_publish ON public.homepage_sections;

COMMIT;
```

Then revert application code changes via Git:
```bash
git revert <commit-hash>
git push
```

## Next Steps

After successful implementation:

1. Monitor performance for 1 week
2. Adjust cache TTLs based on real usage
3. Consider implementing Redis/Upstash for distributed caching
4. Implement additional materialized views for other heavy queries
5. Set up automated performance regression testing
6. Document team procedures for cache management

## Resources

- [DATABASE_OPTIMIZATION_STRATEGY.md](/Users/michael/Projects/vntg/docs/DATABASE_OPTIMIZATION_STRATEGY.md) - Full optimization details
- [Migration File](/Users/michael/Projects/vntg/supabase/migrations/20241217000002_homepage_cms_optimizations.sql)
- [Cache Implementation](/Users/michael/Projects/vntg/lib/cache/cms-cache.ts)
- [API Route Example](/Users/michael/Projects/vntg/app/api/homepage/content/route.ts)

## Support

For issues or questions:
1. Check monitoring dashboard first
2. Run health check: `SELECT * FROM check_cms_health_alerts();`
3. Review application logs
4. Contact database team with diagnostics
