
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  CheckSquare,
  Target,
  Calendar,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

// Skills configuration
const skills = [
  { id: 'product_lead', name: 'Product Lead', color: '#8B5CF6' },
  { id: 'builder', name: 'Builder', color: '#3B82F6' },
  { id: 'growth_lead', name: 'Growth Lead', color: '#10B981' },
  { id: 'coordinator', name: 'Coordinator', color: '#F59E0B' },
];

// Helper functions
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return 'Just now';
}

function getCurrentPeriod(): number {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();
  const monthOffset = month * 3;
  let periodInMonth = 0;
  if (day >= 21) periodInMonth = 2;
  else if (day >= 11) periodInMonth = 1;
  return monthOffset + periodInMonth;
}

function periodToDate(period: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = Math.floor(period / 3);
  const periodInMonth = period % 3;
  const day = periodInMonth === 0 ? 10 : periodInMonth === 1 ? 20 : 28;
  return `${months[monthIndex]} ${day}`;
}

interface Company {
  id: string;
  name: string;
  short_name: string;
  color: string;
}

interface DashboardStats {
  companies: number;
  teamMembers: number;
  activeTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  targets: number;
  frozenTargets: number;
}

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    companies: 0,
    teamMembers: 0,
    activeTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    targets: 0,
    frozenTargets: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    action: string;
    task: string;
    time: string;
    type: string;
  }>>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Array<{
    task: string;
    company: string;
    date: string;
    urgent: boolean;
  }>>([]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const supabase = createClient();

      try {
        // Fetch companies
        const { data: companiesData } = await supabase
          .from('companies')
          .select('*')
          .order('name');

        // Fetch team members count
        const { count: membersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch tasks stats
        const { data: tasksData } = await supabase
          .from('timeline_tasks')
          .select('status');

        // Fetch targets
        const { data: targetsData } = await supabase
          .from('department_targets')
          .select('status');

        // Calculate stats
        const totalTasks = tasksData?.length || 0;
        const completedTasks = tasksData?.filter(t => t.status === 'completed').length || 0;
        const inProgressTasks = tasksData?.filter(t => t.status === 'in_progress').length || 0;
        const totalTargets = targetsData?.length || 0;
        const frozenTargets = targetsData?.filter(t => t.status === 'frozen').length || 0;

        setCompanies(companiesData || []);
        setStats({
          companies: companiesData?.length || 0,
          teamMembers: membersCount || 0,
          activeTasks: totalTasks,
          completedTasks,
          inProgressTasks,
          targets: totalTargets,
          frozenTargets,
        });

        // Fetch recent tasks for activity
        const { data: recentTasks } = await supabase
          .from('timeline_tasks')
          .select('id, name, status, updated_at')
          .order('updated_at', { ascending: false })
          .limit(5);

        if (recentTasks) {
          setRecentActivity(recentTasks.map(task => ({
            id: task.id,
            action: task.status === 'completed' ? 'Task completed' :
                    task.status === 'in_progress' ? 'Task in progress' :
                    'Task updated',
            task: task.name,
            time: formatTimeAgo(new Date(task.updated_at)),
            type: task.status === 'completed' ? 'completed' :
                  task.status === 'in_progress' ? 'progress' : 'created',
          })));
        }

        // Fetch upcoming tasks for deadlines (tasks ending soon)
        const { data: upcomingTasks } = await supabase
          .from('timeline_tasks')
          .select('name, end_period, departments(name, companies(name))')
          .in('status', ['planning', 'in_progress'])
          .order('end_period')
          .limit(4);

        if (upcomingTasks) {
          setUpcomingDeadlines(upcomingTasks.map((task: any) => ({
            task: task.name,
            company: task.departments?.companies?.name || 'Unknown',
            date: periodToDate(task.end_period),
            urgent: task.end_period <= getCurrentPeriod() + 3,
          })));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const progressPercent = stats.activeTasks > 0
    ? Math.round((stats.completedTasks / stats.activeTasks) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s an overview of your companies.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/timeline">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              View Timeline
            </Button>
          </Link>
          <Link href="/tasks">
            <Button>
              <CheckSquare className="w-4 h-4 mr-2" />
              Manage Tasks
            </Button>
          </Link>
        </div>
      </div>

      {/* AI-Empowered Banner */}
      <Card className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border-violet-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/20">
                <Sparkles className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-violet-900">AI-Powered Task Management</h3>
                <p className="text-sm text-violet-700">
                  Lean team of {stats.teamMembers} across {stats.companies} companies with 4 core skills
                </p>
              </div>
            </div>
            <Link href="/teams">
              <Button variant="outline" size="sm" className="border-violet-300 text-violet-700 hover:bg-violet-50">
                View Team
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Companies
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.companies}</div>
            <p className="text-xs text-muted-foreground">Active companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <div className="flex gap-1 mt-1">
              {skills.map(skill => (
                <div
                  key={skill.id}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: skill.color }}
                  title={skill.name}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Task Progress
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercent}%</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{stats.completedTasks}/{stats.activeTasks}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Targets
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.targets}</div>
            <p className="text-xs text-muted-foreground">{stats.frozenTargets} frozen</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Overview */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Company Overview</CardTitle>
            <Link href="/companies">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companies.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No companies found</p>
              ) : (
                companies.map((company) => {
                  // Random progress for now - would be calculated from actual tasks
                  const progress = Math.floor(Math.random() * 60) + 20;

                  return (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: company.color || '#3B82F6' }}
                        >
                          {company.short_name || company.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium">{company.name}</span>
                          <p className="text-xs text-muted-foreground">Active</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${progress}%`, backgroundColor: company.color || '#3B82F6' }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium w-10">{progress}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Deadlines</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-sm">No upcoming deadlines</p>
              ) : (
                upcomingDeadlines.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 ${item.urgent ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.task}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.company}</span>
                        <span>•</span>
                        <span className={item.urgent ? 'text-red-600 font-medium' : ''}>{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link href="/tasks">
              <Button variant="outline" className="w-full mt-4" size="sm">
                View All Tasks
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-sm">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'completed' ? 'bg-green-500' :
                    activity.type === 'frozen' ? 'bg-blue-500' :
                    activity.type === 'progress' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.action}</span>
                      {' - '}
                      <span className="text-muted-foreground">{activity.task}</span>
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
