import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// In-memory store for errors when DB is not available
const errorLogs: Array<{
  id: string;
  timestamp: string;
  type: string;
  severity: string;
  message: string;
  stack?: string;
  url?: string;
  userId?: string;
  userEmail?: string;
  metadata?: Record<string, unknown>;
  userAgent?: string;
}> = [];

const MAX_LOGS = 500;

// Initialize Supabase client for error logging
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const error = await request.json();

    // Add server timestamp
    const errorLog = {
      ...error,
      serverTimestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    };

    // Log to console
    console.error(`[ERROR LOG] ${errorLog.id} | ${errorLog.type} | ${errorLog.severity}`);
    console.error(`  Message: ${errorLog.message}`);
    if (errorLog.url) console.error(`  URL: ${errorLog.url}`);
    if (errorLog.userId) console.error(`  User: ${errorLog.userId}`);

    // Try to store in Supabase
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.from('error_logs').insert({
          error_id: errorLog.id,
          error_type: errorLog.type,
          severity: errorLog.severity,
          message: errorLog.message,
          stack: errorLog.stack,
          url: errorLog.url,
          user_id: errorLog.userId,
          user_email: errorLog.userEmail,
          metadata: errorLog.metadata,
          user_agent: errorLog.userAgent,
          ip_address: errorLog.ip,
          created_at: errorLog.timestamp,
        });
      } catch (dbError) {
        // DB insert failed, store in memory
        console.warn('Failed to store error in DB, using memory:', dbError);
        storeInMemory(errorLog);
      }
    } else {
      // No DB connection, store in memory
      storeInMemory(errorLog);
    }

    return NextResponse.json({ success: true, errorId: errorLog.id });
  } catch (e) {
    console.error('Error logging endpoint failed:', e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

function storeInMemory(errorLog: typeof errorLogs[0]) {
  errorLogs.unshift(errorLog);
  if (errorLogs.length > MAX_LOGS) {
    errorLogs.pop();
  }
}

// GET endpoint to retrieve recent errors (for admin)
export async function GET(request: NextRequest) {
  // Simple auth check - in production use proper auth
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return NextResponse.json({ errors: data, source: 'database' });
    } catch {
      // Fall back to memory
    }
  }

  return NextResponse.json({ errors: errorLogs, source: 'memory' });
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
