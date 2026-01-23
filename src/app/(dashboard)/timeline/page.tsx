export const dynamic = 'force-dynamic';

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Building2,
  Cpu,
  GraduationCap,
  Megaphone,
  HeadphonesIcon,
  Rocket,
  Factory,
  Briefcase,
  Layers,
  Zap,
  Star,
  Globe,
  Eye,
  EyeOff,
  LayoutGrid,
  Palette,
  Code,
  TrendingUp,
  Filter,
  Calendar,
  Settings,
  X,
  Image,
  Pipette,
  Sparkles,
  GitBranch,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { createClient } from '@/lib/supabase/client';

// ============================================
// DATA STRUCTURES
// ============================================

// Lean AI-era skills - humans focus on judgment, strategy & relationships
type Skill = 'product_lead' | 'builder' | 'growth_lead' | 'coordinator';

const skills: { id: Skill; name: string; color: string; icon: React.ReactNode; description: string }[] = [
  { id: 'product_lead', name: 'Product Lead', color: '#8B5CF6', icon: <Sparkles className="w-3 h-3" />, description: 'Vision, strategy, user research & product decisions' },
  { id: 'builder', name: 'Builder', color: '#3B82F6', icon: <Code className="w-3 h-3" />, description: 'Dev + DevOps + QA (AI does the coding)' },
  { id: 'growth_lead', name: 'Growth Lead', color: '#10B981', icon: <TrendingUp className="w-3 h-3" />, description: 'Sales, marketing & customer relationships' },
  { id: 'coordinator', name: 'Coordinator', color: '#F59E0B', icon: <GitBranch className="w-3 h-3" />, description: 'Planning, sync & stakeholder management' },
];

interface Task {
  id: string;
  name: string;
  startPeriod: number;
  endPeriod: number;
  status: 'planning' | 'in_progress' | 'completed' | 'blocked';
  skill: Skill;
}

interface Department {
  id: string;
  name: string;
  icon: React.ReactNode;
  tasks: Task[];
}

interface Company {
  id: string;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  logo?: string; // URL to company logo
  color: string;
  bgColor: string;
  departments: Department[];
}

// Time periods (36 periods = 12 months x 3 periods each)
const periods = [
  { month: 'JAN', period: '1-10', idx: 0 },
  { month: 'JAN', period: '11-20', idx: 1 },
  { month: 'JAN', period: '21-31', idx: 2 },
  { month: 'FEB', period: '1-10', idx: 3 },
  { month: 'FEB', period: '11-20', idx: 4 },
  { month: 'FEB', period: '21-28', idx: 5 },
  { month: 'MAR', period: '1-10', idx: 6 },
  { month: 'MAR', period: '11-20', idx: 7 },
  { month: 'MAR', period: '21-31', idx: 8 },
  { month: 'APR', period: '1-10', idx: 9 },
  { month: 'APR', period: '11-20', idx: 10 },
  { month: 'APR', period: '21-30', idx: 11 },
  { month: 'MAY', period: '1-10', idx: 12 },
  { month: 'MAY', period: '11-20', idx: 13 },
  { month: 'MAY', period: '21-31', idx: 14 },
  { month: 'JUN', period: '1-10', idx: 15 },
  { month: 'JUN', period: '11-20', idx: 16 },
  { month: 'JUN', period: '21-30', idx: 17 },
  { month: 'JUL', period: '1-10', idx: 18 },
  { month: 'JUL', period: '11-20', idx: 19 },
  { month: 'JUL', period: '21-31', idx: 20 },
  { month: 'AUG', period: '1-10', idx: 21 },
  { month: 'AUG', period: '11-20', idx: 22 },
  { month: 'AUG', period: '21-31', idx: 23 },
  { month: 'SEP', period: '1-10', idx: 24 },
  { month: 'SEP', period: '11-20', idx: 25 },
  { month: 'SEP', period: '21-30', idx: 26 },
  { month: 'OCT', period: '1-10', idx: 27 },
  { month: 'OCT', period: '11-20', idx: 28 },
  { month: 'OCT', period: '21-31', idx: 29 },
  { month: 'NOV', period: '1-10', idx: 30 },
  { month: 'NOV', period: '11-20', idx: 31 },
  { month: 'NOV', period: '21-30', idx: 32 },
  { month: 'DEC', period: '1-10', idx: 33 },
  { month: 'DEC', period: '11-20', idx: 34 },
  { month: 'DEC', period: '21-31', idx: 35 },
];

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// Calculate current period index based on today's date
const getCurrentPeriodIndex = (): number => {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();

  // Each month has 3 periods
  const monthOffset = month * 3;

  // Determine which period within the month
  let periodInMonth = 0;
  if (day >= 21) {
    periodInMonth = 2;
  } else if (day >= 11) {
    periodInMonth = 1;
  }

  return monthOffset + periodInMonth;
};

// ============================================
// UNIFIED DEPARTMENTS - Same for all companies
// ============================================

const departmentTemplates: { id: string; name: string; icon: React.ReactNode }[] = [
  { id: 'it', name: 'IT Department', icon: <Cpu className="w-4 h-4" /> },
  { id: 'manufacturing', name: 'Manufacturing', icon: <Factory className="w-4 h-4" /> },
  { id: 'operations', name: 'Operations', icon: <Building2 className="w-4 h-4" /> },
  { id: 'training', name: 'Training', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'sales', name: 'Sales', icon: <Megaphone className="w-4 h-4" /> },
  { id: 'marketing', name: 'Marketing', icon: <Megaphone className="w-4 h-4" /> },
  { id: 'support', name: 'Support', icon: <HeadphonesIcon className="w-4 h-4" /> },
  { id: 'rd', name: 'R&D', icon: <Rocket className="w-4 h-4" /> },
  { id: 'investor-relations', name: 'Investor Relations', icon: <Rocket className="w-4 h-4" /> },
  { id: 'hr', name: 'Human Resources', icon: <Briefcase className="w-4 h-4" /> },
];

// Helper to create department with tasks for a company
const createDept = (companyId: string, deptId: string, tasks: Task[] = []): Department => {
  const template = departmentTemplates.find(d => d.id === deptId)!;
  return {
    id: `${companyId}-${deptId}`,
    name: template.name,
    icon: template.icon,
    tasks,
  };
};

// Helper to get icon for department based on name
const getDeptIcon = (deptName: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    'IT Department': <Cpu className="w-4 h-4" />,
    'Manufacturing': <Factory className="w-4 h-4" />,
    'Operations': <Building2 className="w-4 h-4" />,
    'Training': <GraduationCap className="w-4 h-4" />,
    'Sales': <Megaphone className="w-4 h-4" />,
    'Marketing': <Megaphone className="w-4 h-4" />,
    'Support': <HeadphonesIcon className="w-4 h-4" />,
    'R&D': <Rocket className="w-4 h-4" />,
    'Investor Relations': <Rocket className="w-4 h-4" />,
    'Human Resources': <Briefcase className="w-4 h-4" />,
  };
  return iconMap[deptName] || <Layers className="w-4 h-4" />;
};

// Helper to get company icon based on short_name
const getCompanyIcon = (shortName: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    'NC': <Zap className="w-5 h-5" />,
    'ES': <Briefcase className="w-5 h-5" />,
    'IC': <Layers className="w-5 h-5" />,
    'GC': <Star className="w-5 h-5" />,
    'FC': <Globe className="w-5 h-5" />,
    'NO': <Building2 className="w-5 h-5" />,
  };
  return iconMap[shortName] || <Building2 className="w-5 h-5" />;
};

// ============================================
// INTERACTIVE TASK BAR COMPONENT
// ============================================

interface TaskBarProps {
  task: Task;
  companyColor: string;
  cellWidth: number;
  rowHeight: number;
  onTaskUpdate: (taskId: string, startPeriod: number, endPeriod: number) => void;
  onTaskSelect: (task: Task, companyName: string, deptName: string) => void;
  companyName: string;
  deptName: string;
}

function TaskBar({
  task,
  companyColor,
  cellWidth,
  rowHeight,
  onTaskUpdate,
  onTaskSelect,
  companyName,
  deptName
}: TaskBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [initialStart, setInitialStart] = useState(task.startPeriod);
  const [initialEnd, setInitialEnd] = useState(task.endPeriod);

  const left = task.startPeriod * cellWidth;
  const width = (task.endPeriod - task.startPeriod) * cellWidth;

  const statusColors = {
    completed: 'brightness-110',
    in_progress: '',
    planning: 'opacity-70',
    blocked: 'opacity-50 grayscale',
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'drag' | 'resize-left' | 'resize-right') => {
    e.stopPropagation();
    e.preventDefault();
    setDragStartX(e.clientX);
    setInitialStart(task.startPeriod);
    setInitialEnd(task.endPeriod);

    if (type === 'drag') setIsDragging(true);
    if (type === 'resize-left') setIsResizingLeft(true);
    if (type === 'resize-right') setIsResizingRight(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizingLeft && !isResizingRight) return;

      const deltaX = e.clientX - dragStartX;
      const periodDelta = Math.round(deltaX / cellWidth);

      if (isDragging) {
        const newStart = Math.max(0, Math.min(35 - (initialEnd - initialStart), initialStart + periodDelta));
        const duration = initialEnd - initialStart;
        onTaskUpdate(task.id, newStart, newStart + duration);
      }

      if (isResizingLeft) {
        const newStart = Math.max(0, Math.min(initialEnd - 1, initialStart + periodDelta));
        onTaskUpdate(task.id, newStart, initialEnd);
      }

      if (isResizingRight) {
        const newEnd = Math.max(initialStart + 1, Math.min(36, initialEnd + periodDelta));
        onTaskUpdate(task.id, initialStart, newEnd);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizingLeft(false);
      setIsResizingRight(false);
    };

    if (isDragging || isResizingLeft || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizingLeft, isResizingRight, dragStartX, cellWidth, initialStart, initialEnd, task.id, onTaskUpdate]);

  return (
    <div
      ref={barRef}
      className={`absolute top-1 group cursor-grab active:cursor-grabbing transition-shadow hover:shadow-lg ${statusColors[task.status]} ${
        isDragging || isResizingLeft || isResizingRight ? 'z-50 shadow-xl' : 'z-10'
      }`}
      style={{
        left: `${left}px`,
        width: `${Math.max(width - 2, 20)}px`,
        height: `${rowHeight - 8}px`,
        backgroundColor: companyColor,
        borderRadius: '6px',
        border: '2px solid rgba(255,255,255,0.3)',
      }}
      onClick={() => onTaskSelect(task, companyName, deptName)}
    >
      {/* Left resize handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 rounded-l-md"
        onMouseDown={(e) => handleMouseDown(e, 'resize-left')}
      />

      {/* Drag area */}
      <div
        className="absolute inset-0 mx-2"
        onMouseDown={(e) => handleMouseDown(e, 'drag')}
      >
        <span className="text-[11px] text-white px-1 truncate block leading-7 font-semibold drop-shadow-sm">
          {width > 80 ? task.name : ''}
        </span>
      </div>

      {/* Right resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 rounded-r-md"
        onMouseDown={(e) => handleMouseDown(e, 'resize-right')}
      />

      {/* Status indicator */}
      <div
        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
          task.status === 'completed' ? 'bg-green-500' :
          task.status === 'in_progress' ? 'bg-yellow-500' :
          task.status === 'blocked' ? 'bg-red-500' :
          'bg-gray-400'
        }`}
      />

      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
        <div className="font-semibold">{task.name}</div>
        <div className="text-gray-300">
          {periods[task.startPeriod]?.month} {periods[task.startPeriod]?.period} → {periods[task.endPeriod - 1]?.month} {periods[task.endPeriod - 1]?.period}
        </div>
        <div className="text-gray-400 capitalize">{task.status.replace('_', ' ')}</div>
      </div>
    </div>
  );
}

// ============================================
// MAIN TIMELINE COMPONENT
// ============================================

export default function TimelinePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(100);
  const [selectedTask, setSelectedTask] = useState<{ task: Task; company: string; dept: string } | null>(null);
  const [editingCompany, setEditingCompany] = useState<string | null>(null);

  // Current period for highlighting today's column
  const currentPeriod = getCurrentPeriodIndex();
  const isCurrentYear = selectedYear === new Date().getFullYear();
  const [tempLogo, setTempLogo] = useState<string>('');
  const [tempColor, setTempColor] = useState<string>('');
  const [showEmptyDepts, setShowEmptyDepts] = useState<boolean>(false);

  const availableYears = Array.from({ length: 17 }, (_, i) => 2024 + i); // 2024-2040

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const supabase = createClient();

      try {
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .order('name');

        if (companiesError) throw companiesError;

        // Fetch departments
        const { data: departmentsData, error: deptError } = await supabase
          .from('departments')
          .select('*')
          .order('name');

        if (deptError) throw deptError;

        // Fetch timeline tasks for selected year
        const { data: tasksData, error: tasksError } = await supabase
          .from('timeline_tasks')
          .select('*')
          .eq('year', selectedYear);

        if (tasksError) throw tasksError;

        // Transform data to match component structure
        const transformedCompanies: Company[] = (companiesData || []).map(company => {
          const companyDepts = (departmentsData || []).filter(d => d.company_id === company.id);

          return {
            id: company.id,
            name: company.name,
            shortName: company.short_name || company.name.substring(0, 2).toUpperCase(),
            icon: getCompanyIcon(company.short_name || ''),
            color: company.color || '#3B82F6',
            bgColor: company.bg_color || (company.color ? company.color + '15' : '#EFF6FF'),
            departments: companyDepts.map(dept => {
              const deptTasks = (tasksData || []).filter(t => t.department_id === dept.id);

              return {
                id: dept.id,
                name: dept.name,
                icon: getDeptIcon(dept.name),
                tasks: deptTasks.map(task => ({
                  id: task.id,
                  name: task.name,
                  startPeriod: task.start_period,
                  endPeriod: task.end_period,
                  status: task.status as Task['status'],
                  skill: task.skill as Skill,
                })),
              };
            }),
          };
        });

        setCompanies(transformedCompanies);
        // Expand all departments by default
        setExpandedDepts(new Set(transformedCompanies.flatMap(c => c.departments.map(d => d.id))));
      } catch (error) {
        console.error('Error fetching timeline data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedYear]);

  // Company settings handlers
  const openCompanySettings = (companyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setTempLogo(company.logo || '');
      setTempColor(company.color);
      setEditingCompany(companyId);
    }
  };

  const saveCompanySettings = () => {
    if (!editingCompany) return;
    setCompanies(prev => prev.map(c => {
      if (c.id !== editingCompany) return c;
      // Generate bgColor from brand color (lighter version)
      const bgColor = tempColor + '15'; // Add 15% opacity for bg
      return {
        ...c,
        logo: tempLogo || undefined,
        color: tempColor,
        bgColor: bgColor,
      };
    }));
    setEditingCompany(null);
  };

  const presetColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];

  const cellWidth = Math.max(45, zoom * 0.65);
  const rowHeight = 40;

  // Get available departments for filtering (unified list)
  const availableDepts = departmentTemplates.map(d => ({ id: d.id, name: d.name }));

  // Filter companies, departments, and tasks
  const filteredCompanies = (selectedCompany === 'all'
    ? companies
    : companies.filter(c => c.id === selectedCompany)
  ).map(company => ({
    ...company,
    departments: (selectedDept === 'all'
      ? company.departments
      : company.departments.filter(d => d.id.endsWith(`-${selectedDept}`))
    ).map(dept => ({
      ...dept,
      tasks: selectedSkill === 'all'
        ? dept.tasks
        : dept.tasks.filter(t => t.skill === selectedSkill)
    })).filter(d => showEmptyDepts || d.tasks.length > 0)
  })).filter(c => c.departments.length > 0);

  // Reset department filter when company changes
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
    setSelectedDept('all');
  };

  const toggleDept = (deptId: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(deptId)) {
        next.delete(deptId);
      } else {
        next.add(deptId);
      }
      return next;
    });
  };

  const handleTaskUpdate = useCallback((companyId: string, deptId: string, taskId: string, startPeriod: number, endPeriod: number) => {
    setCompanies(prev => prev.map(company => {
      if (company.id !== companyId) return company;
      return {
        ...company,
        departments: company.departments.map(dept => {
          if (dept.id !== deptId) return dept;
          return {
            ...dept,
            tasks: dept.tasks.map(task => {
              if (task.id !== taskId) return task;
              return { ...task, startPeriod, endPeriod };
            }),
          };
        }),
      };
    }));
  }, []);

  const handleTaskSelect = (task: Task, companyName: string, deptName: string) => {
    setSelectedTask({ task, company: companyName, dept: deptName });
  };

  const expandAll = () => setExpandedDepts(new Set(companies.flatMap(c => c.departments.map(d => d.id))));
  const collapseAll = () => setExpandedDepts(new Set());

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading timeline data...</p>
        </div>
      </div>
    );
  }

  // Calculate stats for selected view
  const visibleCompanies = filteredCompanies;
  const totalTasks = visibleCompanies.reduce((sum, c) => sum + c.departments.reduce((s, d) => s + d.tasks.length, 0), 0);
  const completedTasks = visibleCompanies.reduce((sum, c) =>
    sum + c.departments.reduce((s, d) => s + d.tasks.filter(t => t.status === 'completed').length, 0), 0);
  const inProgressTasks = visibleCompanies.reduce((sum, c) =>
    sum + c.departments.reduce((s, d) => s + d.tasks.filter(t => t.status === 'in_progress').length, 0), 0);

  return (
    <div className="space-y-4 pb-8">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{selectedYear} Strategic Roadmap</h1>
            <p className="text-gray-300 mt-1">
              {selectedCompany === 'all' ? 'All Companies' : companies.find(c => c.id === selectedCompany)?.name} | Full Year {selectedYear}
            </p>
          </div>
          {/* Year Selector */}
          <div className="flex items-center gap-2 mr-6">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setSelectedYear(y => Math.max(2024, y - 1))}
              disabled={selectedYear <= 2024}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <Calendar className="w-5 h-5" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-white text-xl font-bold cursor-pointer focus:outline-none"
              >
                {availableYears.map(year => (
                  <option key={year} value={year} className="text-gray-900">
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setSelectedYear(y => Math.min(2040, y + 1))}
              disabled={selectedYear >= 2040}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold">{Math.round(completedTasks / totalTasks * 100) || 0}%</div>
              <div className="text-sm text-gray-400">Overall Progress</div>
            </div>
            <div className="w-px h-12 bg-gray-600" />
            <div className="flex gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">{completedTasks}</div>
                <div className="text-xs text-gray-400">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{inProgressTasks}</div>
                <div className="text-xs text-gray-400">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-400">{totalTasks - completedTasks - inProgressTasks}</div>
                <div className="text-xs text-gray-400">Planned</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Filter Tabs */}
      <Card className="p-2">
        <Tabs value={selectedCompany} onValueChange={handleCompanyChange}>
          <TabsList className="w-full h-auto flex-wrap gap-2 bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-gray-900 data-[state=active]:text-white px-4 py-2.5 rounded-lg border border-transparent data-[state=active]:border-gray-900"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              All Companies
            </TabsTrigger>
            {companies.map(company => {
              const isSelected = selectedCompany === company.id;
              return (
                <div key={company.id} className="relative group">
                  <TabsTrigger
                    value={company.id}
                    className="px-4 py-2.5 rounded-lg border-2 transition-all pr-10"
                    style={{
                      backgroundColor: isSelected ? company.color : company.bgColor,
                      borderColor: company.color,
                      color: isSelected ? 'white' : company.color,
                    }}
                  >
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-6 h-6 rounded-md mr-2 object-contain"
                        style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'white' }}
                      />
                    ) : (
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center mr-2"
                        style={{
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'white',
                          color: company.color,
                        }}
                      >
                        {company.icon}
                      </div>
                    )}
                    <span className="font-medium">{company.name}</span>
                  </TabsTrigger>
                  <button
                    onClick={(e) => openCompanySettings(company.id, e)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10"
                    style={{ color: isSelected ? 'white' : company.color }}
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </TabsList>
        </Tabs>
      </Card>

      {/* Company Settings Modal */}
      {editingCompany && (() => {
        const company = companies.find(c => c.id === editingCompany);
        if (!company) return null;
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Company Settings</CardTitle>
                  <button
                    onClick={() => setEditingCompany(null)}
                    className="p-1.5 rounded-md hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Name */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: tempColor, color: 'white' }}
                  >
                    {tempLogo ? (
                      <img src={tempLogo} alt="" className="w-8 h-8 rounded object-contain bg-white" />
                    ) : (
                      company.icon
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{company.name}</div>
                    <div className="text-sm text-muted-foreground">{company.shortName}</div>
                  </div>
                </div>

                {/* Logo URL */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Logo URL
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={tempLogo}
                    onChange={(e) => setTempLogo(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a URL to your company logo image
                  </p>
                </div>

                {/* Brand Color */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Pipette className="w-4 h-4" />
                    Brand Color
                  </Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={tempColor}
                      onChange={(e) => setTempColor(e.target.value)}
                      className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-200"
                    />
                    <Input
                      type="text"
                      value={tempColor}
                      onChange={(e) => setTempColor(e.target.value)}
                      className="font-mono uppercase"
                      maxLength={7}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {presetColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setTempColor(color)}
                        className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                          tempColor === color ? 'border-gray-900 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div
                    className="p-3 rounded-lg border-2 flex items-center gap-3"
                    style={{ borderColor: tempColor, backgroundColor: tempColor + '15' }}
                  >
                    {tempLogo ? (
                      <img
                        src={tempLogo}
                        alt=""
                        className="w-8 h-8 rounded-md object-contain bg-white"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center bg-white"
                        style={{ color: tempColor }}
                      >
                        {company.icon}
                      </div>
                    )}
                    <span className="font-medium" style={{ color: tempColor }}>
                      {company.name}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditingCompany(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    style={{ backgroundColor: tempColor }}
                    onClick={saveCompanySettings}
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Department Filter */}
      {availableDepts.length > 0 && (
        <Card className="p-2">
          <Tabs value={selectedDept} onValueChange={setSelectedDept}>
            <TabsList className="w-full h-auto flex-wrap gap-1 bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-white px-3 py-1.5 text-sm"
              >
                All Departments
              </TabsTrigger>
              {availableDepts.map(dept => (
                <TabsTrigger
                  key={dept.id}
                  value={dept.id}
                  className="px-3 py-1.5 text-sm data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                >
                  {dept.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </Card>
      )}

      {/* Skill Filter */}
      <Card className="p-2">
        <Tabs value={selectedSkill} onValueChange={setSelectedSkill}>
          <TabsList className="w-full h-auto flex-wrap gap-1 bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-gray-600 data-[state=active]:text-white px-3 py-1.5 text-sm"
            >
              <Filter className="w-3 h-3 mr-1.5" />
              All Skills
            </TabsTrigger>
            {skills.map(skill => (
              <TabsTrigger
                key={skill.id}
                value={skill.id}
                className="px-3 py-1.5 text-sm data-[state=active]:text-white flex items-center gap-1.5"
                style={{
                  '--skill-color': skill.color,
                } as React.CSSProperties}
              >
                <span
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${skill.color}20`, color: skill.color }}
                >
                  {skill.icon}
                </span>
                {skill.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            <Eye className="w-4 h-4 mr-1" /> Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            <EyeOff className="w-4 h-4 mr-1" /> Collapse All
          </Button>
        </div>
        <div className="flex items-center gap-4">
          {/* Show Empty Departments Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="show-empty"
              checked={showEmptyDepts}
              onCheckedChange={setShowEmptyDepts}
            />
            <Label htmlFor="show-empty" className="text-sm cursor-pointer">
              Show Empty Depts
            </Label>
          </div>
          <div className="w-px h-6 bg-gray-300" />
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 15))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-14 text-center font-medium">{zoom}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(150, zoom + 15))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <Card className="overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <div style={{ minWidth: `${280 + periods.length * cellWidth}px` }}>
            {/* Month Headers */}
            <div className="flex border-b bg-gray-100 sticky top-0 z-20">
              <div className="w-[280px] min-w-[280px] p-3 font-bold text-sm border-r bg-gray-50">
                {selectedCompany === 'all' ? 'Company / Department' : 'Department / Tasks'}
              </div>
              {months.map((month) => (
                <div
                  key={month}
                  className="text-center font-bold py-3 border-r bg-gray-100 text-gray-700"
                  style={{ width: `${cellWidth * 3}px` }}
                >
                  {month} {selectedYear}
                </div>
              ))}
            </div>

            {/* Period Sub-headers */}
            <div className="flex border-b bg-gray-50">
              <div className="w-[280px] min-w-[280px] p-1 text-xs text-muted-foreground border-r" />
              {periods.map((p, i) => (
                <div
                  key={i}
                  className={`text-center text-[10px] py-1 border-r ${
                    isCurrentYear && i === currentPeriod
                      ? 'bg-blue-500 text-white font-bold'
                      : 'text-muted-foreground'
                  }`}
                  style={{ width: `${cellWidth}px` }}
                >
                  {p.period}
                </div>
              ))}
            </div>

            {/* Company Sections */}
            {filteredCompanies.map(company => (
              <div key={company.id}>
                {/* Company Header Row (only show in "all" view) */}
                {selectedCompany === 'all' && (
                  <div
                    className="flex border-b"
                    style={{ backgroundColor: company.bgColor }}
                  >
                    <div className="w-[280px] min-w-[280px] p-3 border-r flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: 'white', color: company.color }}
                      >
                        {company.icon}
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: company.color }}>
                          {company.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {company.departments.filter(d => d.tasks.length > 0).length} active / {company.departments.length} depts
                        </div>
                      </div>
                    </div>
                    <div className="flex-1" />
                  </div>
                )}

                {/* Department Rows */}
                {company.departments.map(dept => {
                  const isExpanded = expandedDepts.has(dept.id);

                  return (
                    <div key={dept.id}>
                      {/* Department Header */}
                      <div
                        className="flex border-b cursor-pointer hover:bg-gray-50/50 transition-all"
                        onClick={() => toggleDept(dept.id)}
                      >
                        <div
                          className="w-[280px] min-w-[280px] p-2 border-r flex items-center gap-2"
                          style={{ paddingLeft: selectedCompany === 'all' ? '2rem' : '1rem' }}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                          <div
                            className="p-1 rounded"
                            style={{ backgroundColor: company.bgColor, color: company.color }}
                          >
                            {dept.icon}
                          </div>
                          <span className="font-medium text-sm truncate">{dept.name}</span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            {dept.tasks.length}
                          </Badge>
                        </div>

                        {/* Collapsed view - show task bars in mini format */}
                        {!isExpanded && (
                          <div className="relative flex-1" style={{ height: `${rowHeight}px` }}>
                            <div className="absolute inset-0 flex">
                              {periods.map((_, i) => (
                                <div
                                  key={i}
                                  className={`border-r border-dashed ${
                                    isCurrentYear && i === currentPeriod
                                      ? 'bg-blue-100/50 border-blue-300'
                                      : 'border-gray-200'
                                  }`}
                                  style={{ width: `${cellWidth}px` }}
                                />
                              ))}
                            </div>
                            {dept.tasks.length === 0 ? (
                              <div className="absolute inset-0 flex items-center px-4">
                                <span className="text-xs text-muted-foreground italic">No tasks assigned</span>
                              </div>
                            ) : (
                              dept.tasks.map(task => (
                                <div
                                  key={task.id}
                                  className="absolute top-3 rounded-full"
                                  style={{
                                    left: `${task.startPeriod * cellWidth}px`,
                                    width: `${(task.endPeriod - task.startPeriod) * cellWidth - 2}px`,
                                    height: '6px',
                                    backgroundColor: company.color,
                                    opacity: task.status === 'completed' ? 1 : 0.5,
                                  }}
                                />
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* Task Rows (when expanded) */}
                      {isExpanded && dept.tasks.length === 0 ? (
                        <div className="flex border-b bg-gray-50/30">
                          <div className="w-[280px] min-w-[280px] p-3 pl-16 text-sm border-r">
                            <span className="text-muted-foreground italic">No tasks in this department</span>
                          </div>
                          <div className="relative flex-1" style={{ height: `${rowHeight}px` }}>
                            <div className="absolute inset-0 flex">
                              {periods.map((_, i) => (
                                <div
                                  key={i}
                                  className={`border-r border-dashed ${
                                    isCurrentYear && i === currentPeriod
                                      ? 'bg-blue-100/50 border-blue-300'
                                      : 'border-gray-100'
                                  }`}
                                  style={{ width: `${cellWidth}px` }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : isExpanded && dept.tasks.map(task => {
                        const taskSkill = skills.find(s => s.id === task.skill);
                        return (
                        <div key={task.id} className="flex border-b hover:bg-gray-50/30">
                          <div
                            className="w-[280px] min-w-[280px] p-2 pl-12 text-sm border-r flex items-center gap-2"
                          >
                            {taskSkill && (
                              <span
                                className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${taskSkill.color}20`, color: taskSkill.color }}
                                title={taskSkill.name}
                              >
                                {taskSkill.icon}
                              </span>
                            )}
                            <span className="truncate text-muted-foreground">{task.name}</span>
                          </div>

                          {/* Task Grid */}
                          <div className="relative flex-1" style={{ height: `${rowHeight}px` }}>
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex">
                              {periods.map((_, i) => (
                                <div
                                  key={i}
                                  className={`border-r border-dashed ${
                                    isCurrentYear && i === currentPeriod
                                      ? 'bg-blue-100/50 border-blue-300'
                                      : 'border-gray-200'
                                  }`}
                                  style={{ width: `${cellWidth}px` }}
                                />
                              ))}
                            </div>

                            {/* Single Task Bar */}
                            <TaskBar
                              task={task}
                              companyColor={company.color}
                              cellWidth={cellWidth}
                              rowHeight={rowHeight}
                              onTaskUpdate={(taskId, start, end) =>
                                handleTaskUpdate(company.id, dept.id, taskId, start, end)
                              }
                              onTaskSelect={handleTaskSelect}
                              companyName={company.name}
                              deptName={dept.name}
                            />
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Selected Task Panel */}
      {selectedTask && (() => {
        const selectedSkillInfo = skills.find(s => s.id === selectedTask.task.skill);
        return (
        <Card className="border-l-4" style={{ borderLeftColor: companies.find(c => c.name === selectedTask.company)?.color }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{selectedTask.task.name}</CardTitle>
              <div className="flex items-center gap-2">
                {selectedSkillInfo && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1"
                    style={{ borderColor: selectedSkillInfo.color, color: selectedSkillInfo.color }}
                  >
                    {selectedSkillInfo.icon}
                    {selectedSkillInfo.name}
                  </Badge>
                )}
                <Badge className={
                  selectedTask.task.status === 'completed' ? 'bg-green-500' :
                  selectedTask.task.status === 'in_progress' ? 'bg-yellow-500' :
                  'bg-gray-400'
                }>
                  {selectedTask.task.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Company</div>
                <div className="font-medium">{selectedTask.company}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Department</div>
                <div className="font-medium">{selectedTask.dept}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Required Skill</div>
                <div className="font-medium flex items-center gap-1.5">
                  {selectedSkillInfo && (
                    <>
                      <span style={{ color: selectedSkillInfo.color }}>{selectedSkillInfo.icon}</span>
                      {selectedSkillInfo.name}
                    </>
                  )}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Timeline</div>
                <div className="font-medium">
                  {periods[selectedTask.task.startPeriod]?.month} {periods[selectedTask.task.startPeriod]?.period} → {periods[selectedTask.task.endPeriod - 1]?.month} {periods[selectedTask.task.endPeriod - 1]?.period}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        );
      })()}

      {/* Legend */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <span className="font-semibold text-muted-foreground">Status:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span>Planned</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <span className="text-muted-foreground">Click company cards or tabs to filter | Drag tasks to move | Drag edges to resize</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
