import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import * as fs from 'fs';
import * as path from 'path';

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sql, file } = body;

    const admin = getAdminClient();

    let sqlToExecute = sql;

    // If file path provided, read from file
    if (file && !sql) {
      try {
        const filePath = path.resolve(process.cwd(), file);
        sqlToExecute = fs.readFileSync(filePath, 'utf-8');
      } catch (e) {
        return NextResponse.json({ error: `Could not read file: ${file}` }, { status: 400 });
      }
    }

    if (!sqlToExecute) {
      return NextResponse.json({ error: 'SQL or file path required' }, { status: 400 });
    }

    // Execute the SQL using rpc if available, otherwise use direct query
    // Split into statements and execute each
    const statements = sqlToExecute
      .split(/;(?=(?:[^']*'[^']*')*[^']*$)/) // Split on ; but not inside quotes
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0 && !s.startsWith('--'));

    const results = [];
    const errors = [];

    for (const statement of statements) {
      try {
        // Use raw SQL execution via rpc
        const { data, error } = await admin.rpc('exec_sql', { sql_query: statement });

        if (error) {
          // Try direct query for select statements
          if (statement.toLowerCase().startsWith('select')) {
            const { data: selectData, error: selectError } = await admin
              .from('profiles')
              .select('*')
              .limit(0);

            if (selectError) {
              errors.push({ statement: statement.substring(0, 50) + '...', error: error.message });
            }
          } else {
            errors.push({ statement: statement.substring(0, 50) + '...', error: error.message });
          }
        } else {
          results.push({ statement: statement.substring(0, 50) + '...', data });
        }
      } catch (e) {
        errors.push({ statement: statement.substring(0, 50) + '...', error: String(e) });
      }
    }

    return NextResponse.json({
      message: 'SQL execution attempted',
      totalStatements: statements.length,
      successfulStatements: results.length,
      failedStatements: errors.length,
      results,
      errors,
      note: 'Some statements may need to be run directly in Supabase SQL Editor'
    });
  } catch (e) {
    console.error('Execute SQL error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
