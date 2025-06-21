'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from '@supabase/supabase-js';

import { useAuth } from '@/lib/auth/auth-context';
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
import { createClient } from '@/lib/supabase/client';

const profileSchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: User;
  initialData?: {
    fullName: string;
  };
}

export function ProfileForm({ user, initialData }: ProfileFormProps) {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const supabase = createClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      email: user.email || '',
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    if (!session) return;
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Update user profile in the database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: data.fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        setError('Failed to update profile. Please try again.');
        console.error(updateError);
        return;
      }

      setSuccessMessage('Profile updated successfully.');
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}-${Math.random()}.${fileExt}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        setError('Error uploading avatar. Please try again.');
        console.error(uploadError);
        return;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      if (urlData) {
        // Update the user profile with the new avatar URL
        const { error: updateError } = await supabase
          .from('users')
          .update({
            avatar_url: urlData.publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          setError('Error updating profile with new avatar. Please try again.');
          console.error(updateError);
          return;
        }

        setAvatarUrl(urlData.publicUrl);
        setSuccessMessage('Avatar updated successfully.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Update your account information
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-500">
          {successMessage}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <FormLabel>Avatar</FormLabel>
          <div className="mt-1 flex items-center space-x-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full">
              <img
                src={avatarUrl || user.user_metadata?.avatar_url || 'https://avatars.githubusercontent.com/u/124599?v=4'}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isLoading}
              className="max-w-xs"
            />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@example.com"
                      type="email"
                      disabled={true} // Email can't be changed directly
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
