import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security headers configuration for production
export const securityHeaders = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com https://www.google-analytics.com",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

// Rate limiting configuration
export const rateLimitConfig = {
  // API endpoints rate limits (requests per minute)
  '/api/auth': 10,
  '/api/cart': 60,
  '/api/products': 100,
  '/api/orders': 30,
  '/api/checkout': 20,
  '/api/webhooks': 1000, // High limit for webhooks
  '/api/health': 60,
  
  // Default rate limit
  default: 100,
};

// CORS configuration
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.NEXT_PUBLIC_APP_URL!]
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
};

// Input validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  zipCode: /^[\d\-\s]+$/,
  productId: /^[a-zA-Z0-9\-_]+$/,
  orderId: /^[a-zA-Z0-9\-_]+$/,
  userId: /^[a-zA-Z0-9\-_]+$/,
};

// Sanitization functions
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// Security middleware
export function withSecurity(handler: Function) {
  return async (req: NextRequest) => {
    // Apply security headers
    const response = await handler(req);
    
    if (response instanceof NextResponse) {
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }
    
    return response;
  };
}

// Rate limiting middleware (simplified - use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(endpoint: string, limit?: number) {
  return function(handler: Function) {
    return async (req: NextRequest) => {
      const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
      const key = `${ip}:${endpoint}`;
      const now = Date.now();
      const windowMs = 60 * 1000; // 1 minute window
      const requestLimit = limit || rateLimitConfig[endpoint as keyof typeof rateLimitConfig] || rateLimitConfig.default;
      
      const current = requestCounts.get(key);
      
      if (!current || now > current.resetTime) {
        requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      } else {
        current.count++;
        
        if (current.count > requestLimit) {
          return NextResponse.json(
            { error: 'Too many requests' },
            { 
              status: 429,
              headers: {
                'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
              }
            }
          );
        }
      }
      
      return handler(req);
    };
  };
}

// Input validation middleware
export function withValidation(schema: any) {
  return function(handler: Function) {
    return async (req: NextRequest) => {
      try {
        const body = await req.json();
        const validatedData = schema.parse(body);
        
        // Add validated data to request
        (req as any).validatedData = validatedData;
        
        return handler(req);
      } catch (error: any) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.errors },
          { status: 400 }
        );
      }
    };
  };
}

// CSRF protection (simplified)
export function withCSRFProtection(handler: Function) {
  return async (req: NextRequest) => {
    // Skip CSRF for GET requests and webhooks
    if (req.method === 'GET' || req.url.includes('/webhooks/')) {
      return handler(req);
    }
    
    const token = req.headers.get('x-csrf-token');
    const sessionToken = req.cookies.get('csrf-token')?.value;
    
    if (!token || !sessionToken || token !== sessionToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
    
    return handler(req);
  };
}

// SQL injection prevention
export function sanitizeSqlInput(input: string): string {
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove SQL block comments
    .replace(/\*\//g, '');
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Environment variable validation
export function validateEnvironmentVariables(): void {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate URL formats
  try {
    new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  } catch {
    throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL format');
  }
  
  // Validate API key formats
  if (!process.env.STRIPE_SECRET_KEY!.startsWith('sk_')) {
    throw new Error('Invalid Stripe secret key format');
  }
  
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!.startsWith('pk_')) {
    throw new Error('Invalid Stripe publishable key format');
  }
}
