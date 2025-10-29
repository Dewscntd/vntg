import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { withAuth } from '@/lib/api/middleware';
import { successResponse, handleDatabaseError, handleNotFound } from '@/lib/api/index';

// POST /api/user/addresses/[id]/default - Set address as default
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const userId = session.user.id;
      const addressId = params.id;

      // Verify the address belongs to the user and get its type
      const { data: existingAddress, error: fetchError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('id', addressId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !existingAddress) {
        return handleNotFound('Address not found');
      }

      // Unset other defaults of the same type
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('type', existingAddress.type)
        .neq('id', addressId);

      // Set this address as default
      const { data: address, error } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
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
      console.error('Error setting default address:', error);
      return handleDatabaseError(error as Error);
    }
  });
}
