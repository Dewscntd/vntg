import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    console.log('🎯 PROFILE API: GET called');
    const supabase = createServerClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log('🎯 PROFILE API: Session:', session);
    console.log('🎯 PROFILE API: Session error:', sessionError);

    if (sessionError || !session) {
      console.log('🎯 PROFILE API: No session, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile from users table
    console.log('🎯 PROFILE API: Querying users table for ID:', session.user.id);
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    console.log('🎯 PROFILE API: User profile result:', userProfile);
    console.log('🎯 PROFILE API: Profile error:', profileError);

    if (profileError) {
      // If user profile doesn't exist, create one
      // Check if this is the admin email and preserve admin role
      const userRole = session.user.email === 'michaelvx@gmail.com' ? 'admin' : 'customer';

      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email || '',
          role: userRole,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
      }

      return NextResponse.json({
        user: {
          id: session.user.id,
          email: session.user.email,
          ...newProfile,
        },
      });
    }

    const response = {
      user: {
        id: session.user.id,
        email: session.user.email,
        ...userProfile,
      },
    };

    console.log('🎯 PROFILE API: Final response being sent:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createServerClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, avatar_url } = body;

    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({
        full_name,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        ...updatedProfile,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
