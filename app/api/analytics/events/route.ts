import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { successResponse, errorResponse, handleDatabaseError } from '@/lib/api/index';

// POST /api/analytics/events - Track analytics events
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const body = await req.json();

    const {
      eventType,
      userId,
      sessionId,
      properties = {},
      timestamp,
      ipAddress,
      userAgent,
      referrer,
      pageUrl,
    } = body;

    if (!eventType || !sessionId) {
      return errorResponse('Event type and session ID are required', 400);
    }

    // Get client IP if not provided
    const clientIP =
      ipAddress ||
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Insert analytics event
    const { error } = await supabase.from('analytics_events').insert({
      event_type: eventType,
      user_id: userId || null,
      session_id: sessionId,
      properties,
      timestamp: timestamp || new Date().toISOString(),
      ip_address: clientIP,
      user_agent: userAgent || req.headers.get('user-agent') || '',
      referrer: referrer || req.headers.get('referer') || '',
      page_url: pageUrl || '',
    });

    if (error) {
      throw error;
    }

    return successResponse({ message: 'Event tracked successfully' });
  } catch (error) {
    console.error('Analytics event tracking error:', error);
    return handleDatabaseError(error as Error);
  }
}

// GET /api/analytics/events - Get analytics events (admin only)
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { searchParams } = new URL(req.url);

    // Check if user is admin
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (user?.role !== 'admin') {
      return errorResponse('Admin access required', 403);
    }

    // Parse query parameters
    const eventType = searchParams.get('event_type');
    const userId = searchParams.get('user_id');
    const sessionId = searchParams.get('session_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const { data: events, error } = await query;

    if (error) {
      throw error;
    }

    // Get total count for pagination
    let countQuery = supabase.from('analytics_events').select('id', { count: 'exact', head: true });

    if (eventType) countQuery = countQuery.eq('event_type', eventType);
    if (userId) countQuery = countQuery.eq('user_id', userId);
    if (sessionId) countQuery = countQuery.eq('session_id', sessionId);
    if (startDate) countQuery = countQuery.gte('timestamp', startDate);
    if (endDate) countQuery = countQuery.lte('timestamp', endDate);

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error getting event count:', countError);
    }

    return successResponse({
      events: events || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics events:', error);
    return handleDatabaseError(error as Error);
  }
}
