import { useMemo } from 'react';
import { User, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProfiles } from '@/hooks/useSupabaseData';
import type { TaskWithContext } from '@/hooks/useAllTasks';

interface KanbanCardProps {
  task: TaskWithContext;
  onStatusChange: (taskId: string, newStatus: string) => void;
}

const priorityConfig = {
  high: { label: 'Alta', className: 'bg-critical/10 text-critical border-critical/20' },
  medium: { label: 'Média', className: 'bg-warning/10 text-warning border-warning/20' },
  low: { label: 'Baixa', className: 'bg-muted text-muted-foreground border-border' },
};

export function KanbanCard({ task, onStatusChange }: KanbanCardProps) {
  const { data: profiles = [] } = useProfiles();

  const assigneeName = useMemo(() => {
    if (!task.assignee_id) return 'Não atribuído';
    return profiles.find(p => p.user_id === task.assignee_id)?.name || 'Não atribuído';
  }, [task.assignee_id, profiles]);

  const sectorName = task.key_result?.objective?.sector?.name;
  const sectorColor = task.key_result?.objective?.sector?.color || '#6366f1';
  const okrTitle = task.key_result?.objective?.title;
  const krTitle = task.key_result?.title;

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date.includes('T') ? date : date + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const pConfig = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group space-y-3">
      {/* Sector & Priority */}
      <div className="flex items-center justify-between gap-2">
        {sectorName && (
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
            style={{ backgroundColor: sectorColor + '20', color: sectorColor }}
          >
            {sectorName}
          </span>
        )}
        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5', pConfig.className)}>
          {pConfig.label}
        </Badge>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-foreground leading-snug">{task.title}</p>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {task.description}
        </p>
      )}

      {/* OKR/KR context */}
      {okrTitle && (
        <div className="bg-muted/50 rounded-md px-2.5 py-1.5 space-y-0.5">
          <p className="text-[11px] font-medium text-foreground/80 line-clamp-1">{okrTitle}</p>
          {krTitle && (
            <p className="text-[10px] text-muted-foreground line-clamp-1 flex items-center gap-1">
              <ArrowRight className="w-2.5 h-2.5 shrink-0" />
              {krTitle}
            </p>
          )}
        </div>
      )}

      {/* Dates */}
      {(task.start_date || task.due_date) && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Calendar className="w-3 h-3 shrink-0" />
          {task.start_date && task.due_date ? (
            <span className="flex items-center gap-1">
              {formatDate(task.start_date)}
              <ArrowRight className="w-2.5 h-2.5" />
              {formatDate(task.due_date)}
            </span>
          ) : (
            <span>{formatDate(task.start_date || task.due_date)}</span>
          )}
        </div>
      )}

      {/* Footer: Assignee */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-2 border-t border-border/50">
        <User className="w-3 h-3 shrink-0" />
        <span className="truncate">{assigneeName}</span>
      </div>
    </div>
  );
}