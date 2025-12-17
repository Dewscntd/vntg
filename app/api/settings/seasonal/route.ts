import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// GET /api/settings/seasonal - Get active season
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });

    // Get the active season setting
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'active_season')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      console.error('Error fetching active season:', error);
      return NextResponse.json({ error: 'Failed to fetch active season' }, { status: 500 });
    }

    // Parse the season data
    const seasonData = data?.value as { season: string; year: number } | null;

    return NextResponse.json({
      success: true,
      data: {
        season: seasonData
          ? {
              season: seasonData.season,
              year: seasonData.year,
              updatedAt: data?.updated_at,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/settings/seasonal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/settings/seasonal - Update active season (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });

    // Check if user is authenticated and is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { season, year } = body;

    // Validate input
    const validSeasons = ['spring-summer', 'fall-winter', 'all-season'];
    if (!season || !validSeasons.includes(season)) {
      return NextResponse.json({ error: 'Invalid season value' }, { status: 400 });
    }

    if (!year || typeof year !== 'number' || year < 1900 || year > 2100) {
      return NextResponse.json({ error: 'Invalid year value' }, { status: 400 });
    }

    // Update or insert the active season setting
    const { data, error } = await supabase
      .from('site_settings')
      .upsert(
        {
          key: 'active_season',
          value: { season, year },
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'key',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating active season:', error);
      return NextResponse.json({ error: 'Failed to update active season' }, { status: 500 });
    }

    const seasonData = data.value as { season: string; year: number };

    return NextResponse.json({
      success: true,
      data: {
        season: {
          season: seasonData.season,
          year: seasonData.year,
          updatedAt: data.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('Error in POST /api/settings/seasonal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
