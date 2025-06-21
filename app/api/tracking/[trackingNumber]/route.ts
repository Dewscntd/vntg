import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { trackingService } from '@/lib/shipping/carriers';
import { 
  successResponse, 
  errorResponse,
  handleDatabaseError 
} from '@/lib/api/index';

// GET /api/tracking/[trackingNumber] - Get tracking information
export async function GET(
  req: NextRequest,
  { params }: { params: { trackingNumber: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const trackingNumber = params.trackingNumber;
    const { searchParams } = new URL(req.url);
    const carrier = searchParams.get('carrier');

    if (!trackingNumber) {
      return errorResponse('Tracking number is required', 400);
    }

    // First, check if we have this shipment in our database
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select(`
        *,
        tracking_events (
          timestamp,
          status,
          description,
          location,
          city,
          state,
          country
        )
      `)
      .eq('tracking_number', trackingNumber)
      .single();

    if (shipmentError && shipmentError.code !== 'PGRST116') {
      throw shipmentError;
    }

    let trackingInfo;

    if (shipment) {
      // We have the shipment in our database, return our data
      trackingInfo = {
        trackingNumber: shipment.tracking_number,
        carrier: shipment.carrier,
        status: shipment.status,
        estimatedDelivery: shipment.estimated_delivery,
        actualDelivery: shipment.actual_delivery,
        events: shipment.tracking_events?.map(event => ({
          timestamp: event.timestamp,
          status: event.status,
          description: event.description,
          location: event.location,
          city: event.city,
          state: event.state,
          country: event.country,
        })) || [],
        lastUpdated: shipment.updated_at,
      };

      // Also try to get fresh data from carrier and update if needed
      try {
        const freshData = await trackingService.trackPackage(trackingNumber, carrier || shipment.carrier);
        
        // Update our database with fresh data if it's newer
        if (new Date(freshData.lastUpdated) > new Date(shipment.updated_at)) {
          await updateShipmentData(supabase, shipment.id, freshData);
          trackingInfo = freshData;
        }
      } catch (carrierError) {
        console.warn('Failed to get fresh tracking data from carrier:', carrierError);
        // Continue with database data
      }
    } else {
      // We don't have this shipment, try to get data from carrier
      try {
        trackingInfo = await trackingService.trackPackage(trackingNumber, carrier || undefined);
      } catch (carrierError) {
        return errorResponse('Tracking information not found', 404);
      }
    }

    return successResponse(trackingInfo);

  } catch (error) {
    console.error('Tracking lookup error:', error);
    return handleDatabaseError(error);
  }
}

// Helper function to update shipment data
async function updateShipmentData(supabase: any, shipmentId: string, trackingInfo: any) {
  try {
    // Update shipment
    await supabase
      .from('shipments')
      .update({
        status: trackingInfo.status,
        estimated_delivery: trackingInfo.estimatedDelivery,
        actual_delivery: trackingInfo.actualDelivery,
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipmentId);

    // Insert new tracking events
    for (const event of trackingInfo.events) {
      await supabase
        .from('tracking_events')
        .upsert({
          shipment_id: shipmentId,
          timestamp: event.timestamp,
          status: event.status,
          description: event.description,
          location: event.location,
          city: event.city,
          state: event.state,
          country: event.country,
        }, {
          onConflict: 'shipment_id,timestamp,status',
          ignoreDuplicates: true,
        });
    }
  } catch (error) {
    console.error('Error updating shipment data:', error);
  }
}
