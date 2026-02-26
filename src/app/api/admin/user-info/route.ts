import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const admin = getAdminClient();

    // Get organization info
    const { data: memberships } = await admin
      .from('organization_members')
      .select('organization_id, role, organizations(id, name)')
      .eq('user_id', user.id)
      .limit(1);

    const membership = memberships?.[0];

    // organizations can be an array or single object depending on the query
    const orgData = membership?.organizations;
    let orgName: string | undefined;
    if (Array.isArray(orgData)) {
      orgName = orgData[0]?.name;
    } else if (orgData && typeof orgData === 'object') {
      orgName = (orgData as { name?: string }).name;
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      organization: membership ? {
        id: membership.organization_id,
        name: orgName,
        role: membership.role
      } : null
    });
  } catch (e) {
    console.error('Error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
