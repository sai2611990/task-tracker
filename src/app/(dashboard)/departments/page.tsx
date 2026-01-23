
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import {
  Building2,
  Cpu,
  Factory,
  GraduationCap,
  Megaphone,
  HeadphonesIcon,
  Rocket,
  Briefcase,
  Plus,
  Search,
  MoreVertical,
  Users,
  CheckSquare,
  TrendingUp,
  Edit,
  Trash2,
  Loader2,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

interface Company {
  id: string;
  name: string;
  short_name: string;
  color: string;
}

interface Department {
  id: string;
  name: string;
}

// Helper to get department icon
const getDeptIcon = (deptName: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    'IT Department': <Cpu className="w-5 h-5" />,
    'Manufacturing': <Factory className="w-5 h-5" />,
    'Operations': <Building2 className="w-5 h-5" />,
    'Training': <GraduationCap className="w-5 h-5" />,
    'Sales': <Megaphone className="w-5 h-5" />,
    'Marketing': <Megaphone className="w-5 h-5" />,
    'Support': <HeadphonesIcon className="w-5 h-5" />,
    'R&D': <Rocket className="w-5 h-5" />,
    'Investor Relations': <Rocket className="w-5 h-5" />,
    'Human Resources': <Briefcase className="w-5 h-5" />,
  };
  return iconMap[deptName] || <Layers className="w-5 h-5" />;
};

export default function DepartmentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentStats, setDepartmentStats] = useState<Record<string, { tasks: number; members: number; progress: number }>>({});

  // Dialog states
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [deleteDept, setDeleteDept] = useState<Department | null>(null);

  // Form state
  const [formDeptName, setFormDeptName] = useState('');

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

        // Fetch unique department names
        const { data: deptsData } = await supabase
          .from('departments')
          .select('id, name')
          .order('name');

        // Fetch tasks for stats
        const { data: tasksData } = await supabase
          .from('timeline_tasks')
          .select('department_id, status');

        setCompanies(companiesData || []);

        // Get unique department names
        const uniqueDepts = new Map<string, Department>();
        (deptsData || []).forEach(d => {
          if (!uniqueDepts.has(d.name)) {
            uniqueDepts.set(d.name, { id: d.id, name: d.name });
          }
        });
        setDepartments(Array.from(uniqueDepts.values()));

        // Calculate stats per department
        const stats: Record<string, { tasks: number; members: number; progress: number }> = {};
        uniqueDepts.forEach((dept, name) => {
          const deptTasks = (tasksData || []).filter(t => {
            const deptIds = (deptsData || []).filter(d => d.name === name).map(d => d.id);
            return deptIds.includes(t.department_id);
          });
          const completed = deptTasks.filter(t => t.status === 'completed').length;
          stats[dept.id] = {
            tasks: deptTasks.length,
            members: Math.floor(Math.random() * 8) + 2, // Placeholder
            progress: deptTasks.length > 0 ? Math.round((completed / deptTasks.length) * 100) : 0,
          };
        });
        setDepartmentStats(stats);
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handlers
  const handleAddDept = () => {
    setFormDeptName('');
    setAddDeptOpen(true);
  };

  const saveNewDept = () => {
    if (!formDeptName.trim()) return;
    const newDept: Department = {
      id: formDeptName.toLowerCase().replace(/\s+/g, '-'),
      name: formDeptName.trim(),
    };
    setDepartments(prev => [...prev, newDept]);
    setAddDeptOpen(false);
  };

  const handleEditDept = (dept: Department) => {
    setFormDeptName(dept.name);
    setEditDept(dept);
  };

  const saveEditDept = () => {
    if (!editDept || !formDeptName.trim()) return;
    setDepartments(prev => prev.map(d =>
      d.id === editDept.id ? { ...d, name: formDeptName.trim() } : d
    ));
    setEditDept(null);
  };

  const handleDeleteDept = () => {
    if (!deleteDept) return;
    setDepartments(prev => prev.filter(d => d.id !== deleteDept.id));
    setDeleteDept(null);
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompanies = selectedCompany === 'all'
    ? companies
    : companies.filter(c => c.id === selectedCompany);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Departments</h1>
          <p className="text-muted-foreground mt-1">
            Manage departments across all your companies
          </p>
        </div>
        <Button onClick={handleAddDept}>
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={selectedCompany} onValueChange={setSelectedCompany}>
          <TabsList>
            <TabsTrigger value="all">All Companies</TabsTrigger>
            {companies.map(company => (
              <TabsTrigger key={company.id} value={company.id}>
                {company.short_name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepartments.map(dept => {
          const stats = departmentStats[dept.id] || { tasks: 0, members: 0, progress: 0 };
          const icon = getDeptIcon(dept.name);

          return (
            <Card key={dept.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{dept.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditDept(dept)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => setDeleteDept(dept)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-muted">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <CheckSquare className="w-3 h-3" />
                        <span className="text-xs">Tasks</span>
                      </div>
                      <div className="text-lg font-semibold">{stats.tasks}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span className="text-xs">Members</span>
                      </div>
                      <div className="text-lg font-semibold">{stats.members}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs">Progress</span>
                      </div>
                      <div className="text-lg font-semibold">{stats.progress}%</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Overall Progress</span>
                      <span>{stats.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${stats.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Company Badges */}
                  <div className="flex flex-wrap gap-1">
                    {filteredCompanies.slice(0, 3).map(company => (
                      <Badge
                        key={company.id}
                        variant="outline"
                        style={{ borderColor: company.color, color: company.color }}
                      >
                        {company.short_name}
                      </Badge>
                    ))}
                    {filteredCompanies.length > 3 && (
                      <Badge variant="outline">+{filteredCompanies.length - 3}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No departments found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Add Department Dialog */}
      <Dialog open={addDeptOpen} onOpenChange={setAddDeptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>Create a new department for your companies</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Department Name</Label>
              <Input
                value={formDeptName}
                onChange={(e) => setFormDeptName(e.target.value)}
                placeholder="Enter department name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDeptOpen(false)}>Cancel</Button>
            <Button onClick={saveNewDept} disabled={!formDeptName.trim()}>Add Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={!!editDept} onOpenChange={(open) => !open && setEditDept(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Update department name</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Department Name</Label>
              <Input
                value={formDeptName}
                onChange={(e) => setFormDeptName(e.target.value)}
                placeholder="Enter department name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDept(null)}>Cancel</Button>
            <Button onClick={saveEditDept} disabled={!formDeptName.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Department Dialog */}
      <Dialog open={!!deleteDept} onOpenChange={(open) => !open && setDeleteDept(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteDept?.name}&quot;? This will remove it from all companies.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDept(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteDept}>Delete Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
