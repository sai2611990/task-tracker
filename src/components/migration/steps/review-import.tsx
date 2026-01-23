'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertTriangle, Play, Eye } from 'lucide-react';
import { FieldMapping, MigrationSourceType } from '@/types/migration';

interface ReviewImportProps {
  data: Record<string, unknown>[];
  mappings: FieldMapping[];
  sourceType: MigrationSourceType;
}

interface ImportResult {
  success: boolean;
  imported: Record<string, number>;
  errors: { row: number; field: string; message: string }[];
  total: number;
}

export function ReviewImport({ data, mappings, sourceType }: ReviewImportProps) {
  const [loading, setLoading] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<ImportResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tables = [...new Set(mappings.map((m) => m.targetTable))];

  const runImport = async (dryRun: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/migration/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, mappings, dryRun }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Import failed');
      }

      if (dryRun) {
        setDryRunResult(result);
      } else {
        setImportResult(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const completed = importResult?.success;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Import Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Source</p>
              <p className="font-medium capitalize">{sourceType.replace('-', ' ')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Records</p>
              <p className="font-medium">{data.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fields Mapped</p>
              <p className="font-medium">{mappings.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Target Tables</p>
              <p className="font-medium">{tables.join(', ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {dryRunResult && !importResult && (
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Dry Run Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(dryRunResult.imported).map(([table, count]) => (
              <div key={table} className="flex justify-between text-sm">
                <span>{table}</span>
                <span className="font-medium">{count} records</span>
              </div>
            ))}
            {dryRunResult.errors.length > 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  {dryRunResult.errors.length} errors detected. Review before importing.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {importResult && (
        <Card className={importResult.success ? 'border-green-500' : 'border-red-500'}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              {importResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              Import {importResult.success ? 'Complete' : 'Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(importResult.imported).map(([table, count]) => (
              <div key={table} className="flex justify-between text-sm">
                <span>{table}</span>
                <span className="font-medium text-green-600">{count} imported</span>
              </div>
            ))}
            {importResult.errors.length > 0 && (
              <div className="mt-4 text-sm text-red-600">
                {importResult.errors.length} errors occurred
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!completed && (
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => runImport(true)}
            disabled={loading || dryRunResult !== null}
            className="flex-1"
          >
            {loading && !dryRunResult && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Eye className="mr-2 h-4 w-4" />
            Preview Import
          </Button>
          <Button
            onClick={() => runImport(false)}
            disabled={loading || !dryRunResult}
            className="flex-1"
          >
            {loading && dryRunResult && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Play className="mr-2 h-4 w-4" />
            Run Import
          </Button>
        </div>
      )}

      {completed && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            Migration completed successfully! Your data is now in TaskTracker.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
