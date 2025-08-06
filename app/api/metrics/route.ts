import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Prometheus-style metrics endpoint
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const startTime = Date.now();
    
    // Memory metrics
    const memoryUsage = process.memoryUsage();
    
    // Uptime metrics
    const uptime = process.uptime();
    
    // Database connection metrics
    let dbResponseTime = 0;
    let dbStatus = 0;
    try {
      const dbStart = Date.now();
      await supabase.from('products').select('id').limit(1);
      dbResponseTime = Date.now() - dbStart;
      dbStatus = 1;
    } catch (error) {
      dbStatus = 0;
    }
    
    // Generate Prometheus-style metrics
    const metrics = `
# HELP nodejs_memory_heap_used_bytes Node.js heap memory used in bytes
# TYPE nodejs_memory_heap_used_bytes gauge
nodejs_memory_heap_used_bytes ${memoryUsage.heapUsed}

# HELP nodejs_memory_heap_total_bytes Node.js heap memory total in bytes
# TYPE nodejs_memory_heap_total_bytes gauge
nodejs_memory_heap_total_bytes ${memoryUsage.heapTotal}

# HELP nodejs_memory_rss_bytes Node.js RSS memory in bytes
# TYPE nodejs_memory_rss_bytes gauge
nodejs_memory_rss_bytes ${memoryUsage.rss}

# HELP nodejs_memory_external_bytes Node.js external memory in bytes
# TYPE nodejs_memory_external_bytes gauge
nodejs_memory_external_bytes ${memoryUsage.external}

# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${uptime}

# HELP vntg_database_connection_status Database connection status (1 = up, 0 = down)
# TYPE vntg_database_connection_status gauge
vntg_database_connection_status ${dbStatus}

# HELP vntg_database_response_time_ms Database response time in milliseconds
# TYPE vntg_database_response_time_ms gauge
vntg_database_response_time_ms ${dbResponseTime}

# HELP vntg_api_response_time_ms API response time in milliseconds
# TYPE vntg_api_response_time_ms gauge
vntg_api_response_time_ms ${Date.now() - startTime}

# HELP vntg_build_info Build information
# TYPE vntg_build_info gauge
vntg_build_info{version="${process.env.npm_package_version || '1.0.0'}",environment="${process.env.NODE_ENV || 'development'}"} 1
`;

    return new NextResponse(metrics.trim(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to generate metrics', message: error.message },
      { status: 500 }
    );
  }
}

// JSON metrics endpoint for custom monitoring systems
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const startTime = Date.now();
    
    // Collect various metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Database metrics
    let dbMetrics = {};
    try {
      const dbStart = Date.now();
      const { data, error } = await supabase.from('products').select('id').limit(1);
      dbMetrics = {
        status: error ? 'down' : 'up',
        responseTime: Date.now() - dbStart,
        error: error?.message,
      };
    } catch (error: any) {
      dbMetrics = {
        status: 'down',
        responseTime: Date.now() - startTime,
        error: error.message,
      };
    }
    
    // System metrics
    const systemMetrics = {
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      },
      uptime: {
        seconds: uptime,
        human: formatUptime(uptime),
      },
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    };
    
    // Application metrics (you can extend this with business metrics)
    const appMetrics = {
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
    };
    
    const metrics = {
      system: systemMetrics,
      database: dbMetrics,
      application: appMetrics,
    };
    
    return NextResponse.json(metrics, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to collect metrics', message: error.message },
      { status: 500 }
    );
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}