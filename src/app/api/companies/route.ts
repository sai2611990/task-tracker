import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Admin client bypasses RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - List companies for current user
export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const admin = getAdminClient();
    const { data: memberships } = await admin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1);

    const membership = memberships?.[0];
    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Get companies for that organization
    const { data: companies, error } = await admin
      .from('companies')
      .select('*')
      .eq('organization_id', membership.organization_id)
      .order('name');

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ companies, organizationId: membership.organization_id });
  } catch (e) {
    console.error('GET /api/companies error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST - Create a new company
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, industry, color } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Get user's organization using admin client
    const admin = getAdminClient();
    const { data: memberships, error: membershipError } = await admin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1);

    console.log('User:', user.id, user.email);
    console.log('Memberships:', memberships, membershipError);

    const membership = memberships?.[0];
    if (!membership) {
      return NextResponse.json({
        error: 'No organization found for user',
        userId: user.id
      }, { status: 400 });
    }

    // Create company using admin client (bypasses RLS)
    const { data: company, error } = await admin
      .from('companies')
      .insert({
        name,
        industry: industry || 'Technology',
        color: color || '#3B82F6',
        organization_id: membership.organization_id
      })
      .select()
      .single();

    console.log('Company created:', company, error);

    if (error) {
      console.error('Error creating company:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ company });
  } catch (e) {
    console.error('POST /api/companies error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// PUT - Update a company
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, industry, color } = body;

    if (!id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Verify user owns this company's organization
    const { data: memberships } = await admin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1);

    const membership = memberships?.[0];
    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const { data: company, error } = await admin
      .from('companies')
      .update({ name, industry, color })
      .eq('id', id)
      .eq('organization_id', membership.organization_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ company });
  } catch (e) {
    console.error('PUT /api/companies error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// DELETE - Delete a company
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Verify user owns this company's organization
    const { data: memberships } = await admin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1);

    const membership = memberships?.[0];
    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const { error } = await admin
      .from('companies')
      .delete()
      .eq('id', id)
      .eq('organization_id', membership.organization_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/companies error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
