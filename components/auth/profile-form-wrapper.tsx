'use client';

import dynamic from 'next/dynamic';
import { User } from '@supabase/supabase-js';

// Dynamically import ProfileForm to ensure it only renders on client-side
const ProfileForm = dynamic(
  () => import('./profile-form').then((mod) => ({ default: mod.ProfileForm })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-1/4 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
        <div className="h-10 w-1/3 rounded bg-gray-200"></div>
      </div>
    ),
  }
);

interface ProfileFormWrapperProps {
  user: User;
  initialData?: {
    fullName: string;
  };
}

export function ProfileFormWrapper({ user, initialData }: ProfileFormWrapperProps) {
  return <ProfileForm user={user} initialData={initialData} />;
}
