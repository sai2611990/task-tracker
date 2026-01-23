-- Migration jobs table for tracking import history
CREATE TABLE IF NOT EXISTS migration_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  source_type TEXT NOT NULL,
  source_config JSONB,
  field_mappings JSONB,
  status TEXT DEFAULT 'pending',
  progress JSONB DEFAULT '{"current": 0, "total": 0}',
  errors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Migration logs for detailed tracking
CREATE TABLE IF NOT EXISTS migration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES migration_jobs(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster job lookups
CREATE INDEX IF NOT EXISTS idx_migration_jobs_user_id ON migration_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_migration_jobs_status ON migration_jobs(status);
CREATE INDEX IF NOT EXISTS idx_migration_logs_job_id ON migration_logs(job_id);

-- RLS policies
ALTER TABLE migration_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own migration jobs
CREATE POLICY "Users can view own migration jobs" ON migration_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own migration jobs" ON migration_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own migration jobs" ON migration_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view logs for their own jobs
CREATE POLICY "Users can view own migration logs" ON migration_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM migration_jobs
      WHERE migration_jobs.id = migration_logs.job_id
      AND migration_jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert logs for own jobs" ON migration_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM migration_jobs
      WHERE migration_jobs.id = migration_logs.job_id
      AND migration_jobs.user_id = auth.uid()
    )
  );
