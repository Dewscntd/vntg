'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCheckout } from '@/lib/context/checkout-context';
import { useAuth } from '@/lib/auth/auth-context';
import { shippingAddressSchema, ShippingAddress } from '@/lib/validations/checkout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { MemberBenefitsBanner } from './member-benefits-banner';
import { Truck, Clock, Zap } from 'lucide-react';

interface ShippingFormProps {
  onNext: () => void;
  className?: string;
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  // Add more states as needed
];

// Israeli districts for address validation
const ISRAELI_DISTRICTS = [
  { value: 'jerusalem', label: 'Jerusalem District' },
  { value: 'northern', label: 'Northern District' },
  { value: 'haifa', label: 'Haifa District' },
  { value: 'central', label: 'Central District' },
  { value: 'tel-aviv', label: 'Tel Aviv District' },
  { value: 'southern', label: 'Southern District' },
  { value: 'judea-samaria', label: 'Judea and Samaria Area' },
];

export function ShippingForm({ onNext, className }: ShippingFormProps) {
  const { session } = useAuth();
  const { setShippingAddress, shippingAddress, isLoading } = useCheckout();
  const [saveAddress, setSaveAddress] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ShippingAddress>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: shippingAddress || {
      firstName: '',
      lastName: '',
      email: session?.user?.email || '',
      phone: '',
      address: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
    mode: 'onChange',
  });

  const selectedCountry = watch('country');
  const isIsrael = selectedCountry === 'IL';

  const onSubmit = async (data: ShippingAddress) => {
    try {
      setShippingAddress(data);

      // Save address to user profile if requested
      if (saveAddress && session) {
        await fetch('/api/user/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            type: 'shipping',
            isDefault: true,
          }),
        });
      }

      onNext();
    } catch (error) {
      console.error('Error saving shipping address:', error);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Shipping Information</h2>
        <p className="text-sm text-gray-600">Please provide your shipping details for delivery.</p>
      </div>

      {/* Show member benefits banner for guests */}
      {!session && (
        <MemberBenefitsBanner 
          onCreateAccount={() => window.open('/auth/signup?redirect=/checkout', '_blank')}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              className={cn(errors.firstName && 'border-red-500')}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              className={cn(errors.lastName && 'border-red-500')}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className={cn(errors.email && 'border-red-500')}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            className={cn(errors.phone && 'border-red-500')}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>

        {/* Address Information */}
        <div className="border-t pt-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Address</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                {...register('address')}
                className={cn(errors.address && 'border-red-500')}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address2">Apartment, suite, etc. (optional)</Label>
              <Input
                id="address2"
                {...register('address2')}
                className={cn(errors.address2 && 'border-red-500')}
              />
              {errors.address2 && (
                <p className="mt-1 text-sm text-red-600">{errors.address2.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  {...register('city')}
                  className={cn(errors.city && 'border-red-500')}
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
              </div>

              <div>
                <Label htmlFor="state">{isIsrael ? 'District *' : 'State *'}</Label>
                <Select
                  onValueChange={(value) => setValue('state', value)}
                  defaultValue={watch('state')}
                >
                  <SelectTrigger className={cn(errors.state && 'border-red-500')}>
                    <SelectValue placeholder={isIsrael ? 'Select district' : 'Select state'} />
                  </SelectTrigger>
                  <SelectContent>
                    {(isIsrael ? ISRAELI_DISTRICTS : US_STATES).map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="zipCode">{isIsrael ? 'Postal Code *' : 'ZIP Code *'}</Label>
                <Input
                  id="zipCode"
                  {...register('zipCode')}
                  placeholder={isIsrael ? 'e.g. 1234567' : 'e.g. 12345'}
                  className={cn(errors.zipCode && 'border-red-500')}
                />
                {errors.zipCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="country">Country *</Label>
              <Select
                onValueChange={(value) => setValue('country', value)}
                defaultValue={watch('country')}
              >
                <SelectTrigger className={cn(errors.country && 'border-red-500')}>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IL">🇮🇱 Israel</SelectItem>
                  <SelectItem value="US">🇺🇸 United States</SelectItem>
                  <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                  <SelectItem value="MX">🇲🇽 Mexico</SelectItem>
                  <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                  <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                  <SelectItem value="FR">🇫🇷 France</SelectItem>
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Method Selection */}
        <div>
          <Label className="mb-4 block text-base font-medium text-gray-900">Shipping Method</Label>
          <div className="space-y-3">
            <ShippingMethodSelector />
          </div>
        </div>

        {/* Save Address Option */}
        {session && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="saveAddress"
              checked={saveAddress}
              onCheckedChange={(checked) => setSaveAddress(checked as boolean)}
            />
            <Label htmlFor="saveAddress" className="text-sm">
              Save this address to my account for future orders
            </Label>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={!isValid || isLoading} className="min-w-[120px]">
            {isLoading ? 'Saving...' : 'Continue to Payment'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Shipping Method Selector Component
function ShippingMethodSelector() {
  const { selectedShippingMethod, setShippingMethod, availableShippingMethods } = useCheckout();

  const shippingMethodsWithIcons = availableShippingMethods.map((method) => ({
    ...method,
    icon: method.id === 'standard' ? Truck : method.id === 'express' ? Clock : Zap,
  }));

  return (
    <div className="space-y-3">
      {shippingMethodsWithIcons.map((method) => {
        const isSelected = selectedShippingMethod?.id === method.id;
        const Icon = method.icon;

        return (
          <div
            key={method.id}
            className={cn('relative flex cursor-pointer rounded-lg border p-4 focus:outline-none', {
              'border-blue-600 ring-2 ring-blue-600': isSelected,
              'border-gray-300': !isSelected,
            })}
            onClick={() => setShippingMethod(method)}
          >
            <div className="flex h-5 items-center">
              <input
                type="radio"
                name="shipping-method"
                value={method.id}
                checked={isSelected}
                onChange={() => setShippingMethod(method)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
              />
            </div>
            <div className="ml-3 flex flex-1 items-center justify-between">
              <div className="flex items-center">
                <Icon className="mr-3 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{method.name}</p>
                  <p className="text-sm text-gray-500">{method.description}</p>
                  <p className="text-xs text-gray-500">
                    Estimated delivery: {method.estimatedDays} business day
                    {method.estimatedDays > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {method.price === 0 ? 'Free' : `$${method.price.toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
