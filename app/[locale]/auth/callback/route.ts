import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any });

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // Get the user from the newly created session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If we have a user, check if they already have a profile
    if (session?.user) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single();

      // If the user doesn't have a profile, create one
      if (!existingUser) {
        await supabase.from('users').insert({
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          avatar_url: session.user.user_metadata?.avatar_url,
          role: 'customer',
        });
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}
