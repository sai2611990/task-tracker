'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { MigrationSourceType, JiraConfig, JiraProject, ParsedData } from '@/types/migration';

interface DataPreviewProps {
  sourceType: MigrationSourceType;
  jiraConfig: JiraConfig | null;
  projects: JiraProject[];
  fileData: ParsedData | null;
  onFetch: (issues: Record<string, unknown>[], fields: string[]) => void;
}

export function DataPreview({ sourceType, jiraConfig, projects, fileData, onFetch }: DataPreviewProps) {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
  const [issueCount, setIssueCount] = useState(0);

  const toggleProject = (key: string) => {
    setSelectedProjects((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleFetchJira = async () => {
    if (!jiraConfig) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/migration/jira/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jiraConfig,
          projectKeys: selectedProjects,
          maxResults: 500,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Fetch failed');
      }

      setFetched(true);
      setIssueCount(data.issues.length);
      onFetch(data.issues, data.fields);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  if (sourceType !== 'jira-api') {
    return (
      <div className="space-y-4">
        <h3 className="font-medium">File Preview</h3>
        <p className="text-sm text-muted-foreground">
          Found {fileData?.totalRows || 0} rows with {fileData?.fields?.length || 0} fields.
        </p>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Fields Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {fileData?.fields?.map((field) => (
                <span key={field} className="px-2 py-1 bg-muted rounded text-sm">
                  {field}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sample Data (First 5 Rows)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {fileData?.fields?.slice(0, 5).map((f) => (
                    <th key={f} className="text-left p-2 border-b">{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fileData?.rows?.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {fileData?.fields?.slice(0, 5).map((f) => (
                      <td key={f} className="p-2 border-b truncate max-w-[200px]">
                        {String(row[f] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Select Projects to Import</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center gap-3 p-3 border rounded hover:bg-muted/50"
          >
            <Checkbox
              checked={selectedProjects.includes(project.key)}
              onCheckedChange={() => toggleProject(project.key)}
            />
            <div>
              <p className="font-medium">{project.name}</p>
              <p className="text-sm text-muted-foreground">{project.key}</p>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {fetched && (
        <Alert className="border-green-500 bg-green-50">
          <AlertDescription className="text-green-700">
            Fetched {issueCount} issues from selected projects.
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleFetchJira}
        disabled={selectedProjects.length === 0 || loading || fetched}
        className="w-full"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {fetched ? `${issueCount} Issues Loaded` : 'Fetch Issues'}
      </Button>
    </div>
  );
}
