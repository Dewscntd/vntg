'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DebugAuthPage() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log('Session data:', session);
      console.log('Session error:', sessionError);

      setSession(session);

      if (sessionError) {
        setError('Session error: ' + sessionError.message);
      } else if (!session) {
        setError('No active session found');
      } else {
        // Try to get user from database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single();

        console.log('User data:', userData);
        console.log('User error:', userError);

        setUser(userData);
        if (userError && userError.code !== 'PGRST116') {
          setError('User lookup error: ' + userError.message);
        }
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setError('Unexpected error: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    window.location.href = '/auth/login';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold">Authentication Debug</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {session ? (
              <div className="space-y-2">
                <div>
                  <strong>Status:</strong> <span className="text-green-600">Logged In</span>
                </div>
                <div>
                  <strong>Email:</strong> {session.user?.email}
                </div>
                <div>
                  <strong>User ID:</strong> <code className="text-xs">{session.user?.id}</code>
                </div>
                <div>
                  <strong>Provider:</strong> {session.user?.app_metadata?.provider}
                </div>
                <div>
                  <strong>Created:</strong> {new Date(session.user?.created_at).toLocaleString()}
                </div>
                <Button onClick={handleLogout} variant="outline">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <strong>Status:</strong> <span className="text-red-600">Not Logged In</span>
                </div>
                <Button onClick={handleLogin}>Go to Login</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database User Record</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <div className="space-y-2">
                <div>
                  <strong>Database Status:</strong> <span className="text-green-600">Found</span>
                </div>
                <div>
                  <strong>Role:</strong> {user.role || 'No role set'}
                </div>
                <div>
                  <strong>Full Name:</strong> {user.full_name || 'Not set'}
                </div>
                <div>
                  <strong>Created:</strong> {new Date(user.created_at).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <strong>Database Status:</strong> <span className="text-red-600">Not Found</span>
                </div>
                <div>User record may need to be created in the database.</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error Details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-red-600">{error}</pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Admin Access Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {session?.user?.email === 'michaelvx@gmail.com' ? (
            <div className="space-y-2">
              <div className="font-semibold text-green-600">✅ Admin email verified</div>
              <div className="space-x-2">
                <Button asChild>
                  <Link href="/admin-direct">Access Admin Panel</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/admin">Try Regular Admin</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-red-600">❌ Admin access requires michaelvx@gmail.com</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/register">Register</Link>
            </Button>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
