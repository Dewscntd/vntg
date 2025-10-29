import { Metadata } from 'next';
import Link from 'next/link';
import { UpdatePasswordForm } from '@/components/auth/update-password-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Update Password | Peakees',
  description: 'Update your Peakees account password',
};

export default function UpdatePasswordPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/auth/login" className="absolute left-4 top-4 md:left-8 md:top-8">
        <span className="text-lg font-bold">← Back to Login</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Update Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password to update your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdatePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
