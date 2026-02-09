import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  UserView, 
  DashboardWidget, 
  CreateViewInput, 
  UpdateViewInput,
  CreateWidgetInput,
  UpdateWidgetInput,
  ViewType 
} from '@/types/views';
import type { Json } from '@/integrations/supabase/types';

// ============ View Hooks ============

// Fetch user views by type
export function useUserViews(type: ViewType) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-views', type, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_views')
        .select('*')
        .eq('type', type)
        .order('is_default', { ascending: false })
        .order('name');
      
      if (error) throw error;
      return data as UserView[];
    },
    enabled: !!user,
  });
}

// Fetch a single view by ID
export function useView(viewId: string | undefined) {
  return useQuery({
    queryKey: ['user-view', viewId],
    queryFn: async () => {
      if (!viewId) return null;
      
      const { data, error } = await supabase
        .from('user_views')
        .select('*')
        .eq('id', viewId)
        .single();
      
      if (error) throw error;
      return data as UserView;
    },
    enabled: !!viewId,
  });
}

// Get default view for a type
export function useDefaultView(type: ViewType) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['default-view', type, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_views')
        .select('*')
        .eq('type', type)
        .eq('is_default', true)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserView | null;
    },
    enabled: !!user,
  });
}

// Create view mutation
export function useCreateView() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (input: CreateViewInput) => {
      if (!user) throw new Error('User not authenticated');
      
      // If setting as default, first unset other defaults
      if (input.is_default) {
        await supabase
          .from('user_views')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('type', input.type)
          .eq('is_default', true);
      }
      
      const { data, error } = await supabase
        .from('user_views')
        .insert({
          name: input.name,
          type: input.type,
          filters: (input.filters || {}) as Json,
          layout: (input.layout || {}) as Json,
          is_default: input.is_default ?? false,
          is_shared: input.is_shared ?? false,
          shared_with: input.shared_with || [],
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as UserView;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-views', data.type] });
      queryClient.invalidateQueries({ queryKey: ['default-view', data.type] });
    },
  });
}

// Update view mutation
export function useUpdateView() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (input: UpdateViewInput) => {
      if (!user) throw new Error('User not authenticated');
      
      // If setting as default, first unset other defaults
      if (input.is_default) {
        // Get the view type first
        const { data: existingView } = await supabase
          .from('user_views')
          .select('type')
          .eq('id', input.id)
          .single();
        
        if (existingView) {
          await supabase
            .from('user_views')
            .update({ is_default: false })
            .eq('user_id', user.id)
            .eq('type', existingView.type)
            .eq('is_default', true)
            .neq('id', input.id);
        }
      }
      
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.filters !== undefined) updateData.filters = input.filters as Json;
      if (input.layout !== undefined) updateData.layout = input.layout as Json;
      if (input.is_default !== undefined) updateData.is_default = input.is_default;
      if (input.is_shared !== undefined) updateData.is_shared = input.is_shared;
      if (input.shared_with !== undefined) updateData.shared_with = input.shared_with;
      
      const { data, error } = await supabase
        .from('user_views')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as UserView;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-views', data.type] });
      queryClient.invalidateQueries({ queryKey: ['user-view', data.id] });
      queryClient.invalidateQueries({ queryKey: ['default-view', data.type] });
    },
  });
}

// Delete view mutation
export function useDeleteView() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: ViewType }) => {
      const { error } = await supabase
        .from('user_views')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, type };
    },
    onSuccess: ({ type }) => {
      queryClient.invalidateQueries({ queryKey: ['user-views', type] });
      queryClient.invalidateQueries({ queryKey: ['default-view', type] });
    },
  });
}

// Set default view
export function useSetDefaultView() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ viewId, type }: { viewId: string; type: ViewType }) => {
      if (!user) throw new Error('User not authenticated');
      
      // First unset all defaults for this type
      await supabase
        .from('user_views')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('type', type);
      
      // Then set the new default
      const { data, error } = await supabase
        .from('user_views')
        .update({ is_default: true })
        .eq('id', viewId)
        .select()
        .single();
      
      if (error) throw error;
      return data as UserView;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-views', data.type] });
      queryClient.invalidateQueries({ queryKey: ['default-view', data.type] });
    },
  });
}

// ============ Widget Hooks ============

// Fetch widgets for a view
export function useDashboardWidgets(viewId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard-widgets', viewId],
    queryFn: async () => {
      if (!viewId) return [];
      
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .select('*')
        .eq('view_id', viewId)
        .order('position');
      
      if (error) throw error;
      return data as DashboardWidget[];
    },
    enabled: !!viewId,
  });
}

// Create widget mutation
export function useCreateWidget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateWidgetInput) => {
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .insert({
          view_id: input.view_id,
          type: input.type,
          title: input.title,
          config: (input.config || {}) as Json,
          position: input.position ?? 0,
          size: input.size ?? 'medium',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as DashboardWidget;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets', data.view_id] });
    },
  });
}

// Update widget mutation
export function useUpdateWidget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: UpdateWidgetInput) => {
      const updateData: Record<string, unknown> = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.config !== undefined) updateData.config = input.config as Json;
      if (input.position !== undefined) updateData.position = input.position;
      if (input.size !== undefined) updateData.size = input.size;
      
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as DashboardWidget;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets', data.view_id] });
    },
  });
}

// Delete widget mutation
export function useDeleteWidget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, viewId }: { id: string; viewId: string }) => {
      const { error } = await supabase
        .from('dashboard_widgets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, viewId };
    },
    onSuccess: ({ viewId }) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets', viewId] });
    },
  });
}

// Reorder widgets
export function useReorderWidgets() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ viewId, widgets }: { viewId: string; widgets: { id: string; position: number }[] }) => {
      // Update each widget's position
      const updates = widgets.map(w => 
        supabase
          .from('dashboard_widgets')
          .update({ position: w.position })
          .eq('id', w.id)
      );
      
      await Promise.all(updates);
      return { viewId };
    },
    onSuccess: ({ viewId }) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets', viewId] });
    },
  });
}
