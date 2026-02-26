import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - List all members in the user's organization
export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getAdminClient();

    // Get user's organization
    const { data: memberships } = await admin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1);

    const membership = memberships?.[0];
    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Get all members in the organization
    const { data: orgMembers, error } = await admin
      .from('organization_members')
      .select(`
        user_id,
        role,
        profiles:user_id(id, name, email, role, avatar_url)
      `)
      .eq('organization_id', membership.organization_id);

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the data
    const members = (orgMembers || []).map(m => ({
      id: m.user_id,
      name: (m.profiles as { name?: string })?.name || 'Unknown',
      email: (m.profiles as { email?: string })?.email || '',
      role: (m.profiles as { role?: string })?.role || 'member',
      orgRole: m.role,
      avatarUrl: (m.profiles as { avatar_url?: string })?.avatar_url
    }));

    return NextResponse.json({ members, organizationId: membership.organization_id });
  } catch (e) {
    console.error('GET /api/members error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
