import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { withAuth } from '@/lib/api/middleware';
import { 
  successResponse, 
  errorResponse,
  handleDatabaseError 
} from '@/lib/api/index';

// GET /api/analytics/metrics - Get analytics metrics (admin only)
export async function GET(req: NextRequest) {
  return withAuth(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const { searchParams } = new URL(req.url);
      
      // Check if user is admin
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (user?.role !== 'admin') {
        return errorResponse('Admin access required', 403);
      }

      const startDate = searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = searchParams.get('end') || new Date().toISOString();

      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });

      // Get active users (users with events in the period)
      const { count: activeUsers } = await supabase
        .from('analytics_events')
        .select('user_id', { count: 'exact', head: true })
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .not('user_id', 'is', null);

      // Get total sessions
      const { data: sessionData } = await supabase
        .from('analytics_events')
        .select('session_id')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .eq('event_type', 'session_start');

      const totalSessions = new Set(sessionData?.map(s => s.session_id)).size;

      // Get orders data for revenue and conversion metrics
      const { data: orders } = await supabase
        .from('orders')
        .select('total, status, user_id, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const completedOrders = orders?.filter(o => o.status === 'delivered') || [];
      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
      const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

      // Calculate conversion rate (orders / sessions)
      const conversionRate = totalSessions > 0 ? (completedOrders.length / totalSessions) * 100 : 0;

      // Calculate bounce rate (sessions with only one page view)
      const { data: bounceData } = await supabase
        .rpc('calculate_bounce_rate', {
          start_date: startDate,
          end_date: endDate
        });

      const bounceRate = bounceData || 0;

      // Calculate average session duration
      const { data: sessionDurationData } = await supabase
        .rpc('calculate_avg_session_duration', {
          start_date: startDate,
          end_date: endDate
        });

      const averageSessionDuration = sessionDurationData || 0;

      const metrics = {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalSessions,
        averageSessionDuration,
        bounceRate,
        conversionRate,
        totalRevenue,
        averageOrderValue,
      };

      return successResponse(metrics);

    } catch (error) {
      console.error('Error fetching analytics metrics:', error);
      return handleDatabaseError(error);
    }
  });
}
