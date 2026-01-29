import { useState } from 'react';
import { Objective, KeyResult, Task } from '@/types/okr';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Calendar, Target, Plus, ChevronDown, ChevronRight, Archive, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OKRDetailModalProps {
  objective: Objective;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OKRDetailModal({ objective, open, onOpenChange }: OKRDetailModalProps) {
  const [expandedKRs, setExpandedKRs] = useState<Set<string>>(new Set());
  const { tasks, addTask, toggleTaskStatus, archiveObjective, sectors } = useApp();

  const toggleKR = (krId: string) => {
    setExpandedKRs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(krId)) {
        newSet.delete(krId);
      } else {
        newSet.add(krId);
      }
      return newSet;
    });
  };

  const getTasksForKR = (krId: string) => {
    return tasks.filter(t => t.parentKRId === krId);
  };

  const getTasksForOKR = () => {
    return tasks.filter(t => t.parentOKRId === objective.id);
  };

  const handleAddTask = (task: Task) => {
    addTask(task);
  };

  const totalTasks = getTasksForOKR().length;
  const sectorLabel = sectors.find(s => s.slug === objective.sector)?.name || objective.sector;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
              {sectorLabel}
            </span>
            <StatusBadge status={objective.status} />
          </div>
          <DialogTitle className="text-xl">{objective.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{objective.description}</p>
        </DialogHeader>

        <div className="flex items-center gap-6 py-3 border-y border-border text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{objective.owner}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{objective.period}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="w-4 h-4" />
            <span>{objective.keyResults.length} KRs</span>
          </div>
          {totalTasks > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <ListTodo className="w-4 h-4" />
              <span>{totalTasks} Tarefas</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progresso Geral</span>
            <div className="flex items-center gap-2">
              {objective.progress === 100 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => {
                    archiveObjective(objective.id);
                    onOpenChange(false);
                  }}
                >
                  <Archive className="w-3 h-3" />
                  Arquivar
                </Button>
              )}
              <span className="text-sm font-semibold">{objective.progress}%</span>
            </div>
          </div>
          <ProgressBar progress={objective.progress} status={objective.status} />
        </div>

        <Tabs defaultValue="krs" className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="krs">Key Results</TabsTrigger>
            <TabsTrigger value="tarefas">Tarefas ({totalTasks})</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="krs" className="flex-1 overflow-auto mt-4">
            <div className="space-y-3">
              {objective.keyResults.map((kr) => (
                <KRItem
                  key={kr.id}
                  kr={kr}
                  okrId={objective.id}
                  isExpanded={expandedKRs.has(kr.id)}
                  onToggle={() => toggleKR(kr.id)}
                  tasks={getTasksForKR(kr.id)}
                  onAddTask={handleAddTask}
                  onToggleTaskStatus={toggleTaskStatus}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tarefas" className="flex-1 overflow-auto mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Todas as Tarefas deste OKR
                </h4>
              </div>
              <TaskList 
                tasks={getTasksForOKR()} 
                onToggleStatus={toggleTaskStatus}
              />
            </div>
          </TabsContent>

          <TabsContent value="historico" className="flex-1 overflow-auto mt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-success" />
                <div className="flex-1">
                  <p className="text-sm">KR "Vendas para clientes existentes" atualizado para 80%</p>
                  <p className="text-xs text-muted-foreground">Há 2 horas por Ana Costa</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <div className="flex-1">
                  <p className="text-sm">Tarefa adicionada: "Preparar relatório mensal"</p>
                  <p className="text-xs text-muted-foreground">Ontem por Carlos Silva</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <div className="flex-1">
                  <p className="text-sm">Status alterado para "Atenção"</p>
                  <p className="text-xs text-muted-foreground">3 dias atrás pelo sistema</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface KRItemProps {
  kr: KeyResult;
  okrId: string;
  isExpanded: boolean;
  onToggle: () => void;
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onToggleTaskStatus: (taskId: string) => void;
}

function KRItem({ kr, okrId, isExpanded, onToggle, tasks, onAddTask, onToggleTaskStatus }: KRItemProps) {
  const hasContent = tasks.length > 0;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div
        className={cn(
          "p-4 cursor-pointer transition-colors hover:bg-muted/30",
          isExpanded && "bg-muted/20"
        )}
        onClick={onToggle}
      >
        <div className="flex items-start gap-3">
          <button className="mt-0.5 p-0.5 hover:bg-muted rounded">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-medium">{kr.title}</p>
              <StatusBadge status={kr.status} size="sm" />
              {tasks.length > 0 && (
                <span className="text-xs text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                  {tasks.length} Tarefas
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>{kr.owner}</span>
              </div>
              <span>
                Atual: {kr.type === 'numeric' && kr.unit === 'R$' 
                  ? `R$ ${(kr.current / 1000000).toFixed(1)}M` 
                  : `${kr.current} ${kr.unit}`}
              </span>
              <span>
                Meta: {kr.type === 'numeric' && kr.unit === 'R$' 
                  ? `R$ ${(kr.target / 1000000).toFixed(1)}M` 
                  : `${kr.target} ${kr.unit}`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <ProgressBar progress={kr.progress} status={kr.status} size="sm" />
              </div>
              <span
                className={cn(
                  "text-sm font-semibold min-w-[3rem] text-right",
                  kr.status === 'on-track' && "text-success",
                  kr.status === 'attention' && "text-warning",
                  kr.status === 'critical' && "text-critical"
                )}
              >
                {kr.progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border bg-muted/10 p-3 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tarefas ({tasks.length})
            </span>
            <TaskForm 
              krId={kr.id} 
              okrId={okrId} 
              onTaskCreated={onAddTask}
            />
          </div>
          <TaskList tasks={tasks} onToggleStatus={onToggleTaskStatus} />
        </div>
      )}
    </div>
  );
}
