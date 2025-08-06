import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ProfileFormWrapper } from '@/components/auth/profile-form-wrapper';
import { createServerClient } from '@/lib/supabase/server';

// Force dynamic rendering for authentication-required pages
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Lock, Mail, Bell, Shield, Download, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Account Settings | VNTG',
  description: 'Manage your VNTG account settings and preferences',
};

export default async function AccountSettingsPage() {
  const supabase = createServerClient();

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, redirect to login
  if (!session) {
    redirect('/auth/login');
  }

  // Get the user profile data
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, avatar_url')
    .eq('id', session.user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/account/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileFormWrapper
                user={session.user}
                initialData={{
                  fullName: profile?.full_name || '',
                }}
              />
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Password & Security</span>
              </CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 font-medium">Change Password</h4>
                <p className="mb-4 text-sm text-gray-600">
                  To change your password, click the button below and follow the instructions sent
                  to your email.
                </p>
                <form
                  action={async () => {
                    'use server';
                    const supabase = createServerClient();
                    await supabase.auth.resetPasswordForEmail(session.user.email!, {
                      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
                    });
                  }}
                >
                  <Button type="submit" variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Password Reset Email
                  </Button>
                </form>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 font-medium">Two-Factor Authentication</h4>
                <p className="mb-4 text-sm text-gray-600">
                  Add an extra layer of security to your account.
                </p>
                <Button variant="outline" disabled>
                  <Shield className="mr-2 h-4 w-4" />
                  Enable 2FA (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Email Preferences</span>
              </CardTitle>
              <CardDescription>Choose what email notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order Updates</p>
                    <p className="text-sm text-gray-600">Get notified about order status changes</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-gray-600">
                      Receive promotional offers and product updates
                    </p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Security Alerts</p>
                    <p className="text-sm text-gray-600">Important security notifications</p>
                  </div>
                  <input type="checkbox" defaultChecked disabled className="rounded" />
                </div>
              </div>

              <Button variant="outline" className="mt-4">
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Data & Privacy</span>
              </CardTitle>
              <CardDescription>Manage your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 font-medium">Export Your Data</h4>
                <p className="mb-4 text-sm text-gray-600">
                  Download a copy of all your account data including orders, profile information,
                  and preferences.
                </p>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Request Data Export
                </Button>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 font-medium text-red-600">Delete Account</h4>
                <p className="mb-4 text-sm text-gray-600">
                  Permanently delete your account and all associated data. This action cannot be
                  undone.
                </p>
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View your account details and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600">Account ID</p>
                  <p className="font-mono text-sm">{session.user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{session.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Created</p>
                  <p className="font-medium">
                    {new Date(session.user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Sign In</p>
                  <p className="font-medium">
                    {session.user.last_sign_in_at
                      ? new Date(session.user.last_sign_in_at).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
