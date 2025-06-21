import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { withAuth, withValidation } from '@/lib/api/middleware';
import { 
  successResponse, 
  errorResponse,
  handleDatabaseError 
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

// GET /api/user/addresses - Get user's addresses
export async function GET(req: NextRequest) {
  return withAuth(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const userId = session.user.id;

      const { data: addresses, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform database fields to match frontend expectations
      const transformedAddresses = addresses?.map(addr => ({
        id: addr.id,
        type: addr.type,
        firstName: addr.first_name,
        lastName: addr.last_name,
        address: addr.address,
        address2: addr.address2,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zip_code,
        country: addr.country,
        phone: addr.phone,
        isDefault: addr.is_default,
        created_at: addr.created_at,
      })) || [];

      return successResponse({
        addresses: transformedAddresses,
      });

    } catch (error) {
      console.error('Error fetching addresses:', error);
      return handleDatabaseError(error);
    }
  });
}

// POST /api/user/addresses - Create a new address
export async function POST(req: NextRequest) {
  return withAuth(req, (req, session) => 
    withValidation(req, addressSchema, async (req, validData) => {
      try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const userId = session.user.id;

        // If this is set as default, unset other defaults of the same type
        if (validData.isDefault) {
          await supabase
            .from('user_addresses')
            .update({ is_default: false })
            .eq('user_id', userId)
            .eq('type', validData.type);
        }

        // Create the new address
        const { data: address, error } = await supabase
          .from('user_addresses')
          .insert({
            user_id: userId,
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

        return successResponse(transformedAddress, 201);

      } catch (error) {
        console.error('Error creating address:', error);
        return handleDatabaseError(error);
      }
    })
  );
}
