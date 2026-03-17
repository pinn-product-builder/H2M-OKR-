import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Pencil, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useProfiles, useUpdateTask } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const editTaskSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(100),
  description: z.string().max(500).optional(),
  assigneeId: z.string().min(1, 'Selecione um responsável'),
  startDate: z.date().optional().nullable(),
  dueDate: z.date().optional().nullable(),
  priority: z.enum(['high', 'medium', 'low']),
  status: z.enum(['pending', 'in-progress', 'completed']),
});

type EditTaskData = z.infer<typeof editTaskSchema>;

interface TaskData {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee_id?: string;
  assignedTo?: string;
  start_date?: string;
  due_date?: string;
  dueDate?: string;
}

interface EditTaskDialogProps {
  task: TaskData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

const priorityOptions = [
  { value: 'high', label: 'Alta', color: 'text-critical' },
  { value: 'medium', label: 'Média', color: 'text-warning' },
  { value: 'low', label: 'Baixa', color: 'text-muted-foreground' },
];

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in-progress', label: 'Em Progresso' },
  { value: 'completed', label: 'Concluída' },
];

function parseDate(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  return isNaN(d.getTime()) ? undefined : d;
}

export function EditTaskDialog({ task, open, onOpenChange, onDeleted }: EditTaskDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: profiles = [] } = useProfiles();
  const updateTask = useUpdateTask();

  const form = useForm<EditTaskData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      assigneeId: task.assignee_id || task.assignedTo || '',
      startDate: parseDate(task.start_date) || null,
      dueDate: parseDate(task.due_date || task.dueDate) || null,
      priority: (task.priority as any) || 'medium',
      status: (task.status as any) || 'pending',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: task.title,
        description: task.description || '',
        assigneeId: task.assignee_id || task.assignedTo || '',
        startDate: parseDate(task.start_date) || null,
        dueDate: parseDate(task.due_date || task.dueDate) || null,
        priority: (task.priority as any) || 'medium',
        status: (task.status as any) || 'pending',
      });
    }
  }, [open, task.id]);

  const onSubmit = async (data: EditTaskData) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        title: data.title,
        description: data.description || null,
        assignee_id: data.assigneeId,
        start_date: data.startDate ? data.startDate.toISOString().split('T')[0] : null,
        due_date: data.dueDate ? data.dueDate.toISOString().split('T')[0] : null,
        priority: data.priority,
        status: data.status,
        completed_at: data.status === 'completed' ? new Date().toISOString() : null,
      });
      toast({ title: 'Tarefa atualizada', description: `"${data.title}" salva com sucesso.` });
      onOpenChange(false);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível atualizar a tarefa.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await supabase.from('tasks').delete().eq('id', task.id);
      toast({ title: 'Tarefa excluída', description: `"${task.title}" foi removida.` });
      onOpenChange(false);
      onDeleted?.();
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível excluir a tarefa.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-accent" />
            Editar Tarefa
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl><Textarea className="min-h-[60px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {profiles.map(p => (
                          <SelectItem key={p.user_id} value={p.user_id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Início</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecionar</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Fim</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecionar</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorityOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className={opt.color}>{opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Excluir
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" className="gradient-accent" disabled={updateTask.isPending}>
                  {updateTask.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Salvar
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
