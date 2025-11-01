import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'he'],
  defaultLocale: 'he'
});

export async function middleware(req: NextRequest) {
  const res = intlMiddleware(req);

  // Skip all auth checks when using stubs for local development
  const useStubs = process.env.NEXT_PUBLIC_USE_STUBS === 'true';
  if (useStubs) {
    return res;
  }
  
  const supabase = createMiddlewareClient<Database>({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Auth protection for admin routes
  if (req.nextUrl.pathname.includes('/admin')) {
    // Skip middleware for admin-direct as it has its own client-side auth
    if (req.nextUrl.pathname.includes('/admin-direct')) {
      return res;
    }
    
    if (!session) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Try to find user by ID first, then by email as fallback
    let { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error) {
      // Fallback: try to find by email
      const { data: userByEmail, error: emailError } = await supabase
        .from('users')
        .select('role')
        .eq('email', session.user.email)
        .single();
      
      if (!emailError && userByEmail) {
        user = userByEmail;
        error = null;
      }
    }

    // Direct admin access for specific email - bypass database check entirely
    if (session.user.email === 'michaelvx@gmail.com') {
      return res; // Allow access immediately
    }
    
    // For other users, check database role
    if (error || user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Auth protection for account routes (but allow guest checkout)
  if (req.nextUrl.pathname.includes('/account')) {
    if (!session) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow guest checkout - no auth required for /checkout
  // Users can checkout as guests or optionally login

  return res;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
