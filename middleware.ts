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
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
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
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  // Allow guest checkout - no auth required for /checkout
  // Users can checkout as guests or optionally login

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
