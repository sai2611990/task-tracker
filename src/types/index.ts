// User and Authentication Types
export type UserRole = 'ceo' | 'executive' | 'manager' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  industry: string;
  color: string; // Hex color for UI
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

// Department Types
export interface Department {
  id: string;
  name: string;
  company_id: string;
  color: string;
  created_at: string;
  updated_at: string;
  // Relations
  company?: Company;
}

// Team Types
export interface Team {
  id: string;
  name: string;
  department_id: string;
  created_at: string;
  updated_at: string;
  // Relations
  department?: Department;
}

// Team Membership Types
export type MembershipRole = 'lead' | 'member';

export interface TeamMembership {
  id: string;
  user_id: string;
  team_id: string;
  role: MembershipRole;
  created_at: string;
  // Relations
  user?: User;
  team?: Team;
}

// Executive Watcher - oversight without membership
export interface ExecutiveWatcher {
  id: string;
  user_id: string;
  department_id: string;
  created_at: string;
  // Relations
  user?: User;
  department?: Department;
}

// Project Types
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  description?: string;
  company_id: string;
  department_id?: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  budget?: number;
  created_at: string;
  updated_at: string;
  // Relations
  company?: Company;
  department?: Department;
}

// Task Types
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  assigned_to?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  is_checkpoint: boolean; // Milestone marker
  reminder_date?: string;
  created_at: string;
  updated_at: string;
  // Relations
  project?: Project;
  assignee?: User;
}

// Department Target Types
export type TargetStatus = 'draft' | 'frozen' | 'in_progress' | 'completed';

export interface DepartmentTarget {
  id: string;
  department_id: string;
  objective: string;
  description?: string;
  timeline: string; // e.g., "Q1 2026"
  status: TargetStatus;
  frozen_date?: string;
  created_at: string;
  updated_at: string;
  // Relations
  department?: Department;
}

// Reminder/Notification Types
export type ReminderType = 'deadline' | 'checkpoint' | 'target' | 'custom';

export interface Reminder {
  id: string;
  user_id: string;
  task_id?: string;
  target_id?: string;
  type: ReminderType;
  message: string;
  remind_at: string;
  is_read: boolean;
  created_at: string;
  // Relations
  user?: User;
  task?: Task;
  target?: DepartmentTarget;
}

// Timeline View Types
export interface TimelineEvent {
  id: string;
  type: 'task' | 'checkpoint' | 'target';
  title: string;
  start_date: string;
  end_date?: string;
  color: string;
  company_id: string;
  department_id?: string;
  status: string;
  // Source reference
  task?: Task;
  target?: DepartmentTarget;
}

// Filter Types for Timeline
export interface TimelineFilters {
  companies: string[];
  departments: string[];
  teams: string[];
  assignees: string[];
  status: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

// Common department templates
export const COMMON_DEPARTMENTS = [
  'Accounts',
  'Contracts',
  'Sales',
  'Support',
  'HR',
] as const;

// Industry types for companies
export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Real Estate',
  'Other',
] as const;

export type Industry = typeof INDUSTRIES[number];
export type CommonDepartment = typeof COMMON_DEPARTMENTS[number];
