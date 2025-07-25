import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ZodSchema } from 'zod';
import { Database } from '@/types/supabase';
import { handleUnauthorized, handleZodError, errorResponse } from './index';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Middleware to check if user is authenticated
export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, session: any) => Promise<NextResponse>
): Promise<NextResponse> {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return handleUnauthorized();
  }

  return handler(req, session);
}

// Middleware to check if user is an admin
export async function withAdmin(
  req: NextRequest,
  handler: (req: NextRequest, session: any) => Promise<NextResponse>
): Promise<NextResponse> {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return handleUnauthorized();
  }

  // Check if user is an admin
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!user || user.role !== 'admin') {
    return handleUnauthorized('Admin access required');
  }

  return handler(req, session);
}

// Middleware to validate request body against a schema
export async function withValidation<T>(
  req: NextRequest,
  schema: ZodSchema<T>,
  handler: (req: NextRequest, validData: T) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const body = await req.json();
    const validData = schema.parse(body);
    return handler(req, validData);
  } catch (error) {
    if (error instanceof Error && 'format' in error) {
      return handleZodError(error as any);
    }
    return handleZodError({
      errors: [{ path: [], message: 'Invalid request body' }],
    } as any);
  }
}

// Middleware to validate query parameters against a schema
export async function withQueryValidation<T>(
  req: NextRequest,
  schema: ZodSchema<T>,
  handler: (req: NextRequest, validData: T) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const queryParams: Record<string, any> = {};

    // Convert query parameters to appropriate types
    url.searchParams.forEach((value, key) => {
      // Try to convert to number if possible
      if (!isNaN(Number(value))) {
        queryParams[key] = Number(value);
      }
      // Convert to boolean if 'true' or 'false'
      else if (value === 'true') {
        queryParams[key] = true;
      } else if (value === 'false') {
        queryParams[key] = false;
      }
      // Otherwise keep as string
      else {
        queryParams[key] = value;
      }
    });

    const validData = schema.parse(queryParams);
    return handler(req, validData);
  } catch (error) {
    if (error instanceof Error && 'format' in error) {
      return handleZodError(error as any);
    }
    return handleZodError({
      errors: [{ path: [], message: 'Invalid query parameters' }],
    } as any);
  }
}

// Rate limiting middleware
export async function withRateLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: { maxRequests: number; windowMs: number } = { maxRequests: 10, windowMs: 60000 }
): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const key = `rate_limit:${ip}`;
  const now = Date.now();

  // Clean up expired entries
  const entries = Array.from(rateLimitStore.entries());
  for (const [k, v] of entries) {
    if (v.resetTime < now) {
      rateLimitStore.delete(k);
    }
  }

  const current = rateLimitStore.get(key);

  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + options.windowMs });
    return handler(req);
  }

  if (current.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + options.windowMs });
    return handler(req);
  }

  if (current.count >= options.maxRequests) {
    return errorResponse('Too many requests', 429);
  }

  current.count++;
  return handler(req);
}

// Payment-specific security middleware
export async function withPaymentSecurity(
  req: NextRequest,
  handler: (req: NextRequest, session: any) => Promise<NextResponse>
): Promise<NextResponse> {
  // Apply stricter rate limiting for payment endpoints
  return withRateLimit(
    req,
    async (req) => {
      return withAuth(req, async (req, session) => {
        // Additional payment security checks
        const userAgent = req.headers.get('user-agent');
        const origin = req.headers.get('origin');

        // Basic bot detection
        if (!userAgent || userAgent.includes('bot') || userAgent.includes('crawler')) {
          return errorResponse('Invalid request', 403);
        }

        // Origin validation (in production, check against allowed origins)
        if (
          process.env.NODE_ENV === 'production' &&
          origin &&
          !origin.includes(process.env.NEXT_PUBLIC_APP_URL || '')
        ) {
          return errorResponse('Invalid origin', 403);
        }

        return handler(req, session);
      });
    },
    { maxRequests: 5, windowMs: 60000 }
  ); // 5 requests per minute for payment endpoints
}

// Combine multiple middleware functions
export function compose(...middlewares: any[]) {
  return async (req: NextRequest, handler: any) => {
    let result = handler;

    // Apply middlewares in reverse order
    for (let i = middlewares.length - 1; i >= 0; i--) {
      const middleware = middlewares[i];
      const nextHandler = result;
      result = async (req: NextRequest, ...args: any[]) =>
        middleware(req, (...newArgs: any[]) => nextHandler(req, ...newArgs));
    }

    return result(req);
  };
}
