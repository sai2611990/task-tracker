
'use client';

export const dynamic = 'force-dynamic';

import { MigrationWizard } from '@/components/migration/migration-wizard';

export default function MigrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Migration</h1>
        <p className="text-muted-foreground">
          Import data from Jira or upload CSV/Excel files to TaskTracker.
        </p>
      </div>
      <MigrationWizard />
    </div>
  );
}
