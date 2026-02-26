import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const admin = getAdminClient();

    // Find user
    const { data: users } = await admin.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Found user:', user.id, user.email);

    // Check organization
    const { data: membership, error: memError } = await admin
      .from('organization_members')
      .select('*')
      .eq('user_id', user.id);

    console.log('Membership:', membership, memError);

    if (!membership || membership.length === 0) {
      // Create organization
      const slug = 'org-' + user.id.slice(0, 8);
      const { data: org, error: orgError } = await admin
        .from('organizations')
        .insert({
          name: (user.user_metadata?.name || 'Test') + "'s Org",
          slug,
          owner_id: user.id
        })
        .select()
        .single();

      console.log('Created org:', org, orgError);

      if (org) {
        // Add membership
        const { error: addMemError } = await admin
          .from('organization_members')
          .insert({
            organization_id: org.id,
            user_id: user.id,
            role: 'owner'
          });

        console.log('Added membership:', addMemError);

        // Update/create profile
        const { error: profileError } = await admin
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'Test User',
            organization_id: org.id,
            onboarding_complete: true
          });

        console.log('Updated profile:', profileError);

        return NextResponse.json({
          success: true,
          organization: org,
          message: 'Created organization and linked user'
        });
      }
    } else {
      // User has membership, just update profile
      const { error: profileError } = await admin
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || 'Test User',
          organization_id: membership[0].organization_id,
          onboarding_complete: true
        });

      return NextResponse.json({
        success: true,
        organization_id: membership[0].organization_id,
        message: 'Updated profile with existing organization'
      });
    }

    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  } catch (e) {
    console.error('Fix user error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
