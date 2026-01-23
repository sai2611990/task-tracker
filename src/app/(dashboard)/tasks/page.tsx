export const dynamic = 'force-dynamic';

'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  User,
  Sparkles,
  Code,
  TrendingUp,
  GitBranch,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  ChevronDown,
  ArrowUpDown,
  X,
  Trash2,
  Edit,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';

type Skill = 'product_lead' | 'builder' | 'growth_lead' | 'coordinator';

interface Company {
  id: string;
  name: string;
  short_name: string;
  color: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

const skills = [
  { id: 'product_lead', name: 'Product Lead', color: '#8B5CF6' },
  { id: 'builder', name: 'Builder', color: '#3B82F6' },
  { id: 'growth_lead', name: 'Growth Lead', color: '#10B981' },
  { id: 'coordinator', name: 'Coordinator', color: '#F59E0B' },
];

type TaskStatus = 'planning' | 'in_progress' | 'completed' | 'blocked';

interface Task {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  departmentId: string;
  departmentName: string;
  status: TaskStatus;
  skill: Skill;
  assignee?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

const skillIcons: Record<Skill, React.ReactNode> = {
  product_lead: <Sparkles className="w-4 h-4" />,
  builder: <Code className="w-4 h-4" />,
  growth_lead: <TrendingUp className="w-4 h-4" />,
  coordinator: <GitBranch className="w-4 h-4" />,
};

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  planning: <Circle className="w-4 h-4" />,
  in_progress: <Clock className="w-4 h-4" />,
  completed: <CheckCircle2 className="w-4 h-4" />,
  blocked: <AlertCircle className="w-4 h-4" />,
};

const statusColors: Record<TaskStatus, string> = {
  planning: 'bg-gray-100 text-gray-700 border-gray-200',
  in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  blocked: 'bg-red-100 text-red-700 border-red-200',
};

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-orange-100 text-orange-700',
  high: 'bg-red-100 text-red-700',
};

// Helper to convert period to date
function periodToDate(period: number): string {
  const year = 2026;
  const monthIndex = Math.floor(period / 3);
  const periodInMonth = period % 3;
  const day = periodInMonth === 0 ? 10 : periodInMonth === 1 ? 20 : 28;
  const date = new Date(year, monthIndex, day);
  return date.toISOString().split('T')[0];
}

export default function TasksPage() {
  // Loading and data states
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Filter states
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusChangeTask, setStatusChangeTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [assignTask, setAssignTask] = useState<Task | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({ name: '', dueDate: '', priority: 'medium' as 'low' | 'medium' | 'high' });

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const supabase = createClient();

      try {
        // Fetch companies
        const { data: companiesData } = await supabase
          .from('companies')
          .select('id, name, short_name, color')
          .order('name');

        // Fetch team members
        const { data: membersData } = await supabase
          .from('profiles')
          .select('id, name, email')
          .order('name');

        // Fetch tasks with departments and companies
        const { data: tasksData } = await supabase
          .from('timeline_tasks')
          .select('*, departments(id, name, company_id, companies(id, name, short_name, color))')
          .order('start_period');

        setCompanies(companiesData || []);
        setTeamMembers(membersData || []);

        // Transform tasks
        const transformedTasks: Task[] = (tasksData || []).map((task: any) => ({
          id: task.id,
          name: task.name,
          companyId: task.departments?.company_id || '',
          companyName: task.departments?.companies?.name || 'Unknown',
          departmentId: task.department_id,
          departmentName: task.departments?.name || 'Unknown',
          status: task.status as TaskStatus,
          skill: task.skill as Skill,
          assignee: task.assigned_to ? (membersData?.find(m => m.id === task.assigned_to)?.name) : undefined,
          dueDate: periodToDate(task.end_period),
          priority: 'medium' as const, // Default priority
        }));

        setTasks(transformedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handlers
  const handleEditTask = (task: Task) => {
    setEditForm({ name: task.name, dueDate: task.dueDate, priority: task.priority });
    setEditingTask(task);
  };

  const saveEditTask = () => {
    if (!editingTask) return;
    setTasks(prev => prev.map(t =>
      t.id === editingTask.id
        ? { ...t, name: editForm.name, dueDate: editForm.dueDate, priority: editForm.priority }
        : t
    ));
    setEditingTask(null);
  };

  const handleChangeStatus = (task: Task, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, status: newStatus } : t
    ));
    setStatusChangeTask(null);
  };

  const handleDeleteTask = () => {
    if (!deleteTask) return;
    setTasks(prev => prev.filter(t => t.id !== deleteTask.id));
    setDeleteTask(null);
  };

  const handleAssignTask = (task: Task, assignee: string | undefined) => {
    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, assignee } : t
    ));
    setAssignTask(null);
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedCompany !== 'all' && task.companyId !== selectedCompany) return false;
    if (selectedStatus !== 'all' && task.status !== selectedStatus) return false;
    if (selectedSkill !== 'all' && task.skill !== selectedSkill) return false;
    if (searchQuery && !task.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
    planning: filteredTasks.filter(t => t.status === 'planning').length,
    blocked: filteredTasks.filter(t => t.status === 'blocked').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all tasks across your companies
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-600">{stats.planning}</div>
            <div className="text-sm text-muted-foreground">Planning</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
            <div className="text-sm text-muted-foreground">Blocked</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Company Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[140px] justify-between">
                  {selectedCompany === 'all' ? 'All Companies' : companies.find(c => c.id === selectedCompany)?.short_name}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedCompany('all')}>All Companies</DropdownMenuItem>
                {companies.map(company => (
                  <DropdownMenuItem key={company.id} onClick={() => setSelectedCompany(company.id)}>
                    {company.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Filter */}
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="planning">Planning</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="blocked">Blocked</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Skill Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[120px] justify-between">
                  <Filter className="w-4 h-4 mr-2" />
                  {selectedSkill === 'all' ? 'All Skills' : skills.find(s => s.id === selectedSkill)?.name}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedSkill('all')}>All Skills</DropdownMenuItem>
                {skills.map(skill => (
                  <DropdownMenuItem key={skill.id} onClick={() => setSelectedSkill(skill.id)}>
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: skill.color }} />
                    {skill.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <Button variant="ghost" className="p-0 h-auto font-semibold">
                  Task <ArrowUpDown className="w-4 h-4 ml-2" />
                </Button>
              </TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Skill</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map(task => {
              const company = companies.find(c => c.id === task.companyId);
              const skillInfo = skills.find(s => s.id === task.skill);

              return (
                <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={{ borderColor: company?.color, color: company?.color }}
                    >
                      {task.companyName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{task.departmentName}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[task.status]} border`}>
                      <span className="mr-1">{statusIcons[task.status]}</span>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span style={{ color: skillInfo?.color }}>{skillIcons[task.skill]}</span>
                      <span className="text-sm">{skillInfo?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {task.assignee.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm">{task.assignee}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[task.priority]}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditTask(task)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusChangeTask(task)}>
                          <Clock className="w-4 h-4 mr-2" />
                          Change Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAssignTask(task)}>
                          <User className="w-4 h-4 mr-2" />
                          Assign
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeleteTask(task)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No tasks found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or create a new task</p>
          </div>
        )}
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to the task details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-name">Task Name</Label>
              <Input
                id="task-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <Button
                    key={p}
                    variant={editForm.priority === p ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEditForm(prev => ({ ...prev, priority: p }))}
                    className={editForm.priority === p ? priorityColors[p] : ''}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>Cancel</Button>
            <Button onClick={saveEditTask}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={!!statusChangeTask} onOpenChange={() => setStatusChangeTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>
              Update the status for "{statusChangeTask?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {(['planning', 'in_progress', 'completed', 'blocked'] as TaskStatus[]).map(status => (
              <Button
                key={status}
                variant="outline"
                className={`justify-start ${statusChangeTask?.status === status ? 'ring-2 ring-primary' : ''}`}
                onClick={() => statusChangeTask && handleChangeStatus(statusChangeTask, status)}
              >
                <span className="mr-2">{statusIcons[status]}</span>
                {status.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={!!assignTask} onOpenChange={() => setAssignTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
            <DialogDescription>
              Select a team member for "{assignTask?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[300px] overflow-y-auto">
            <Button
              variant="outline"
              className={`w-full justify-start ${!assignTask?.assignee ? 'ring-2 ring-primary' : ''}`}
              onClick={() => assignTask && handleAssignTask(assignTask, undefined)}
            >
              <User className="w-4 h-4 mr-2 text-muted-foreground" />
              Unassigned
            </Button>
            {teamMembers.map(member => (
              <Button
                key={member.id}
                variant="outline"
                className={`w-full justify-start ${assignTask?.assignee === member.name ? 'ring-2 ring-primary' : ''}`}
                onClick={() => assignTask && handleAssignTask(assignTask, member.name)}
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium mr-2">
                  {member.name?.split(' ').map(n => n[0]).join('') || '?'}
                </div>
                {member.name || 'Unknown'}
                <span className="ml-auto text-xs text-muted-foreground">{member.email}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTask} onOpenChange={() => setDeleteTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTask?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTask(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
