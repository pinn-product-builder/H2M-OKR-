import { useState } from 'react';
import { useProfiles } from '@/hooks/useSupabaseData';
import { cn } from '@/lib/utils';
import { User, Calendar, CheckCircle2, Circle, Clock, ArrowRight, Pencil } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { EditTaskDialog } from './EditTaskDialog';

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee_id?: string;
  start_date?: string;
  due_date?: string;
  assignedTo?: string;
  assignedToName?: string;
  dueDate?: string;
}

interface TaskListProps {
  tasks: TaskItem[];
  onToggleStatus?: (taskId: string) => void;
}

const priorityColors: Record<string, string> = {
  high: 'text-critical',
  medium: 'text-warning',
  low: 'text-muted-foreground',
};

const priorityLabels: Record<string, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

export function TaskList({ tasks, onToggleStatus }: TaskListProps) {
  const { data: profiles = [] } = useProfiles();
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const getAssigneeName = (task: TaskItem) => {
    if (task.assignedToName) return task.assignedToName;
    const id = task.assignee_id || task.assignedTo;
    if (!id) return 'Não atribuído';
    return profiles.find(p => p.user_id === id)?.name || 'Não atribuído';
  };

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date.includes('T') ? date : date + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const getStartDate = (task: TaskItem) => task.start_date;
  const getEndDate = (task: TaskItem) => task.due_date || task.dueDate;

  if (tasks.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Nenhuma tarefa cadastrada
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {tasks.map((task) => {
          const startDate = getStartDate(task);
          const endDate = getEndDate(task);

          return (
            <div
              key={task.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-colors",
                "hover:bg-muted/50 border border-border group",
                task.status === 'completed' && "opacity-60"
              )}
            >
              <div className="pt-0.5">
                <Checkbox
                  checked={task.status === 'completed'}
                  onCheckedChange={() => onToggleStatus?.(task.id)}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  task.status === 'completed' && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{getAssigneeName(task)}</span>
                  </div>
                  {(startDate || endDate) && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {startDate && endDate ? (
                        <span className="flex items-center gap-1">
                          {formatDate(startDate)}
                          <ArrowRight className="w-2.5 h-2.5" />
                          {formatDate(endDate)}
                        </span>
                      ) : (
                        <span>{formatDate(startDate || endDate)}</span>
                      )}
                    </div>
                  )}
                  {task.priority && (
                    <span className={cn("font-medium", priorityColors[task.priority])}>
                      {priorityLabels[task.priority]}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTask(task);
                  }}
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
                <div className="flex items-center gap-1 text-xs">
                  {task.status === 'completed' ? (
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Concluída
                    </span>
                  ) : task.status === 'in-progress' ? (
                    <span className="flex items-center gap-1 text-warning">
                      <Clock className="w-3.5 h-3.5" />
                      Em progresso
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Circle className="w-3.5 h-3.5" />
                      Pendente
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => { if (!open) setEditingTask(null); }}
        />
      )}
    </>
  );
}
