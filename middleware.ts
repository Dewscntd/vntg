import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Auth protection for admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Skip middleware for admin-direct as it has its own client-side auth
    if (req.nextUrl.pathname === '/admin-direct') {
      return res;
    }
    
    // Debug logging for session
    console.log('Admin route accessed:', {
      path: req.nextUrl.pathname,
      hasSession: !!session,
      userEmail: session?.user?.email,
      userId: session?.user?.id
    });
    
    if (!session) {
      console.log('No session found, redirecting to login');
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

    // Debug logging
    console.log('Admin check:', {
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: user?.role,
      error: error,
      path: req.nextUrl.pathname
    });

    // Temporary bypass for debugging - allow specific admin email
    if (session.user.email === 'michaelvx@gmail.com') {
      console.log('Temporary admin bypass for:', session.user.email);
      // Continue to admin panel
    } else if (error || user?.role !== 'admin') {
      console.log('Access denied - redirecting to home');
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    console.log('Admin access granted for:', session.user.email);
  }

  // Auth protection for account routes (but allow guest checkout)
  if (req.nextUrl.pathname.startsWith('/account')) {
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
  matcher: ['/admin/:path*', '/account/:path*'],
};
