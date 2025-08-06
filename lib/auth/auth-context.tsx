'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (
    email: string,
    password: string
  ) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null };
  }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null };
  }>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const getSession = async () => {
      if (!mounted) return;

      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      router.refresh();
    });

    getSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const supabase = createClient();
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return response;
  };

  const signIn = async (email: string, password: string) => {
    console.log('🎯 AUTH CONTEXT: signIn called with:', { email, password });
    const supabase = createClient();
    console.log('🎯 AUTH CONTEXT: supabase client created');
    console.log('🎯 AUTH CONTEXT: supabase.auth:', supabase.auth);
    console.log(
      '🎯 AUTH CONTEXT: supabase.auth.signInWithPassword:',
      typeof supabase.auth.signInWithPassword
    );
    console.log(
      '🎯 AUTH CONTEXT: signInWithPassword function:',
      supabase.auth.signInWithPassword.toString().substring(0, 200)
    );
    console.log('🎯 AUTH CONTEXT: calling supabase.auth.signInWithPassword');
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('🎯 AUTH CONTEXT: signInWithPassword response:', response);
    console.log('🎯 AUTH CONTEXT: error details:', response.error);
    console.log('🎯 AUTH CONTEXT: data details:', response.data);

    // Update auth state immediately on successful login
    if (!response.error && response.data?.user && response.data?.session) {
      console.log('🎯 AUTH CONTEXT: Updating user and session state');
      setUser(response.data.user);
      setSession(response.data.session);
    }

    return response;
  };

  const signInWithGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signInWithGithub = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signInWithFacebook = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const resetPassword = async (email: string) => {
    const supabase = createClient();
    const response = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return response;
  };

  const updatePassword = async (password: string) => {
    const supabase = createClient();
    const response = await supabase.auth.updateUser({
      password,
    });
    return response;
  };

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signInWithFacebook,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
