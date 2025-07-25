'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { guestCheckoutSchema, GuestCheckout } from '@/lib/validations/checkout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { UserPlus, ShoppingCart, ArrowRight } from 'lucide-react';

interface GuestCheckoutFormProps {
  onGuestCheckout: (data: GuestCheckout) => void;
  onLoginRedirect: () => void;
  className?: string;
}

export function GuestCheckoutForm({
  onGuestCheckout,
  onLoginRedirect,
  className,
}: GuestCheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<GuestCheckout>({
    resolver: zodResolver(guestCheckoutSchema),
    defaultValues: {
      email: '',
      createAccount: false,
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const createAccount = watch('createAccount');

  const onSubmit = async (data: GuestCheckout) => {
    setIsSubmitting(true);
    try {
      onGuestCheckout(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-blue-600" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Complete Your Purchase
        </h2>
        <p className="mt-2 text-gray-600">
          Continue as a guest or create an account for faster future checkouts
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Guest Checkout */}
        <div className="rounded-lg border border-gray-200 p-6">
          <h3 className="flex items-center text-lg font-semibold text-gray-900">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Guest Checkout
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Quick checkout without creating an account
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="guest-email">Email Address *</Label>
              <Input
                id="guest-email"
                type="email"
                {...register('email')}
                placeholder="your.email@example.com"
                className={cn(errors.email && 'border-red-500')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                We'll send your order confirmation here
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="createAccount"
                checked={createAccount}
                onCheckedChange={(checked) => setValue('createAccount', checked as boolean)}
              />
              <Label htmlFor="createAccount" className="text-sm">
                Create an account for faster future checkouts
              </Label>
            </div>

            {createAccount && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="Choose a secure password"
                    className={cn(errors.password && 'border-red-500')}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    placeholder="Confirm your password"
                    className={cn(errors.confirmPassword && 'border-red-500')}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Continue to Shipping</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>
        </div>

        {/* Login Option */}
        <div className="rounded-lg border border-gray-200 p-6">
          <h3 className="flex items-center text-lg font-semibold text-gray-900">
            <UserPlus className="mr-2 h-5 w-5" />
            Already Have an Account?
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Sign in to access your saved addresses and faster checkout
          </p>

          <div className="mt-4 space-y-3">
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <div className="mr-2 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                Saved shipping addresses
              </li>
              <li className="flex items-center">
                <div className="mr-2 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                Order history and tracking
              </li>
              <li className="flex items-center">
                <div className="mr-2 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                Faster future checkouts
              </li>
              <li className="flex items-center">
                <div className="mr-2 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                Member-exclusive features
              </li>
            </ul>

            <Button
              type="button"
              variant="outline"
              onClick={onLoginRedirect}
              className="w-full"
            >
              Sign In to Your Account
            </Button>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <Alert>
        <AlertDescription>
          Your information is secure and protected. We never share your email with third parties.
          {createAccount && ' Creating an account is optional and can be done after your purchase.'}
        </AlertDescription>
      </Alert>
    </div>
  );
}