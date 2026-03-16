import { useMemo } from 'react';
import { User, Calendar } from 'lucide-react';
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
    <div className="bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group">
      {/* Sector & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {sectorName && (
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: sectorColor + '20', color: sectorColor }}
          >
            {sectorName}
          </span>
        )}
        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-4', pConfig.className)}>
          {pConfig.label}
        </Badge>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-foreground mb-1 line-clamp-2">{task.title}</p>

      {/* OKR/KR context */}
      {okrTitle && (
        <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1">
          {okrTitle} → {krTitle}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span className="truncate max-w-[100px]">{assigneeName}</span>
        </div>
        {task.due_date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(task.due_date)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
