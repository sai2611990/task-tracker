'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Calendar,
  Building2,
  Briefcase,
  Clock,
  Edit,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SubtaskManager } from '@/components/subtasks/subtask-manager';
import { createClient } from '@/lib/supabase/client';

interface Task {
  id: string;
  name: string;
  description?: string;
  status: string;
  skill: string;
  start_period: number;
  end_period: number;
  year: number;
  due_date?: string;
  manager_id?: string;
  assigned_to?: string;
  department_id: string;
  organization_id: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  department?: {
    id: string;
    name: string;
    company?: {
      id: string;
      name: string;
    };
  };
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Month/period helpers
const periods = [
  { month: 'JAN', period: '1-10' }, { month: 'JAN', period: '11-20' }, { month: 'JAN', period: '21-31' },
  { month: 'FEB', period: '1-10' }, { month: 'FEB', period: '11-20' }, { month: 'FEB', period: '21-28' },
  { month: 'MAR', period: '1-10' }, { month: 'MAR', period: '11-20' }, { month: 'MAR', period: '21-31' },
  { month: 'APR', period: '1-10' }, { month: 'APR', period: '11-20' }, { month: 'APR', period: '21-30' },
  { month: 'MAY', period: '1-10' }, { month: 'MAY', period: '11-20' }, { month: 'MAY', period: '21-31' },
  { month: 'JUN', period: '1-10' }, { month: 'JUN', period: '11-20' }, { month: 'JUN', period: '21-30' },
  { month: 'JUL', period: '1-10' }, { month: 'JUL', period: '11-20' }, { month: 'JUL', period: '21-31' },
  { month: 'AUG', period: '1-10' }, { month: 'AUG', period: '11-20' }, { month: 'AUG', period: '21-31' },
  { month: 'SEP', period: '1-10' }, { month: 'SEP', period: '11-20' }, { month: 'SEP', period: '21-30' },
  { month: 'OCT', period: '1-10' }, { month: 'OCT', period: '11-20' }, { month: 'OCT', period: '21-31' },
  { month: 'NOV', period: '1-10' }, { month: 'NOV', period: '11-20' }, { month: 'NOV', period: '21-30' },
  { month: 'DEC', period: '1-10' }, { month: 'DEC', period: '11-20' }, { month: 'DEC', period: '21-31' },
];

const formatPeriod = (idx: number) => periods[idx] ? `${periods[idx].month} ${periods[idx].period}` : '';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAssigningManager, setIsAssigningManager] = useState(false);

  // Fetch task details
  useEffect(() => {
    async function fetchTask() {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Fetch task with relations
      const res = await fetch(`/api/subtasks?parentTaskId=${taskId}`);
      const data = await res.json();

      if (data.parentTask) {
        setTask(data.parentTask);
      }

      // Fetch members
      const membersRes = await fetch('/api/members');
      const membersData = await membersRes.json();
      if (membersData.members) {
        setMembers(membersData.members);
      }

      setLoading(false);
    }

    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const handleAssignManager = async (managerId: string) => {
    try {
      const res = await fetch('/api/subtasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, managerId })
      });

      if (res.ok) {
        const member = members.find(m => m.id === managerId);
        setTask(task ? {
          ...task,
          manager_id: managerId,
          manager: member ? { id: member.id, name: member.name, email: member.email } : undefined
        } : null);
        setIsAssigningManager(false);
      }
    } catch (e) {
      console.error('Error assigning manager:', e);
    }
  };

  const isManager = currentUser && task && task.manager_id === currentUser.id;
  const isCEO = currentUser && task && !task.manager_id; // CEO view when no manager assigned

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Task not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const statusColor = {
    planning: 'bg-gray-400',
    in_progress: 'bg-yellow-500',
    completed: 'bg-green-500',
    blocked: 'bg-red-500'
  }[task.status] || 'bg-gray-400';

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>

      {/* Task Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{task.name}</CardTitle>
              {task.description && (
                <p className="text-muted-foreground mt-2">{task.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColor}>{task.status.replace('_', ' ')}</Badge>
              <Badge variant="outline">{task.skill}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Timeline */}
            <div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Timeline
              </div>
              <div className="font-medium mt-1">
                {formatPeriod(task.start_period)} → {formatPeriod(task.end_period - 1)} {task.year}
              </div>
            </div>

            {/* Due Date */}
            {task.due_date && (
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </div>
                <div className="font-medium mt-1">
                  {new Date(task.due_date).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Manager */}
            <div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <UserPlus className="w-4 h-4" />
                Manager
              </div>
              <div className="mt-1">
                {task.manager ? (
                  <span className="font-medium">{task.manager.name || task.manager.email}</span>
                ) : (
                  <Dialog open={isAssigningManager} onOpenChange={setIsAssigningManager}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <UserPlus className="w-4 h-4 mr-1" />
                        Assign Manager
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Task Manager</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <p className="text-sm text-muted-foreground">
                          The manager can create and assign subtasks to team members.
                        </p>
                        <div className="space-y-2">
                          {members.map(member => (
                            <button
                              key={member.id}
                              onClick={() => handleAssignManager(member.id)}
                              className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors flex items-center gap-3"
                            >
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                {(member.name || member.email)[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{member.name || 'No name'}</div>
                                <div className="text-sm text-muted-foreground">{member.email}</div>
                              </div>
                              <Badge variant="outline" className="ml-auto">{member.role}</Badge>
                            </button>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {/* Assignee */}
            <div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="w-4 h-4" />
                Assignee
              </div>
              <div className="font-medium mt-1">
                {task.assignee ? (
                  task.assignee.name || task.assignee.email
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subtasks Section */}
      {task.manager_id ? (
        <SubtaskManager
          parentTask={task}
          isManager={isManager || false}
          currentUserId={currentUser?.id || ''}
          onSubtaskChange={() => {
            // Refresh task data
            window.location.reload();
          }}
        />
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">No Manager Assigned</h3>
            <p className="text-muted-foreground mb-4">
              Assign a manager to this task to enable subtask delegation.
            </p>
            <Dialog open={isAssigningManager} onOpenChange={setIsAssigningManager}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Manager
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Task Manager</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Select a team member to manage this task. They will be able to create subtasks and assign them to others.
                  </p>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {members.map(member => (
                      <button
                        key={member.id}
                        onClick={() => handleAssignManager(member.id)}
                        className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {(member.name || member.email)[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{member.name || 'No name'}</div>
                          <div className="text-sm text-muted-foreground truncate">{member.email}</div>
                        </div>
                        <Badge variant="outline">{member.role}</Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
