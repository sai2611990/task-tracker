import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { FieldMapping, MigrationError } from '@/types/migration';

const BATCH_SIZE = 50;

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

function transformValue(value: unknown, transformation: string): unknown {
  if (value === null || value === undefined) return null;

  switch (transformation) {
    case 'date':
      return value ? new Date(value as string).toISOString() : null;
    case 'status':
      const statusMap: Record<string, string> = {
        'To Do': 'todo',
        'In Progress': 'in_progress',
        'Done': 'completed',
        'Closed': 'completed',
      };
      return statusMap[value as string] || 'todo';
    case 'priority':
      const priorityMap: Record<string, string> = {
        'Highest': 'critical',
        'High': 'high',
        'Medium': 'medium',
        'Low': 'low',
        'Lowest': 'low',
      };
      return priorityMap[value as string] || 'medium';
    default:
      return value;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data, mappings, dryRun = false } = await request.json();

    if (!data || !mappings || !Array.isArray(data) || !Array.isArray(mappings)) {
      return NextResponse.json(
        { error: 'Invalid request: data and mappings required' },
        { status: 400 }
      );
    }

    const db = getSupabaseClient();
    const errors: MigrationError[] = [];
    const imported: Record<string, number> = {};

    const groupedMappings = mappings.reduce((acc: Record<string, FieldMapping[]>, m: FieldMapping) => {
      if (!acc[m.targetTable]) acc[m.targetTable] = [];
      acc[m.targetTable].push(m);
      return acc;
    }, {});

    for (const [table, tableMappings] of Object.entries(groupedMappings)) {
      const rows = data.map((row: Record<string, unknown>, index: number) => {
        const transformed: Record<string, unknown> = {};
        for (const mapping of tableMappings as FieldMapping[]) {
          const value = row[mapping.sourceField];
          transformed[mapping.targetField] = transformValue(value, mapping.transformation);
        }
        return { ...transformed, _rowIndex: index };
      });

      if (dryRun) {
        imported[table] = rows.length;
        continue;
      }

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE).map((r: Record<string, unknown>) => {
          const { _rowIndex, ...rest } = r;
          return rest;
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (db.from(table) as any).insert(batch);

        if (error) {
          errors.push({
            row: i,
            field: table,
            message: error.message,
            data: { batch: i / BATCH_SIZE },
          });
        } else {
          imported[table] = (imported[table] || 0) + batch.length;
        }
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      dryRun,
      imported,
      errors,
      total: data.length,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Import failed' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
