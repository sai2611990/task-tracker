'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Mail,
  MoreVertical,
  Users,
  Crown,
  Code,
  TrendingUp,
  GitBranch,
  Sparkles,
  X,
  User,
  Briefcase,
  Building2,
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
import { createClient } from '@/lib/supabase/client';

// Types
type Skill = 'product_lead' | 'builder' | 'growth_lead' | 'coordinator';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  skill: Skill;
  role: 'lead' | 'member';
}

// Skills configuration
const skills = [
  { id: 'product_lead', name: 'Product Lead', color: '#8B5CF6', description: 'Vision, strategy, user research & product decisions' },
  { id: 'builder', name: 'Builder', color: '#3B82F6', description: 'Dev + DevOps + QA (AI does the coding)' },
  { id: 'growth_lead', name: 'Growth Lead', color: '#10B981', description: 'Sales, marketing & customer relationships' },
  { id: 'coordinator', name: 'Coordinator', color: '#F59E0B', description: 'Planning, sync & stakeholder management' },
];

const skillIcons: Record<Skill, React.ReactNode> = {
  product_lead: <Sparkles className="w-5 h-5" />,
  builder: <Code className="w-5 h-5" />,
  growth_lead: <TrendingUp className="w-5 h-5" />,
  coordinator: <GitBranch className="w-5 h-5" />,
};

export default function TeamsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Dialog states
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [viewProfileMember, setViewProfileMember] = useState<TeamMember | null>(null);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [changeSkillMember, setChangeSkillMember] = useState<TeamMember | null>(null);
  const [removeMember, setRemoveMember] = useState<TeamMember | null>(null);

  // Form states for new/edit member
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSkill, setFormSkill] = useState<Skill>('builder');
  const [formRole, setFormRole] = useState<'lead' | 'member'>('member');

  // Fetch team members from Supabase
  useEffect(() => {
    async function fetchTeamMembers() {
      setIsLoading(true);
      const supabase = createClient();

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, skill, team_role')
          .order('name');

        if (error) throw error;

        const members: TeamMember[] = (data || []).map(m => ({
          id: m.id,
          name: m.name || 'Unknown',
          email: m.email || '',
          skill: (m.skill || 'builder') as Skill,
          role: (m.team_role || 'member') as 'lead' | 'member',
        }));

        setTeamMembers(members);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamMembers();
  }, []);

  // Handlers
  const handleAddMember = () => {
    setFormName('');
    setFormEmail('');
    setFormSkill('builder');
    setFormRole('member');
    setAddMemberOpen(true);
  };

  const saveNewMember = () => {
    if (!formName.trim() || !formEmail.trim()) return;
    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: formName.trim(),
      email: formEmail.trim(),
      skill: formSkill,
      role: formRole,
    };
    setTeamMembers(prev => [...prev, newMember]);
    setAddMemberOpen(false);
  };

  const handleEditMember = (member: TeamMember) => {
    setFormName(member.name);
    setFormEmail(member.email);
    setFormSkill(member.skill);
    setFormRole(member.role);
    setEditMember(member);
  };

  const saveEditMember = () => {
    if (!editMember || !formName.trim() || !formEmail.trim()) return;
    setTeamMembers(prev => prev.map(m =>
      m.id === editMember.id
        ? { ...m, name: formName.trim(), email: formEmail.trim(), skill: formSkill, role: formRole }
        : m
    ));
    setEditMember(null);
  };

  const handleChangeSkill = (member: TeamMember, newSkill: Skill) => {
    setTeamMembers(prev => prev.map(m =>
      m.id === member.id ? { ...m, skill: newSkill } : m
    ));
    setChangeSkillMember(null);
  };

  const handleRemoveMember = () => {
    if (!removeMember) return;
    setTeamMembers(prev => prev.filter(m => m.id !== removeMember.id));
    setRemoveMember(null);
  };

  const filteredMembers = teamMembers.filter(member => {
    if (selectedSkill !== 'all' && member.skill !== selectedSkill) return false;
    if (searchQuery && !member.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !member.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const skillCounts = skills.map(skill => ({
    ...skill,
    count: teamMembers.filter(m => m.skill === skill.id).length
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage your AI-empowered team across all companies
          </p>
        </div>
        <Button onClick={handleAddMember}>
          <Plus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* AI-Empowered Skills Banner */}
      <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-200">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-violet-900">AI-Empowered Roles</h3>
              <p className="text-sm text-violet-700">
                Modern skill-based roles that leverage AI tools. Fewer titles, more T-shaped generalists.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {skillCounts.map(skill => (
          <Card
            key={skill.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedSkill === skill.id ? 'ring-2' : ''
            }`}
            style={{ '--tw-ring-color': skill.color } as React.CSSProperties}
            onClick={() => setSelectedSkill(selectedSkill === skill.id ? 'all' : skill.id)}
          >
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${skill.color}20`, color: skill.color }}
                >
                  {skillIcons[skill.id as Skill]}
                </div>
                <div>
                  <div className="text-2xl font-bold">{skill.count}</div>
                  <div className="text-xs text-muted-foreground truncate">{skill.name}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={selectedSkill} onValueChange={setSelectedSkill}>
          <TabsList>
            <TabsTrigger value="all">All Skills</TabsTrigger>
            {skills.slice(0, 4).map(skill => (
              <TabsTrigger key={skill.id} value={skill.id}>
                <span
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: skill.color }}
                />
                {skill.name.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMembers.map(member => {
          const skillInfo = skills.find(s => s.id === member.skill);
          const company = member.email.split('@')[1].split('.')[0];

          return (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3"
                    style={{ backgroundColor: skillInfo?.color }}
                  >
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Name & Role */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{member.name}</h3>
                    {member.role === 'lead' && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <Mail className="w-3 h-3" />
                    {member.email}
                  </div>

                  {/* Skill Badge */}
                  <Badge
                    className="mb-3"
                    style={{
                      backgroundColor: `${skillInfo?.color}20`,
                      color: skillInfo?.color,
                      borderColor: skillInfo?.color,
                    }}
                  >
                    <span className="mr-1">{skillIcons[member.skill]}</span>
                    {skillInfo?.name}
                  </Badge>

                  {/* Skill Description */}
                  <p className="text-xs text-muted-foreground mb-4">
                    {skillInfo?.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewProfileMember(member)}>
                      View Profile
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditMember(member)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setViewProfileMember(member)}>Assign Tasks</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setChangeSkillMember(member)}>Change Skill</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => setRemoveMember(member)}>Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No team members found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Add a new member to your team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label>Skill</Label>
              <Select value={formSkill} onValueChange={(v) => setFormSkill(v as Skill)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skills.map(skill => (
                    <SelectItem key={skill.id} value={skill.id}>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: skill.color }} />
                        {skill.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as 'lead' | 'member')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>Cancel</Button>
            <Button onClick={saveNewMember} disabled={!formName.trim() || !formEmail.trim()}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={!!editMember} onOpenChange={(open) => !open && setEditMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>Update member information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label>Skill</Label>
              <Select value={formSkill} onValueChange={(v) => setFormSkill(v as Skill)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skills.map(skill => (
                    <SelectItem key={skill.id} value={skill.id}>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: skill.color }} />
                        {skill.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as 'lead' | 'member')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMember(null)}>Cancel</Button>
            <Button onClick={saveEditMember} disabled={!formName.trim() || !formEmail.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog open={!!viewProfileMember} onOpenChange={(open) => !open && setViewProfileMember(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Team Member Profile</DialogTitle>
          </DialogHeader>
          {viewProfileMember && (() => {
            const skillInfo = skills.find(s => s.id === viewProfileMember.skill);
            return (
              <div className="space-y-6 py-4">
                <div className="flex flex-col items-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3"
                    style={{ backgroundColor: skillInfo?.color }}
                  >
                    {viewProfileMember.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{viewProfileMember.name}</h3>
                    {viewProfileMember.role === 'lead' && <Crown className="w-5 h-5 text-yellow-500" />}
                  </div>
                  <Badge
                    className="mt-2"
                    style={{
                      backgroundColor: `${skillInfo?.color}20`,
                      color: skillInfo?.color,
                    }}
                  >
                    {skillInfo?.name}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="font-medium">{viewProfileMember.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Role</div>
                      <div className="font-medium capitalize">{viewProfileMember.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Company</div>
                      <div className="font-medium capitalize">{viewProfileMember.email.split('@')[1].split('.')[0]}</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Skill Description</div>
                  <p className="text-sm">{skillInfo?.description}</p>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewProfileMember(null)}>Close</Button>
            <Button onClick={() => {
              if (viewProfileMember) {
                handleEditMember(viewProfileMember);
                setViewProfileMember(null);
              }
            }}>Edit Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Skill Dialog */}
      <Dialog open={!!changeSkillMember} onOpenChange={(open) => !open && setChangeSkillMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Skill</DialogTitle>
            <DialogDescription>
              Select a new skill for {changeSkillMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {skills.map(skill => (
              <button
                key={skill.id}
                onClick={() => changeSkillMember && handleChangeSkill(changeSkillMember, skill.id as Skill)}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                  changeSkillMember?.skill === skill.id
                    ? 'border-current'
                    : 'border-transparent bg-muted/50'
                }`}
                style={{ borderColor: changeSkillMember?.skill === skill.id ? skill.color : undefined }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${skill.color}20`, color: skill.color }}
                  >
                    {skillIcons[skill.id as Skill]}
                  </div>
                  <span className="font-medium">{skill.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{skill.description}</p>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeSkillMember(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={!!removeMember} onOpenChange={(open) => !open && setRemoveMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {removeMember?.name} from the team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveMember(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveMember}>Remove Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
