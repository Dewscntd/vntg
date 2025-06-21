import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getServerStripe } from '@/lib/stripe/server';

// Health check endpoint for monitoring
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const checks: Record<string, any> = {};
  let overallStatus = 'healthy';

  try {
    // Check database connectivity
    try {
      const supabase = createRouteHandlerClient({ cookies });
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      
      checks.database = {
        status: error ? 'unhealthy' : 'healthy',
        responseTime: Date.now() - startTime,
        error: error?.message,
      };
      
      if (error) overallStatus = 'degraded';
    } catch (error: any) {
      checks.database = {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
      };
      overallStatus = 'unhealthy';
    }

    // Check Stripe connectivity
    try {
      const stripe = getServerStripe();
      const stripeStartTime = Date.now();
      
      // Simple API call to check Stripe connectivity
      await stripe.products.list({ limit: 1 });
      
      checks.stripe = {
        status: 'healthy',
        responseTime: Date.now() - stripeStartTime,
      };
    } catch (error: any) {
      checks.stripe = {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
      };
      if (overallStatus !== 'unhealthy') overallStatus = 'degraded';
    }

    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
    );

    checks.environment = {
      status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
      missingVariables: missingEnvVars,
    };

    if (missingEnvVars.length > 0) {
      overallStatus = 'unhealthy';
    }

    // Check memory usage (Node.js specific)
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    };

    checks.memory = {
      status: memoryUsageMB.heapUsed < 500 ? 'healthy' : 'warning',
      usage: memoryUsageMB,
    };

    // Check uptime
    checks.uptime = {
      status: 'healthy',
      seconds: process.uptime(),
    };

    // Overall response
    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: Date.now() - startTime,
      checks,
    };

    // Return appropriate HTTP status
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(response, { status: httpStatus });

  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: error.message,
      checks,
    }, { status: 503 });
  }
}

// Detailed health check for internal monitoring
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const { detailed = false } = await req.json();
  
  if (!detailed) {
    return GET(req);
  }

  const checks: Record<string, any> = {};
  let overallStatus = 'healthy';

  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Detailed database checks
    try {
      // Check table accessibility
      const tables = ['products', 'categories', 'orders', 'users'];
      const tableChecks: Record<string, any> = {};

      for (const table of tables) {
        try {
          const tableStartTime = Date.now();
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

          tableChecks[table] = {
            status: error ? 'unhealthy' : 'healthy',
            responseTime: Date.now() - tableStartTime,
            count,
            error: error?.message,
          };

          if (error) overallStatus = 'degraded';
        } catch (error: any) {
          tableChecks[table] = {
            status: 'unhealthy',
            responseTime: Date.now() - startTime,
            error: error.message,
          };
          overallStatus = 'unhealthy';
        }
      }

      checks.database = {
        status: overallStatus === 'unhealthy' ? 'unhealthy' : 'healthy',
        tables: tableChecks,
      };
    } catch (error: any) {
      checks.database = {
        status: 'unhealthy',
        error: error.message,
      };
      overallStatus = 'unhealthy';
    }

    // Check storage buckets
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      checks.storage = {
        status: error ? 'unhealthy' : 'healthy',
        buckets: buckets?.map(b => b.name) || [],
        error: error?.message,
      };

      if (error) overallStatus = 'degraded';
    } catch (error: any) {
      checks.storage = {
        status: 'unhealthy',
        error: error.message,
      };
      if (overallStatus !== 'unhealthy') overallStatus = 'degraded';
    }

    // Check external services
    const externalServices = [
      {
        name: 'stripe',
        check: async () => {
          const stripe = getServerStripe();
          await stripe.products.list({ limit: 1 });
        },
      },
    ];

    for (const service of externalServices) {
      try {
        const serviceStartTime = Date.now();
        await service.check();
        
        checks[service.name] = {
          status: 'healthy',
          responseTime: Date.now() - serviceStartTime,
        };
      } catch (error: any) {
        checks[service.name] = {
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          error: error.message,
        };
        if (overallStatus !== 'unhealthy') overallStatus = 'degraded';
      }
    }

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: Date.now() - startTime,
      detailed: true,
      checks,
    };

    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(response, { status: httpStatus });

  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: error.message,
      detailed: true,
      checks,
    }, { status: 503 });
  }
}
