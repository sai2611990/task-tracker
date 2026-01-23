'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, FileUp } from 'lucide-react';
import { MigrationSourceType } from '@/types/migration';
import { cn } from '@/lib/utils';

interface SourceSelectProps {
  selected: MigrationSourceType | null;
  onSelect: (type: MigrationSourceType) => void;
}

export function SourceSelect({ selected, onSelect }: SourceSelectProps) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Choose how you want to import your data into TaskTracker.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card
          className={cn(
            'cursor-pointer transition-all hover:border-primary',
            selected === 'jira-api' && 'border-primary bg-primary/5'
          )}
          onClick={() => onSelect('jira-api')}
        >
          <CardHeader>
            <Cloud className="h-10 w-10 text-blue-500" />
            <CardTitle className="mt-2">Jira API</CardTitle>
            <CardDescription>
              Connect directly to your Jira instance and import projects, issues, and users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Real-time data sync</li>
              <li>• Auto-detect projects</li>
              <li>• Preserve relationships</li>
            </ul>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:border-primary',
            (selected === 'csv' || selected === 'json' || selected === 'excel') && 'border-primary bg-primary/5'
          )}
          onClick={() => onSelect('csv')}
        >
          <CardHeader>
            <FileUp className="h-10 w-10 text-green-500" />
            <CardTitle className="mt-2">File Upload</CardTitle>
            <CardDescription>
              Upload CSV, JSON, or Excel files exported from Jira or other systems.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• CSV, JSON, Excel supported</li>
              <li>• Field mapping wizard</li>
              <li>• Bulk import</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
