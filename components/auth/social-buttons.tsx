'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';

export function SocialButtons() {
  const { signInWithGoogle, signInWithGithub, signInWithFacebook } = useAuth();
  const [isLoading, setIsLoading] = useState<{
    google: boolean;
    github: boolean;
    facebook: boolean;
  }>({
    google: false,
    github: false,
    facebook: false,
  });

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, google: true }));
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setIsLoading((prev) => ({ ...prev, google: false }));
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, github: true }));
      await signInWithGithub();
    } catch (error) {
      console.error('GitHub sign in error:', error);
    } finally {
      setIsLoading((prev) => ({ ...prev, github: false }));
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, facebook: true }));
      await signInWithFacebook();
    } catch (error) {
      console.error('Facebook sign in error:', error);
    } finally {
      setIsLoading((prev) => ({ ...prev, facebook: false }));
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading.google}
        onClick={handleGoogleSignIn}
        className="flex items-center justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="h-5 w-5"
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {isLoading.google ? 'Signing in...' : 'Sign in with Google'}
      </Button>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading.github}
        onClick={handleGithubSignIn}
        className="flex items-center justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="h-5 w-5"
        >
          <path
            fill="currentColor"
            d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"
          />
        </svg>
        {isLoading.github ? 'Signing in...' : 'Sign in with GitHub'}
      </Button>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading.facebook}
        onClick={handleFacebookSignIn}
        className="flex items-center justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="h-5 w-5"
        >
          <path
            fill="#1877F2"
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
          />
        </svg>
        {isLoading.facebook ? 'Signing in...' : 'Sign in with Facebook'}
      </Button>
    </div>
  );
}
