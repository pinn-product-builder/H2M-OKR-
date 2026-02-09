import { Task } from '@/types/okr';
import { cn } from '@/lib/utils';
import { User, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface TaskListProps {
  tasks: Task[];
  onToggleStatus?: (taskId: string) => void;
}

const priorityColors = {
  high: 'text-critical',
  medium: 'text-warning',
  low: 'text-muted-foreground',
};

const priorityLabels = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

const statusLabels = {
  pending: 'Pendente',
  'in-progress': 'Em progresso',
  completed: 'Concluída',
};

export function TaskList({ tasks, onToggleStatus }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Nenhuma tarefa cadastrada
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg transition-colors",
            "hover:bg-muted/50 border border-border",
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
                <span>{task.assignedToName}</span>
              </div>
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
              <span className={cn("font-medium", priorityColors[task.priority])}>
                {priorityLabels[task.priority]}
              </span>
            </div>
          </div>

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
      ))}
    </div>
  );
}
