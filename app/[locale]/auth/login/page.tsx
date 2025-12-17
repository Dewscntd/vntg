import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/components/auth/login-form';
import { SocialButtons } from '@/components/auth/social-buttons';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');

  return {
    title: `${t('login')} | Peakees`,
    description: t('loginTitle'),
  };
}

export default async function LoginPage() {
  const t = await getTranslations('auth');

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8">
        <span className="text-lg font-bold">{t('back')}</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t('login')}</CardTitle>
          <CardDescription className="text-center">{t('loginSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex flex-col">
          <SocialButtons />
        </CardFooter>
      </Card>
    </div>
  );
}
