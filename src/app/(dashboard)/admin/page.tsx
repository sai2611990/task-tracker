'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, RefreshCw, Database, Users, AlertCircle, Wrench, ExternalLink, Copy, Check } from 'lucide-react';

interface QueryResult {
  data: Record<string, unknown>[] | null;
  error: string | null;
  rowCount: number;
}

export default function AdminPage() {
  const [query, setQuery] = useState('SELECT * FROM companies LIMIT 10;');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorLogs, setErrorLogs] = useState<Record<string, unknown>[]>([]);
  const [currentUser, setCurrentUser] = useState<Record<string, unknown> | null>(null);
  const [orgInfo, setOrgInfo] = useState<Record<string, unknown> | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<Record<string, unknown> | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    loadCurrentUser();
    loadErrorLogs();
    checkMigrations();
  }, []);

  async function checkMigrations() {
    try {
      const res = await fetch('/api/admin/run-migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ migration: 'add-subtasks' }),
      });
      const data = await res.json();
      setMigrationStatus(data);
    } catch (e) {
      console.error('Failed to check migrations:', e);
    }
  }

  const subtaskMigrationSql = `-- Add subtask support columns to timeline_tasks
ALTER TABLE public.timeline_tasks
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES public.timeline_tasks(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_subtask BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Create indexes for subtasks
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_parent ON public.timeline_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_manager ON public.timeline_tasks(manager_id);`;

  function copySqlToClipboard() {
    navigator.clipboard.writeText(subtaskMigrationSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  }

  function openSupabaseDashboard() {
    window.open('https://supabase.com/dashboard/project/zlgxekqrlgblgsquvvek/sql/new', '_blank');
  }

  async function loadCurrentUser() {
    try {
      const res = await fetch('/api/admin/user-info');
      const data = await res.json();
      if (data.user) setCurrentUser(data.user);
      if (data.organization) setOrgInfo(data.organization);
    } catch (e) {
      console.error('Failed to load user info:', e);
    }
  }

  async function loadErrorLogs() {
    try {
      const res = await fetch('/api/admin/error-logs');
      const data = await res.json();
      if (data.logs) setErrorLogs(data.logs);
    } catch (e) {
      console.error('Failed to load error logs:', e);
    }
  }

  async function runQuery() {
    setLoading(true);
    setQueryResult(null);

    try {
      const res = await fetch('/api/admin/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      if (!res.ok) {
        setQueryResult({ data: null, error: data.error, rowCount: 0 });
      } else {
        setQueryResult({
          data: data.rows || [],
          error: null,
          rowCount: data.rows?.length || 0
        });
      }
    } catch (e) {
      setQueryResult({ data: null, error: String(e), rowCount: 0 });
    }

    setLoading(false);
  }

  async function loadTable(table: string) {
    setQuery(`SELECT * FROM ${table} LIMIT 50;`);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `SELECT * FROM ${table} LIMIT 50` }),
      });
      const data = await res.json();

      if (!res.ok) {
        setQueryResult({ data: null, error: data.error, rowCount: 0 });
      } else {
        setQueryResult({
          data: data.rows || [],
          error: null,
          rowCount: data.rows?.length || 0
        });
      }
    } catch (e) {
      setQueryResult({ data: null, error: String(e), rowCount: 0 });
    }

    setLoading(false);
  }

  const tables = [
    'companies', 'departments', 'profiles', 'organizations',
    'organization_members', 'timeline_tasks', 'error_logs'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Database explorer and logs</p>
      </div>

      {/* Current User Info */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Current Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">User ID</p>
              <p className="font-mono text-xs break-all">{String(currentUser?.id || 'Loading...')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{String(currentUser?.email || 'Loading...')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Organization</p>
              <p className="font-medium">{String(orgInfo?.name || 'None')}</p>
              <p className="font-mono text-xs">{String(orgInfo?.id || '').slice(0, 8)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <p className="font-medium">{String(orgInfo?.role || 'N/A')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="migrations">
        <TabsList>
          <TabsTrigger value="migrations">
            <Wrench className="h-4 w-4 mr-2" />
            Migrations
          </TabsTrigger>
          <TabsTrigger value="query">
            <Database className="h-4 w-4 mr-2" />
            Query Editor
          </TabsTrigger>
          <TabsTrigger value="errors">
            <AlertCircle className="h-4 w-4 mr-2" />
            Error Logs ({errorLogs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="migrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subtask Migration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Migration Status */}
              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-medium mb-2">Migration Status</h4>
                {migrationStatus ? (
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Existing columns:</span>{' '}
                      {(migrationStatus.existingColumns as string[])?.length || 0}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Missing columns:</span>{' '}
                      <span className={((migrationStatus.missingColumns as string[])?.length || 0) > 0 ? 'text-red-500 font-medium' : 'text-green-500'}>
                        {(migrationStatus.missingColumns as string[])?.join(', ') || 'None - all columns exist!'}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Loading...</p>
                )}
              </div>

              {/* SQL Preview */}
              <div>
                <h4 className="font-medium mb-2">SQL to Run</h4>
                <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto">
                  {subtaskMigrationSql}
                </pre>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={copySqlToClipboard} variant="outline">
                  {copiedSql ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copiedSql ? 'Copied!' : 'Copy SQL'}
                </Button>
                <Button onClick={openSupabaseDashboard}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Supabase SQL Editor
                </Button>
                <Button variant="outline" onClick={checkMigrations}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Click &quot;Copy SQL&quot; then &quot;Open Supabase SQL Editor&quot; to paste and run the migration.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="query" className="space-y-4">
          {/* Quick Access */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Access Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tables.map(t => (
                  <Button key={t} variant="outline" size="sm" onClick={() => loadTable(t)} disabled={loading}>
                    {t}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Query Editor */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">SQL Query</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full h-32 font-mono text-sm p-3 border rounded-md bg-background resize-y"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SELECT * FROM ..."
              />
              <Button onClick={runQuery} disabled={loading}>
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                Run Query
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {queryResult && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {queryResult.error ? 'Error' : `Results (${queryResult.rowCount} rows)`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {queryResult.error ? (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded text-sm font-mono">
                    {queryResult.error}
                  </div>
                ) : queryResult.data && queryResult.data.length > 0 ? (
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm border-collapse">
                      <thead className="sticky top-0 bg-background">
                        <tr>
                          {Object.keys(queryResult.data[0]).map(key => (
                            <th key={key} className="text-left p-2 border-b font-medium bg-muted">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.data.map((row, i) => (
                          <tr key={i} className="hover:bg-muted/50">
                            {Object.values(row).map((val, j) => (
                              <td key={j} className="p-2 border-b font-mono text-xs max-w-xs truncate">
                                {val === null ? <span className="text-muted-foreground">NULL</span> :
                                  typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No results</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Error Logs</CardTitle>
              <Button variant="outline" size="sm" onClick={loadErrorLogs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {errorLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No errors logged</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {errorLogs.map((log, i) => (
                    <div key={i} className="p-3 border rounded text-sm">
                      <div className="flex justify-between mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          log.severity === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {String(log.severity || 'error').toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {log.created_at ? new Date(String(log.created_at)).toLocaleString() : ''}
                        </span>
                      </div>
                      <p className="font-medium">{String(log.message || '')}</p>
                      {log.url ? <p className="text-xs text-muted-foreground mt-1">URL: {String(log.url)}</p> : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
