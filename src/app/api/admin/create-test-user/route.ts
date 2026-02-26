import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST() {
  try {
    const admin = getAdminClient();

    const testEmail = 'admin@test.local';
    const testPassword = 'admin123456';

    // Check if user exists
    const { data: existingUsers } = await admin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === testEmail);

    if (existing) {
      // Update password and confirm email
      await admin.auth.admin.updateUserById(existing.id, {
        password: testPassword,
        email_confirm: true
      });

      // Make sure they have an org
      const { data: membership } = await admin
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', existing.id)
        .single();

      if (!membership) {
        // Create org for them
        const { data: org } = await admin
          .from('organizations')
          .insert({ name: 'Test Org', slug: 'test-org-' + Date.now(), owner_id: existing.id })
          .select()
          .single();

        if (org) {
          await admin.from('organization_members').insert({
            organization_id: org.id,
            user_id: existing.id,
            role: 'owner'
          });

          await admin.from('profiles').upsert({
            id: existing.id,
            email: testEmail,
            name: 'Test Admin',
            organization_id: org.id,
            onboarding_complete: true
          });
        }
      } else {
        // Just mark onboarding complete
        await admin.from('profiles').update({ onboarding_complete: true }).eq('id', existing.id);
      }

      return NextResponse.json({
        message: 'Test user updated',
        email: testEmail,
        password: testPassword
      });
    }

    // Create new user
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { name: 'Test Admin' }
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    if (newUser?.user) {
      // Create org
      const { data: org } = await admin
        .from('organizations')
        .insert({ name: 'Test Org', slug: 'test-org-' + Date.now(), owner_id: newUser.user.id })
        .select()
        .single();

      if (org) {
        await admin.from('organization_members').insert({
          organization_id: org.id,
          user_id: newUser.user.id,
          role: 'owner'
        });

        await admin.from('profiles').insert({
          id: newUser.user.id,
          email: testEmail,
          name: 'Test Admin',
          organization_id: org.id,
          onboarding_complete: true
        });
      }
    }

    return NextResponse.json({
      message: 'Test user created',
      email: testEmail,
      password: testPassword
    });
  } catch (e) {
    console.error('Error creating test user:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
