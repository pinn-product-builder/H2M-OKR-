import { useState, useMemo } from 'react';
import { Circle, Clock, CheckCircle2, AlertOctagon, Loader2, ListTodo, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useSectors, useProfiles, useCycles, useUpdateTask } from '@/hooks/useSupabaseData';
import { useAllTasks } from '@/hooks/useAllTasks';
import { KanbanColumn } from './KanbanColumn';
import { TaskForm } from '@/components/okr/TaskForm';
import { toast } from '@/hooks/use-toast';

const columns = [
  { status: 'pending', title: 'Pendente', color: 'bg-muted', icon: <Circle className="w-3.5 h-3.5 text-muted-foreground" /> },
  { status: 'in-progress', title: 'Em Progresso', color: 'bg-warning/10', icon: <Clock className="w-3.5 h-3.5 text-warning" /> },
  { status: 'completed', title: 'Concluída', color: 'bg-success/10', icon: <CheckCircle2 className="w-3.5 h-3.5 text-success" /> },
  { status: 'blocked', title: 'Bloqueada', color: 'bg-critical/10', icon: <AlertOctagon className="w-3.5 h-3.5 text-critical" /> },
];

export function KanbanBoard() {
  const [sectorFilter, setSectorFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: sectors = [] } = useSectors();
  const { data: profiles = [] } = useProfiles();
  const { data: tasks = [], isLoading } = useAllTasks({
    sectorId: sectorFilter,
    assigneeId: assigneeFilter,
  });
  const updateTask = useUpdateTask();

  const filteredTasks = useMemo(() => {
    if (!searchTerm) return tasks;
    const search = searchTerm.toLowerCase();
    return tasks.filter(t =>
      t.title.toLowerCase().includes(search) ||
      t.key_result?.title?.toLowerCase().includes(search) ||
      t.key_result?.objective?.title?.toLowerCase().includes(search)
    );
  }, [tasks, searchTerm]);

  const tasksByStatus = useMemo(() => {
    const groups: Record<string, typeof filteredTasks> = {};
    columns.forEach(col => {
      groups[col.status] = filteredTasks.filter(t => t.status === col.status);
    });
    return groups;
  }, [filteredTasks]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        status: newStatus as any,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
      });
      toast({
        title: 'Tarefa atualizada',
        description: `Status alterado para "${columns.find(c => c.status === newStatus)?.title}".`,
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a tarefa.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Setores</SelectItem>
              {sectors.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {profiles.map(p => (
                <SelectItem key={p.user_id} value={p.user_id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <TaskForm
          trigger={
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium gradient-accent text-accent-foreground border-0">
              <ListTodo className="w-4 h-4" />
              Nova Tarefa
            </button>
          }
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{filteredTasks.length} tarefas no total</span>
        <span className="text-success">{tasksByStatus['completed']?.length || 0} concluídas</span>
        <span className="text-warning">{tasksByStatus['in-progress']?.length || 0} em progresso</span>
        <span className="text-critical">{tasksByStatus['blocked']?.length || 0} bloqueadas</span>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(col => (
          <KanbanColumn
            key={col.status}
            title={col.title}
            status={col.status}
            tasks={tasksByStatus[col.status] || []}
            color={col.color}
            icon={col.icon}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
}
