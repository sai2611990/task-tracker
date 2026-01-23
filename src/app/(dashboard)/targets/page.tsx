'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Target,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  MoreVertical,
  AlertTriangle,
  X,
  Loader2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

type TargetStatus = 'draft' | 'frozen' | 'achieved';

interface DepartmentTarget {
  id: string;
  companyId: string;
  companyName: string;
  departmentId: string;
  departmentName: string;
  objective: string;
  description: string;
  timeline: string;
  status: TargetStatus;
  progress: number;
  keyResults: string[];
}

const statusConfig: Record<TargetStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: <Unlock className="w-4 h-4" /> },
  frozen: { label: 'Frozen', color: 'bg-blue-100 text-blue-700', icon: <Lock className="w-4 h-4" /> },
  achieved: { label: 'Achieved', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-4 h-4" /> },
};

export default function TargetsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [targets, setTargets] = useState<DepartmentTarget[]>([]);

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

        // Fetch unique departments
        const { data: deptsData } = await supabase
          .from('departments')
          .select('id, name')
          .order('name');

        // Fetch targets (if department_targets table exists)
        const { data: targetsData } = await supabase
          .from('department_targets')
          .select('*, departments(name, company_id, companies(name, color))');

        setCompanies(companiesData || []);

        // Get unique departments
        const uniqueDepts = new Map<string, Department>();
        (deptsData || []).forEach(d => {
          if (!uniqueDepts.has(d.name)) {
            uniqueDepts.set(d.name, { id: d.id, name: d.name });
          }
        });
        setDepartments(Array.from(uniqueDepts.values()));

        // Transform targets data
        const transformedTargets: DepartmentTarget[] = (targetsData || []).map((t: any) => ({
          id: t.id,
          companyId: t.departments?.company_id || '',
          companyName: t.departments?.companies?.name || 'Unknown',
          departmentId: t.department_id,
          departmentName: t.departments?.name || 'Unknown',
          objective: t.objective || '',
          description: t.description || '',
          timeline: t.timeline || 'Q1 2026',
          status: t.status as TargetStatus,
          progress: t.progress || 0,
          keyResults: t.key_results || [],
        }));

        setTargets(transformedTargets);
      } catch (error) {
        console.error('Error fetching targets:', error);
        // Set empty arrays on error - table might not exist yet
        setTargets([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Dialog states
  const [addTargetOpen, setAddTargetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DepartmentTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DepartmentTarget | null>(null);
  const [freezeTarget, setFreezeTarget] = useState<DepartmentTarget | null>(null);
  const [unfreezeTarget, setUnfreezeTarget] = useState<DepartmentTarget | null>(null);
  const [achieveTarget, setAchieveTarget] = useState<DepartmentTarget | null>(null);

  // Form states
  const [formCompanyId, setFormCompanyId] = useState('novacube');
  const [formDepartmentId, setFormDepartmentId] = useState('it');
  const [formObjective, setFormObjective] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTimeline, setFormTimeline] = useState('Q1 2026');
  const [formProgress, setFormProgress] = useState(0);
  const [formKeyResults, setFormKeyResults] = useState('');

  // Handlers
  const handleAddTarget = () => {
    setFormCompanyId('novacube');
    setFormDepartmentId('it');
    setFormObjective('');
    setFormDescription('');
    setFormTimeline('Q1 2026');
    setFormProgress(0);
    setFormKeyResults('');
    setAddTargetOpen(true);
  };

  const saveNewTarget = () => {
    if (!formObjective.trim()) return;
    const company = companies.find(c => c.id === formCompanyId);
    const dept = departments.find(d => d.id === formDepartmentId);
    const newTarget: DepartmentTarget = {
      id: `t-${Date.now()}`,
      companyId: formCompanyId,
      companyName: company?.name || '',
      departmentId: formDepartmentId,
      departmentName: dept?.name || '',
      objective: formObjective.trim(),
      description: formDescription.trim(),
      timeline: formTimeline,
      status: 'draft',
      progress: formProgress,
      keyResults: formKeyResults.split('\n').filter(kr => kr.trim()),
    };
    setTargets(prev => [...prev, newTarget]);
    setAddTargetOpen(false);
  };

  const handleEditTarget = (target: DepartmentTarget) => {
    setFormCompanyId(target.companyId);
    setFormDepartmentId(target.departmentId);
    setFormObjective(target.objective);
    setFormDescription(target.description);
    setFormTimeline(target.timeline);
    setFormProgress(target.progress);
    setFormKeyResults(target.keyResults.join('\n'));
    setEditTarget(target);
  };

  const saveEditTarget = () => {
    if (!editTarget || !formObjective.trim()) return;
    const company = companies.find(c => c.id === formCompanyId);
    const dept = departments.find(d => d.id === formDepartmentId);
    setTargets(prev => prev.map(t =>
      t.id === editTarget.id
        ? {
            ...t,
            companyId: formCompanyId,
            companyName: company?.name || '',
            departmentId: formDepartmentId,
            departmentName: dept?.name || '',
            objective: formObjective.trim(),
            description: formDescription.trim(),
            timeline: formTimeline,
            progress: formProgress,
            keyResults: formKeyResults.split('\n').filter(kr => kr.trim()),
          }
        : t
    ));
    setEditTarget(null);
  };

  const handleFreezeTarget = () => {
    if (!freezeTarget) return;
    setTargets(prev => prev.map(t =>
      t.id === freezeTarget.id ? { ...t, status: 'frozen' as TargetStatus } : t
    ));
    setFreezeTarget(null);
  };

  const handleUnfreezeTarget = () => {
    if (!unfreezeTarget) return;
    setTargets(prev => prev.map(t =>
      t.id === unfreezeTarget.id ? { ...t, status: 'draft' as TargetStatus } : t
    ));
    setUnfreezeTarget(null);
  };

  const handleAchieveTarget = () => {
    if (!achieveTarget) return;
    setTargets(prev => prev.map(t =>
      t.id === achieveTarget.id ? { ...t, status: 'achieved' as TargetStatus, progress: 100 } : t
    ));
    setAchieveTarget(null);
  };

  const handleDeleteTarget = () => {
    if (!deleteTarget) return;
    setTargets(prev => prev.filter(t => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const filteredTargets = targets.filter(target => {
    if (selectedCompany !== 'all' && target.companyId !== selectedCompany) return false;
    if (selectedStatus !== 'all' && target.status !== selectedStatus) return false;
    if (searchQuery && !target.objective.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: filteredTargets.length,
    draft: filteredTargets.filter(t => t.status === 'draft').length,
    frozen: filteredTargets.filter(t => t.status === 'frozen').length,
    achieved: filteredTargets.filter(t => t.status === 'achieved').length,
    avgProgress: Math.round(filteredTargets.reduce((sum, t) => sum + t.progress, 0) / filteredTargets.length) || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading targets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Department Targets</h1>
          <p className="text-muted-foreground mt-1">
            Set and track OKRs for each department across your companies
          </p>
        </div>
        <Button onClick={handleAddTarget}>
          <Plus className="w-4 h-4 mr-2" />
          Add Target
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Targets</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Unlock className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.draft}</div>
                <div className="text-sm text-muted-foreground">Draft</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.frozen}</div>
                <div className="text-sm text-muted-foreground">Frozen</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.achieved}</div>
                <div className="text-sm text-muted-foreground">Achieved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100">
                <TrendingUp className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.avgProgress}%</div>
                <div className="text-sm text-muted-foreground">Avg Progress</div>
              </div>
            </div>
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
                placeholder="Search targets..."
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

            <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
              <TabsList>
                <TabsTrigger value="all">All Status</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="frozen">Frozen</TabsTrigger>
                <TabsTrigger value="achieved">Achieved</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Targets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTargets.map(target => {
          const company = companies.find(c => c.id === target.companyId);
          const status = statusConfig[target.status];

          return (
            <Card key={target.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        style={{ borderColor: company?.color, color: company?.color }}
                      >
                        {target.companyName}
                      </Badge>
                      <Badge variant="outline">{target.departmentName}</Badge>
                      <Badge className={status.color}>
                        {status.icon}
                        <span className="ml-1">{status.label}</span>
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{target.objective}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{target.description}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditTarget(target)}>Edit</DropdownMenuItem>
                      {target.status === 'draft' && (
                        <DropdownMenuItem onClick={() => setFreezeTarget(target)}>
                          <Lock className="w-4 h-4 mr-2" />
                          Freeze Target
                        </DropdownMenuItem>
                      )}
                      {target.status === 'frozen' && (
                        <>
                          <DropdownMenuItem onClick={() => setUnfreezeTarget(target)}>
                            <Unlock className="w-4 h-4 mr-2" />
                            Unfreeze
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setAchieveTarget(target)}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark Achieved
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem className="text-red-600" onClick={() => setDeleteTarget(target)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Timeline */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Timeline:</span>
                    <span className="font-medium">{target.timeline}</span>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{target.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${target.progress}%`,
                          backgroundColor: target.progress >= 70 ? '#10B981' : target.progress >= 40 ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    </div>
                  </div>

                  {/* Key Results */}
                  <div>
                    <div className="text-sm font-medium mb-2">Key Results</div>
                    <div className="space-y-1">
                      {target.keyResults.map((kr, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {kr}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTargets.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No targets found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or create a new target</p>
        </div>
      )}

      {/* Add Target Dialog */}
      <Dialog open={addTargetOpen} onOpenChange={setAddTargetOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Target</DialogTitle>
            <DialogDescription>Create a new department target/OKR</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Select value={formCompanyId} onValueChange={setFormCompanyId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={formDepartmentId} onValueChange={setFormDepartmentId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Objective</Label>
              <Input
                value={formObjective}
                onChange={(e) => setFormObjective(e.target.value)}
                placeholder="Enter target objective"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe the target"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Timeline</Label>
                <Select value={formTimeline} onValueChange={setFormTimeline}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                    <SelectItem value="Q2 2026">Q2 2026</SelectItem>
                    <SelectItem value="Q3 2026">Q3 2026</SelectItem>
                    <SelectItem value="Q4 2026">Q4 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Progress (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formProgress}
                  onChange={(e) => setFormProgress(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Key Results (one per line)</Label>
              <Textarea
                value={formKeyResults}
                onChange={(e) => setFormKeyResults(e.target.value)}
                placeholder="Enter key results, one per line"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTargetOpen(false)}>Cancel</Button>
            <Button onClick={saveNewTarget} disabled={!formObjective.trim()}>Create Target</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Target Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Target</DialogTitle>
            <DialogDescription>Update target details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Select value={formCompanyId} onValueChange={setFormCompanyId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={formDepartmentId} onValueChange={setFormDepartmentId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Objective</Label>
              <Input
                value={formObjective}
                onChange={(e) => setFormObjective(e.target.value)}
                placeholder="Enter target objective"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe the target"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Timeline</Label>
                <Select value={formTimeline} onValueChange={setFormTimeline}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                    <SelectItem value="Q2 2026">Q2 2026</SelectItem>
                    <SelectItem value="Q3 2026">Q3 2026</SelectItem>
                    <SelectItem value="Q4 2026">Q4 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Progress (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formProgress}
                  onChange={(e) => setFormProgress(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Key Results (one per line)</Label>
              <Textarea
                value={formKeyResults}
                onChange={(e) => setFormKeyResults(e.target.value)}
                placeholder="Enter key results, one per line"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={saveEditTarget} disabled={!formObjective.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Freeze Target Dialog */}
      <Dialog open={!!freezeTarget} onOpenChange={(open) => !open && setFreezeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Freeze Target</DialogTitle>
            <DialogDescription>
              Once frozen, this target cannot be edited. Are you sure you want to freeze &quot;{freezeTarget?.objective}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFreezeTarget(null)}>Cancel</Button>
            <Button onClick={handleFreezeTarget}>
              <Lock className="w-4 h-4 mr-2" />
              Freeze Target
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unfreeze Target Dialog */}
      <Dialog open={!!unfreezeTarget} onOpenChange={(open) => !open && setUnfreezeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unfreeze Target</DialogTitle>
            <DialogDescription>
              This will move the target back to draft status. Are you sure you want to unfreeze &quot;{unfreezeTarget?.objective}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnfreezeTarget(null)}>Cancel</Button>
            <Button onClick={handleUnfreezeTarget}>
              <Unlock className="w-4 h-4 mr-2" />
              Unfreeze Target
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Achieved Dialog */}
      <Dialog open={!!achieveTarget} onOpenChange={(open) => !open && setAchieveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Target as Achieved</DialogTitle>
            <DialogDescription>
              This will mark &quot;{achieveTarget?.objective}&quot; as achieved and set progress to 100%.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAchieveTarget(null)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleAchieveTarget}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark Achieved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Target Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Target</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.objective}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTarget}>Delete Target</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
