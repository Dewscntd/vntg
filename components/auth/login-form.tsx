'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { LoginFormValues, loginSchema } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

function LoginFormContent() {
  const t = useTranslations('auth');
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    console.log('🔥 LOGIN FORM: onSubmit called with:', data);
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔥 LOGIN FORM: calling signIn method');
      const { error } = await signIn(data.email, data.password);
      console.log('🔥 LOGIN FORM: signIn response:', { error });

      if (error) {
        console.log('🔥 LOGIN FORM: Login failed with error:', error.message);
        setError(error.message);
        return;
      }

      console.log('🔥 LOGIN FORM: Login successful! Attempting redirect...');

      // Check for redirect URL parameter
      const redirectTo = searchParams.get('redirectTo') || searchParams.get('redirect');

      console.log('🔥 LOGIN FORM: Redirect URL:', redirectTo);

      if (redirectTo) {
        console.log('🔥 LOGIN FORM: Redirecting to:', redirectTo);
        router.push(redirectTo);
      } else {
        console.log('🔥 LOGIN FORM: Redirecting to home page');
        router.push('/');
      }
      router.refresh();
    } catch (error) {
      setError(t('unexpectedError'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{t('loginTitle')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('loginSubtitle')}</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('emailPlaceholder')}
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('password')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('passwordPlaceholder')}
                    type="password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between">
            <Link
              href="/auth/reset-password"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              {t('forgotPassword')}
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('loggingIn') : t('loginButton')}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        {t('noAccount')}{' '}
        <Link href="/auth/register" className="text-primary underline-offset-4 hover:underline">
          {t('register')}
        </Link>
      </div>
    </div>
  );
}

export function LoginForm() {
  const t = useTranslations('auth');

  return (
    <Suspense fallback={<div>{t('loading')}</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
