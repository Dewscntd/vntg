import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { withAdmin } from '@/lib/api/middleware';
import { successResponse, handleServerError, handleDatabaseError } from '@/lib/api/index';

// GET /api/admin/users - Get all users (admin only)
export async function GET(req: NextRequest) {
  return withAdmin(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const { searchParams } = new URL(req.url);

      const limit = parseInt(searchParams.get('limit') || '25');
      const offset = parseInt(searchParams.get('offset') || '0');
      const role = searchParams.get('role');
      const search = searchParams.get('search');

      // Start building the query
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      // Apply filters
      if (role) {
        query = query.eq('role', role);
      }

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data: users, error, count } = await query;

      if (error) {
        throw error;
      }

      return successResponse({
        users: users || [],
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      });
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}

// PUT /api/admin/users/[id] - Update user role (admin only)
export async function PUT(req: NextRequest) {
  return withAdmin(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const body = await req.json();
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get('id');

      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
      }

      const { role } = body;

      if (!role || !['customer', 'admin'].includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Valid role is required (customer or admin)' },
          { status: 400 }
        );
      }

      // Update user role
      const { data: user, error } = await supabase
        .from('users')
        .update({
          role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return successResponse(user);
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}

// DELETE /api/admin/users/[id] - Delete user (admin only)
export async function DELETE(req: NextRequest) {
  return withAdmin(req, async (req, session) => {
    try {
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get('id');

      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
      }

      // Don't allow deleting self
      if (userId === session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete your own account' },
          { status: 400 }
        );
      }

      // Delete user (this will cascade to related records)
      const { error } = await supabase.from('users').delete().eq('id', userId);

      if (error) {
        throw error;
      }

      return successResponse({ message: 'User deleted successfully' });
    } catch (error) {
      return handleDatabaseError(error as Error);
    }
  });
}
