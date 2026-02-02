-- Criar enum para tipos de view
CREATE TYPE view_type AS ENUM ('okr', 'dashboard');

-- Criar enum para tipos de widget
CREATE TYPE widget_type AS ENUM (
  'metric_card',
  'okr_list', 
  'sector_overview',
  'progress_chart',
  'quick_stats',
  'task_summary'
);

-- Tabela principal de views do usuário
CREATE TABLE public.user_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type view_type NOT NULL,
  filters jsonb DEFAULT '{}',
  layout jsonb DEFAULT '{}',
  is_default boolean DEFAULT false,
  is_shared boolean DEFAULT false,
  shared_with uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de widgets do dashboard
CREATE TABLE public.dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  view_id uuid REFERENCES public.user_views(id) ON DELETE CASCADE NOT NULL,
  type widget_type NOT NULL,
  title text,
  config jsonb DEFAULT '{}',
  position integer DEFAULT 0,
  size text DEFAULT 'medium',
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_views_updated_at
  BEFORE UPDATE ON public.user_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função auxiliar para verificar acesso à view
CREATE OR REPLACE FUNCTION public.can_access_view(_view_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_views
    WHERE id = _view_id
    AND (
      user_id = _user_id
      OR _user_id = ANY(shared_with)
      OR (is_shared = true AND (has_role(_user_id, 'admin') OR has_role(_user_id, 'gestor')))
    )
  )
$$;

-- Políticas RLS para user_views

-- Usuários podem ver suas próprias views
CREATE POLICY "Users can view own views"
  ON public.user_views FOR SELECT
  USING (user_id = auth.uid());

-- Usuários podem ver views compartilhadas diretamente com eles
CREATE POLICY "Users can view shared views"
  ON public.user_views FOR SELECT
  USING (auth.uid() = ANY(shared_with));

-- Gestores e admins podem ver views públicas
CREATE POLICY "Gestors can view public views"
  ON public.user_views FOR SELECT
  USING (is_shared = true AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));

-- Usuários podem inserir suas próprias views
CREATE POLICY "Users can insert own views"
  ON public.user_views FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Usuários podem atualizar suas próprias views
CREATE POLICY "Users can update own views"
  ON public.user_views FOR UPDATE
  USING (user_id = auth.uid());

-- Usuários podem deletar suas próprias views
CREATE POLICY "Users can delete own views"
  ON public.user_views FOR DELETE
  USING (user_id = auth.uid());

-- Políticas RLS para dashboard_widgets

-- Usuários podem ver widgets de views que têm acesso
CREATE POLICY "Users can view widgets"
  ON public.dashboard_widgets FOR SELECT
  USING (can_access_view(view_id, auth.uid()));

-- Usuários podem inserir widgets em suas próprias views
CREATE POLICY "Users can insert widgets"
  ON public.dashboard_widgets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_views v 
      WHERE v.id = view_id AND v.user_id = auth.uid()
    )
  );

-- Usuários podem atualizar widgets de suas próprias views
CREATE POLICY "Users can update widgets"
  ON public.dashboard_widgets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_views v 
      WHERE v.id = view_id AND v.user_id = auth.uid()
    )
  );

-- Usuários podem deletar widgets de suas próprias views
CREATE POLICY "Users can delete widgets"
  ON public.dashboard_widgets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_views v 
      WHERE v.id = view_id AND v.user_id = auth.uid()
    )
  );