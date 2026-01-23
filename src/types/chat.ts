// Chat types for AI Assistant

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolResults?: ToolResult[];
}

export interface ToolResult {
  toolName: string;
  result: string;
  success: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isOpen: boolean;
}

export interface Company {
  id: string;
  name: string;
  short_name: string;
  industry: string;
  color: string;
  bg_color: string;
}

export interface Department {
  id: string;
  name: string;
  company_id: string;
  color: string;
}

export interface TimelineTask {
  id: string;
  name: string;
  description?: string;
  department_id: string;
  start_period: number;
  end_period: number;
  status: 'planning' | 'in_progress' | 'completed' | 'blocked';
  skill: 'product_lead' | 'builder' | 'growth_lead' | 'coordinator';
  assigned_to?: string;
  year: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  skill: string;
  team_role: string;
  task_count?: number;
}
