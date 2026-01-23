export type MigrationSourceType = 'jira-api' | 'csv' | 'json' | 'excel';

export interface JiraConfig {
  domain: string;
  email: string;
  apiToken: string;
}

export interface FileConfig {
  fileName: string;
  fileType: 'csv' | 'json' | 'excel';
  fileSize: number;
}

export interface MigrationSource {
  type: MigrationSourceType;
  config: JiraConfig | FileConfig;
}

export type TransformationType = 'none' | 'date' | 'status' | 'priority' | 'custom';

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  targetTable: string;
  transformation: TransformationType;
  customTransform?: string;
  confidence?: number;
}

export interface MigrationError {
  row: number;
  field: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface MigrationProgress {
  current: number;
  total: number;
}

export type MigrationStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface MigrationJob {
  id: string;
  userId?: string;
  sourceType: MigrationSourceType;
  sourceConfig: JiraConfig | FileConfig;
  fieldMappings: FieldMapping[];
  status: MigrationStatus;
  progress: MigrationProgress;
  errors: MigrationError[];
  createdAt: Date;
  completedAt?: Date;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  issueCount?: number;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description?: string;
  status: string;
  priority?: string;
  assignee?: string;
  dueDate?: string;
  created: string;
  updated: string;
  issueType: string;
  labels: string[];
  components: string[];
  project: string;
}

export interface ParsedData {
  fields: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
}

export interface WizardState {
  step: number;
  sourceType: MigrationSourceType | null;
  jiraConfig: JiraConfig | null;
  fileData: ParsedData | null;
  selectedProjects: string[];
  selectedIssues: string[];
  fieldMappings: FieldMapping[];
  jobId: string | null;
}

export const JIRA_FIELD_MAPPINGS: Record<string, { target: string; table: string }> = {
  'summary': { target: 'title', table: 'timeline_tasks' },
  'description': { target: 'description', table: 'timeline_tasks' },
  'status': { target: 'status', table: 'timeline_tasks' },
  'priority': { target: 'priority', table: 'timeline_tasks' },
  'assignee': { target: 'assigned_to', table: 'timeline_tasks' },
  'duedate': { target: 'due_date', table: 'timeline_tasks' },
  'created': { target: 'created_at', table: 'timeline_tasks' },
  'project': { target: 'company_id', table: 'timeline_tasks' },
  'issuetype': { target: 'task_type', table: 'timeline_tasks' },
  'labels': { target: 'tags', table: 'timeline_tasks' },
  'components': { target: 'department_id', table: 'timeline_tasks' },
};

export const TARGET_TABLES = {
  companies: ['name', 'industry', 'short_name', 'bg_color'],
  departments: ['name', 'company_id', 'color'],
  timeline_tasks: ['title', 'description', 'status', 'priority', 'assigned_to', 'department_id', 'company_id', 'due_date', 'start_period', 'end_period', 'skill'],
  profiles: ['name', 'email', 'skill', 'team_role'],
  department_targets: ['objective', 'timeline', 'status', 'department_id', 'progress', 'key_results'],
};
