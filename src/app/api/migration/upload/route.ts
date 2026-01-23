import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    let fields: string[] = [];
    let rows: Record<string, unknown>[] = [];

    if (fileName.endsWith('.csv')) {
      const text = new TextDecoder().decode(bytes);
      const records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
      rows = records as Record<string, unknown>[];
      fields = records.length > 0 ? Object.keys(records[0] as object) : [];
    } else if (fileName.endsWith('.json')) {
      const text = new TextDecoder().decode(bytes);
      const data = JSON.parse(text);
      rows = Array.isArray(data) ? data : [data];
      fields = rows.length > 0 ? Object.keys(rows[0]) : [];
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const workbook = XLSX.read(bytes, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(sheet);
      fields = rows.length > 0 ? Object.keys(rows[0] as object) : [];
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Use CSV, JSON, or Excel.' },
        { status: 400 }
      );
    }

    const preview = rows.slice(0, 10);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      fields,
      preview,
      totalRows: rows.length,
      rows,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to parse file' },
      { status: 500 }
    );
  }
}
