import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // Only allow SELECT queries for safety
    const trimmedQuery = query.trim().toUpperCase();
    if (!trimmedQuery.startsWith('SELECT')) {
      return NextResponse.json({ error: 'Only SELECT queries allowed' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Execute raw SQL query
    const { data, error } = await admin.rpc('exec_sql', { sql_query: query });

    if (error) {
      // If RPC doesn't exist, try a different approach - parse the query
      // For simple SELECT * FROM table queries, use the Supabase client
      const tableMatch = query.match(/FROM\s+(\w+)/i);
      if (tableMatch) {
        const table = tableMatch[1];
        const limitMatch = query.match(/LIMIT\s+(\d+)/i);
        const limit = limitMatch ? parseInt(limitMatch[1]) : 50;

        const { data: rows, error: queryError } = await admin
          .from(table)
          .select('*')
          .limit(limit);

        if (queryError) {
          return NextResponse.json({ error: queryError.message }, { status: 500 });
        }

        return NextResponse.json({ rows });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rows: data });
  } catch (e) {
    console.error('Query error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
