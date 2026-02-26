'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Check,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Progress } from '@/components/ui/progress';

interface Subtask {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  assigned_to?: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Task {
  id: string;
  name: string;
  description?: string;
  due_date?: string;
  manager_id?: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
}

interface SubtaskManagerProps {
  parentTask: Task;
  isManager: boolean;
  currentUserId: string;
  onSubtaskChange?: () => void;
}

export function SubtaskManager({
  parentTask,
  isManager,
  currentUserId,
  onSubtaskChange
}: SubtaskManagerProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtask, setNewSubtask] = useState({
    name: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium'
  });

  // Fetch subtasks and members
  useEffect(() => {
    fetchSubtasks();
    fetchMembers();
  }, [parentTask.id]);

  const fetchSubtasks = async () => {
    try {
      const res = await fetch(`/api/subtasks?parentTaskId=${parentTask.id}`);
      const data = await res.json();
      if (data.subtasks) {
        setSubtasks(data.subtasks);
      }
    } catch (e) {
      console.error('Error fetching subtasks:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.members) {
        setMembers(data.members);
      }
    } catch (e) {
      console.error('Error fetching members:', e);
    }
  };

  const handleCreateSubtask = async () => {
    if (!newSubtask.name.trim()) return;

    try {
      const res = await fetch('/api/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentTaskId: parentTask.id,
          name: newSubtask.name,
          description: newSubtask.description,
          assignedTo: newSubtask.assignedTo || null,
          dueDate: newSubtask.dueDate || null,
          priority: newSubtask.priority
        })
      });

      const data = await res.json();
      if (data.subtask) {
        setSubtasks([...subtasks, data.subtask]);
        setNewSubtask({ name: '', description: '', assignedTo: '', dueDate: '', priority: 'medium' });
        setIsAddingSubtask(false);
        onSubtaskChange?.();
      }
    } catch (e) {
      console.error('Error creating subtask:', e);
    }
  };

  const handleUpdateStatus = async (subtaskId: string, status: string) => {
    try {
      const res = await fetch('/api/subtasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subtaskId, status })
      });

      if (res.ok) {
        setSubtasks(subtasks.map(s =>
          s.id === subtaskId ? { ...s, status: status as Subtask['status'] } : s
        ));
        onSubtaskChange?.();
      }
    } catch (e) {
      console.error('Error updating subtask:', e);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!confirm('Delete this subtask?')) return;

    try {
      const res = await fetch(`/api/subtasks?id=${subtaskId}`, { method: 'DELETE' });
      if (res.ok) {
        setSubtasks(subtasks.filter(s => s.id !== subtaskId));
        onSubtaskChange?.();
      }
    } catch (e) {
      console.error('Error deleting subtask:', e);
    }
  };

  const completedCount = subtasks.filter(s => s.status === 'completed').length;
  const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'blocked': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 border-2 rounded-full border-gray-300" />;
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Subtasks
            <Badge variant="outline">{subtasks.length}</Badge>
          </CardTitle>
          {isManager && (
            <Dialog open={isAddingSubtask} onOpenChange={setIsAddingSubtask}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Subtask
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Subtask</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Task Name</Label>
                    <Input
                      placeholder="Enter subtask name"
                      value={newSubtask.name}
                      onChange={e => setNewSubtask({ ...newSubtask, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Optional description"
                      value={newSubtask.description}
                      onChange={e => setNewSubtask({ ...newSubtask, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Assign To</Label>
                      <Select
                        value={newSubtask.assignedTo}
                        onValueChange={v => setNewSubtask({ ...newSubtask, assignedTo: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map(m => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name || m.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select
                        value={newSubtask.priority}
                        onValueChange={v => setNewSubtask({ ...newSubtask, priority: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={newSubtask.dueDate}
                      onChange={e => setNewSubtask({ ...newSubtask, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingSubtask(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSubtask}>
                      Create Subtask
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        {subtasks.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completedCount}/{subtasks.length} ({progress}%)</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Subtask List */}
        {subtasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No subtasks yet</p>
            {isManager && (
              <p className="text-sm mt-1">Click &quot;Add Subtask&quot; to break down this task</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {subtasks.map(subtask => (
              <div
                key={subtask.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Status toggle */}
                <button
                  onClick={() => handleUpdateStatus(
                    subtask.id,
                    subtask.status === 'completed' ? 'planning' :
                    subtask.status === 'planning' ? 'in_progress' : 'completed'
                  )}
                  className="hover:scale-110 transition-transform"
                >
                  {statusIcon(subtask.status)}
                </button>

                {/* Task info */}
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${subtask.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {subtask.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    {subtask.assignee && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {subtask.assignee.name || subtask.assignee.email}
                      </span>
                    )}
                    {subtask.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(subtask.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Priority badge */}
                <Badge className={priorityColor(subtask.priority)} variant="secondary">
                  {subtask.priority}
                </Badge>

                {/* Status dropdown */}
                <Select
                  value={subtask.status}
                  onValueChange={v => handleUpdateStatus(subtask.id, v)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>

                {/* Delete button */}
                {isManager && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
