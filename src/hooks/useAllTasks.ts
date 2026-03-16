import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TaskWithContext {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee_id?: string;
  start_date?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  key_result_id: string;
  key_result?: {
    id: string;
    title: string;
    objective_id: string;
    objective?: {
      id: string;
      title: string;
      sector_id?: string;
      sector?: {
        id: string;
        name: string;
        color: string;
      };
    };
  };
}

export function useAllTasks(filters?: {
  sectorId?: string;
  assigneeId?: string;
  cycleId?: string;
}) {
  return useQuery({
    queryKey: ['all-tasks', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          key_result:key_results(
            id,
            title,
            objective_id,
            objective:objectives(
              id,
              title,
              sector_id,
              cycle_id,
              sector:sectors(id, name, color)
            )
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      let tasks = (data as unknown as TaskWithContext[]) || [];

      // Apply filters
      if (filters?.sectorId && filters.sectorId !== 'all') {
        tasks = tasks.filter(t => t.key_result?.objective?.sector_id === filters.sectorId);
      }
      if (filters?.assigneeId && filters.assigneeId !== 'all') {
        tasks = tasks.filter(t => t.assignee_id === filters.assigneeId);
      }
      if (filters?.cycleId && filters.cycleId !== 'all') {
        tasks = tasks.filter(t => (t.key_result?.objective as any)?.cycle_id === filters.cycleId);
      }

      return tasks;
    },
  });
}
