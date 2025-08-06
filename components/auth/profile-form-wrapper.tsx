'use client';

import dynamic from 'next/dynamic';
import { User } from '@supabase/supabase-js';

// Dynamically import ProfileForm to ensure it only renders on client-side
const ProfileForm = dynamic(() => import('./profile-form').then(mod => ({ default: mod.ProfileForm })), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded w-1/3"></div>
    </div>
  ),
});

interface ProfileFormWrapperProps {
  user: User;
  initialData?: {
    fullName: string;
  };
}

export function ProfileFormWrapper({ user, initialData }: ProfileFormWrapperProps) {
  return <ProfileForm user={user} initialData={initialData} />;
}