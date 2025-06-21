'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      router.push('/auth/login');
    }

    // If admin only and user is not an admin, redirect to home
    if (adminOnly && user && user.user_metadata?.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router, adminOnly]);

  // Show nothing while loading or if not authenticated
  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  // If admin only and user is not an admin, show nothing
  if (adminOnly && user.user_metadata?.role !== 'admin') {
    return null;
  }

  // If authenticated (and admin if required), show children
  return <>{children}</>;
}
