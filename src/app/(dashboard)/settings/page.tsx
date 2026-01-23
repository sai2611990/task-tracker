'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Building2,
  Palette,
  Bell,
  Shield,
  Save,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';

interface Company {
  id: string;
  name: string;
  short_name: string;
  color: string;
  bg_color?: string;
}

const skills = [
  { id: 'product_lead', name: 'Product Lead', color: '#8B5CF6', description: 'Vision, strategy, user research & product decisions' },
  { id: 'builder', name: 'Builder', color: '#3B82F6', description: 'Dev + DevOps + QA (AI does the coding)' },
  { id: 'growth_lead', name: 'Growth Lead', color: '#10B981', description: 'Sales, marketing & customer relationships' },
  { id: 'coordinator', name: 'Coordinator', color: '#F59E0B', description: 'Planning, sync & stakeholder management' },
];

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);

  // Fetch companies from Supabase
  useEffect(() => {
    async function fetchCompanies() {
      setIsLoading(true);
      const supabase = createClient();

      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, short_name, color, bg_color')
          .order('name');

        if (error) throw error;
        setCompanies(data || []);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompanies();
  }, []);
  const [notifications, setNotifications] = useState({
    email: true,
    taskUpdates: true,
    deadlines: true,
    teamChanges: false,
  });

  // Profile state
  const [profileName, setProfileName] = useState('John Doe');
  const [profileEmail, setProfileEmail] = useState('ceo@novacube.com');
  const [profileTitle, setProfileTitle] = useState('CEO');
  const [profileTimezone, setProfileTimezone] = useState('America/New_York');
  const [profileSaved, setProfileSaved] = useState(false);

  // Company dialog states
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [deleteCompany, setDeleteCompany] = useState<Company | null>(null);

  // Company form states
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formCompanyShortName, setFormCompanyShortName] = useState('');
  const [formCompanyColor, setFormCompanyColor] = useState('#3B82F6');

  // Handlers
  const handleSaveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleSaveNotifications = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleSaveAppearance = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleAddCompany = () => {
    setFormCompanyName('');
    setFormCompanyShortName('');
    setFormCompanyColor('#3B82F6');
    setAddCompanyOpen(true);
  };

  const saveNewCompany = () => {
    if (!formCompanyName.trim() || !formCompanyShortName.trim()) return;
    const newCompany: Company = {
      id: `company-${Date.now()}`,
      name: formCompanyName.trim(),
      short_name: formCompanyShortName.trim().toUpperCase(),
      color: formCompanyColor,
      bg_color: `${formCompanyColor}15`,
    };
    setCompanies(prev => [...prev, newCompany]);
    setAddCompanyOpen(false);
  };

  const handleEditCompany = (company: Company) => {
    setFormCompanyName(company.name);
    setFormCompanyShortName(company.short_name);
    setFormCompanyColor(company.color);
    setEditCompany(company);
  };

  const saveEditCompany = () => {
    if (!editCompany || !formCompanyName.trim() || !formCompanyShortName.trim()) return;
    setCompanies(prev => prev.map(c =>
      c.id === editCompany.id
        ? {
            ...c,
            name: formCompanyName.trim(),
            short_name: formCompanyShortName.trim().toUpperCase(),
            color: formCompanyColor,
            bg_color: `${formCompanyColor}15`,
          }
        : c
    ));
    setEditCompany(null);
  };

  const handleDeleteCompany = () => {
    if (!deleteCompany) return;
    setCompanies(prev => prev.filter(c => c.id !== deleteCompany.id));
    setDeleteCompany(null);
  };

  const colorOptions = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Companies
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                  CEO
                </div>
                <div>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={profileTitle} onChange={(e) => setProfileTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" value={profileTimezone} onChange={(e) => setProfileTimezone(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end items-center gap-3">
                {profileSaved && <span className="text-green-600 text-sm flex items-center gap-1"><Check className="w-4 h-4" /> Saved!</span>}
                <Button onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Company Management</CardTitle>
                  <CardDescription>Add, edit or remove companies</CardDescription>
                </div>
                <Button size="sm" onClick={handleAddCompany}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companies.map(company => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: company.color }}
                      >
                        {company.short_name}
                      </div>
                      <div>
                        <h3 className="font-semibold">{company.name}</h3>
                        <p className="text-sm text-muted-foreground">{company.short_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border-2"
                        style={{ backgroundColor: company.color }}
                        title={company.color}
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleEditCompany(company)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => setDeleteCompany(company)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skills Configuration */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Skill Configuration</CardTitle>
              <CardDescription>Manage the lean AI-era skills for your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {skills.map(skill => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${skill.color}20`, color: skill.color }}
                      >
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: skill.color }} />
                      </div>
                      <div>
                        <h4 className="font-medium">{skill.name}</h4>
                        <p className="text-xs text-muted-foreground">{skill.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what updates you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive email updates about your tasks</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Task Updates</h4>
                  <p className="text-sm text-muted-foreground">Get notified when tasks are updated</p>
                </div>
                <Switch
                  checked={notifications.taskUpdates}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, taskUpdates: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Deadline Reminders</h4>
                  <p className="text-sm text-muted-foreground">Receive reminders before task deadlines</p>
                </div>
                <Switch
                  checked={notifications.deadlines}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, deadlines: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Team Changes</h4>
                  <p className="text-sm text-muted-foreground">Get notified about team member changes</p>
                </div>
                <Switch
                  checked={notifications.teamChanges}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, teamChanges: checked }))}
                />
              </div>

              <div className="flex justify-end pt-4 items-center gap-3">
                {profileSaved && <span className="text-green-600 text-sm flex items-center gap-1"><Check className="w-4 h-4" /> Saved!</span>}
                <Button onClick={handleSaveNotifications}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Theme</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border-2 border-primary rounded-lg cursor-pointer bg-white">
                    <div className="w-full h-20 bg-gradient-to-b from-gray-100 to-white rounded mb-2" />
                    <p className="text-sm font-medium text-center">Light</p>
                  </div>
                  <div className="p-4 border rounded-lg cursor-pointer bg-gray-900">
                    <div className="w-full h-20 bg-gradient-to-b from-gray-800 to-gray-900 rounded mb-2" />
                    <p className="text-sm font-medium text-center text-white">Dark</p>
                  </div>
                  <div className="p-4 border rounded-lg cursor-pointer">
                    <div className="w-full h-20 bg-gradient-to-r from-gray-100 to-gray-800 rounded mb-2" />
                    <p className="text-sm font-medium text-center">System</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Accent Color</h4>
                <div className="flex gap-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4'].map(color => (
                    <button
                      key={color}
                      className="w-10 h-10 rounded-lg border-2 border-transparent hover:border-gray-300 transition-all"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Timeline View</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Default zoom level</span>
                    <Input type="number" defaultValue="100" className="w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show empty departments by default</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Expand all departments on load</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 items-center gap-3">
                {profileSaved && <span className="text-green-600 text-sm flex items-center gap-1"><Check className="w-4 h-4" /> Saved!</span>}
                <Button onClick={handleSaveAppearance}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Appearance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Company Dialog */}
      <Dialog open={addCompanyOpen} onOpenChange={setAddCompanyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>Create a new company to manage</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={formCompanyName}
                onChange={(e) => setFormCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label>Short Name (2-3 letters)</Label>
              <Input
                value={formCompanyShortName}
                onChange={(e) => setFormCompanyShortName(e.target.value.slice(0, 3))}
                placeholder="e.g., NC"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Brand Color</Label>
              <div className="flex gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormCompanyColor(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${formCompanyColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="pt-2">
              <div className="p-4 border rounded-lg flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: formCompanyColor }}
                >
                  {formCompanyShortName || '??'}
                </div>
                <div>
                  <h3 className="font-semibold">{formCompanyName || 'Company Name'}</h3>
                  <p className="text-sm text-muted-foreground">{formCompanyShortName || '??'}</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCompanyOpen(false)}>Cancel</Button>
            <Button onClick={saveNewCompany} disabled={!formCompanyName.trim() || !formCompanyShortName.trim()}>Add Company</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog open={!!editCompany} onOpenChange={(open) => !open && setEditCompany(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update company details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={formCompanyName}
                onChange={(e) => setFormCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label>Short Name (2-3 letters)</Label>
              <Input
                value={formCompanyShortName}
                onChange={(e) => setFormCompanyShortName(e.target.value.slice(0, 3))}
                placeholder="e.g., NC"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Brand Color</Label>
              <div className="flex gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormCompanyColor(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${formCompanyColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="pt-2">
              <div className="p-4 border rounded-lg flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: formCompanyColor }}
                >
                  {formCompanyShortName || '??'}
                </div>
                <div>
                  <h3 className="font-semibold">{formCompanyName || 'Company Name'}</h3>
                  <p className="text-sm text-muted-foreground">{formCompanyShortName || '??'}</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCompany(null)}>Cancel</Button>
            <Button onClick={saveEditCompany} disabled={!formCompanyName.trim() || !formCompanyShortName.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Company Dialog */}
      <Dialog open={!!deleteCompany} onOpenChange={(open) => !open && setDeleteCompany(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteCompany?.name}&quot;? This will remove all associated data and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCompany(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCompany}>Delete Company</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
