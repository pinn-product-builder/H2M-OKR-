import { cn } from '@/lib/utils';
import { KanbanCard } from './KanbanCard';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TaskWithContext } from '@/hooks/useAllTasks';

interface KanbanColumnProps {
  title: string;
  status: string;
  tasks: TaskWithContext[];
  color: string;
  icon: React.ReactNode;
  onStatusChange: (taskId: string, newStatus: string) => void;
}

export function KanbanColumn({ title, status, tasks, color, icon, onStatusChange }: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-accent/40');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('ring-2', 'ring-accent/40');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-accent/40');
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onStatusChange(taskId, status);
    }
  };

  return (
    <div
      className="flex flex-col bg-muted/30 rounded-xl border border-border/50 min-w-[280px] max-w-[320px] flex-1 transition-all"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border/50">
        <div className={cn('p-1 rounded', color)}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-auto">
          {tasks.length}
        </Badge>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 p-2 max-h-[calc(100vh-320px)]">
        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('taskId', task.id);
                e.currentTarget.classList.add('opacity-50');
              }}
              onDragEnd={(e) => {
                e.currentTarget.classList.remove('opacity-50');
              }}
            >
              <KanbanCard task={task} onStatusChange={onStatusChange} />
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-xs">
              Nenhuma tarefa
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
