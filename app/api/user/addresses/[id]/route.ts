import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { withAuth, withValidation } from '@/lib/api/middleware';
import {
  successResponse,
  errorResponse,
  handleDatabaseError,
  handleNotFound,
} from '@/lib/api/index';
import { z } from 'zod';

const addressSchema = z.object({
  type: z.enum(['shipping', 'billing']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// PUT /api/user/addresses/[id] - Update an address
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(req, (req, session) =>
    withValidation(req, addressSchema, async (req, validData) => {
      try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const userId = session.user.id;
        const addressId = params.id;

        // Verify the address belongs to the user
        const { data: existingAddress, error: fetchError } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('id', addressId)
          .eq('user_id', userId)
          .single();

        if (fetchError || !existingAddress) {
          return handleNotFound('Address not found');
        }

        // If this is set as default, unset other defaults of the same type
        if (validData.isDefault) {
          await supabase
            .from('user_addresses')
            .update({ is_default: false })
            .eq('user_id', userId)
            .eq('type', validData.type)
            .neq('id', addressId);
        }

        // Update the address
        const { data: address, error } = await supabase
          .from('user_addresses')
          .update({
            type: validData.type,
            first_name: validData.firstName,
            last_name: validData.lastName,
            address: validData.address,
            address2: validData.address2,
            city: validData.city,
            state: validData.state,
            zip_code: validData.zipCode,
            country: validData.country,
            phone: validData.phone,
            is_default: validData.isDefault,
          })
          .eq('id', addressId)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Transform response
        const transformedAddress = {
          id: address.id,
          type: address.type,
          firstName: address.first_name,
          lastName: address.last_name,
          address: address.address,
          address2: address.address2,
          city: address.city,
          state: address.state,
          zipCode: address.zip_code,
          country: address.country,
          phone: address.phone,
          isDefault: address.is_default,
          created_at: address.created_at,
        };

        return successResponse(transformedAddress);
      } catch (error) {
        console.error('Error updating address:', error);
        return handleDatabaseError(error as Error);
      }
    })
  );
}

// DELETE /api/user/addresses/[id] - Delete an address
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const userId = session.user.id;
      const addressId = params.id;

      // Verify the address belongs to the user
      const { data: existingAddress, error: fetchError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('id', addressId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !existingAddress) {
        return handleNotFound('Address not found');
      }

      // Delete the address
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return successResponse({ message: 'Address deleted successfully' });
    } catch (error) {
      console.error('Error deleting address:', error);
      return handleDatabaseError(error as Error);
    }
  });
}
