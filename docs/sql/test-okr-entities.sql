-- Testes de inserção e consulta — entidades OKR (H2M Intelligence)
-- Executar em ambiente de desenvolvimento/homologação após aplicar as migrations.
-- Requer usuário autenticado (auth.uid()) para RLS.

-- ========== 1. Inserção (ajustar IDs e auth conforme ambiente) ==========

-- 1.1 Setor (department)
INSERT INTO public.sectors (name, description, color, is_active, slug)
VALUES ('TI', 'Tecnologia da Informação', '#6366f1', true, 'ti')
ON CONFLICT DO NOTHING;

-- 1.2 Ciclo
INSERT INTO public.okr_cycles (name, start_date, end_date, is_active, is_archived)
VALUES ('Ciclo Q1 2025', '2025-01-01', '2025-03-31', true, false)
ON CONFLICT DO NOTHING;

-- 1.3 Objetivo (depende de cycle_id e opcionalmente sector_id)
-- Substituir <CYCLE_UUID> e <SECTOR_UUID> pelos IDs retornados nas inserções acima
-- Exemplo (use select para obter IDs):
DO $$
DECLARE
  v_cycle_id uuid;
  v_sector_id uuid;
  v_objective_id uuid;
  v_kr_id uuid;
BEGIN
  SELECT id INTO v_cycle_id FROM public.okr_cycles WHERE name = 'Ciclo Q1 2025' LIMIT 1;
  SELECT id INTO v_sector_id FROM public.sectors WHERE slug = 'ti' LIMIT 1;

  IF v_cycle_id IS NOT NULL THEN
    INSERT INTO public.objectives (title, description, cycle_id, sector_id, status, progress, priority)
    VALUES (
      'Objetivo de teste UAT',
      'Descrição do objetivo',
      v_cycle_id,
      v_sector_id,
      'on-track',
      0,
      'high'
    )
    RETURNING id INTO v_objective_id;

    IF v_objective_id IS NOT NULL THEN
      INSERT INTO public.key_results (objective_id, title, type, current_value, target_value, baseline_value, unit, status)
      VALUES (v_objective_id, 'KR de teste', 'percentage', 0, 100, 0, '%', 'on-track')
      RETURNING id INTO v_kr_id;

      IF v_kr_id IS NOT NULL THEN
        INSERT INTO public.tasks (key_result_id, title, status, priority)
        VALUES (v_kr_id, 'Tarefa de teste', 'pending', 'medium');
      END IF;
    END IF;
  END IF;
END $$;

-- ========== 2. Consultas de validação ==========

-- 2.1 Setores com contagem de objetivos
SELECT s.id, s.name, s.slug, s.is_active, COUNT(o.id) AS total_objectives
FROM public.sectors s
LEFT JOIN public.objectives o ON o.sector_id = s.id AND o.is_archived = false
GROUP BY s.id, s.name, s.slug, s.is_active
ORDER BY s.name;

-- 2.2 Ciclos com contagem de objetivos
SELECT c.id, c.name, c.start_date, c.end_date, c.is_active, COUNT(o.id) AS total_objectives
FROM public.okr_cycles c
LEFT JOIN public.objectives o ON o.cycle_id = c.id AND o.is_archived = false
GROUP BY c.id, c.name, c.start_date, c.end_date, c.is_active
ORDER BY c.start_date DESC;

-- 2.3 Objetivos com setor, ciclo e prioridade
SELECT o.id, o.title, o.priority, o.status, o.progress, s.name AS sector_name, c.name AS cycle_name
FROM public.objectives o
LEFT JOIN public.sectors s ON s.id = o.sector_id
JOIN public.okr_cycles c ON c.id = o.cycle_id
WHERE o.is_archived = false
ORDER BY o.created_at DESC
LIMIT 20;

-- 2.4 Key Results com baseline_value e objetivo
SELECT kr.id, kr.title, kr.type, kr.current_value, kr.target_value, kr.baseline_value, kr.unit, o.title AS objective_title
FROM public.key_results kr
JOIN public.objectives o ON o.id = kr.objective_id
ORDER BY kr.created_at DESC
LIMIT 20;

-- 2.5 Integridade: objetivos sem ciclo (não deve retornar linhas)
SELECT id, title FROM public.objectives WHERE cycle_id IS NULL;

-- 2.6 Integridade: KRs sem objetivo (não deve retornar linhas)
SELECT id, title FROM public.key_results WHERE objective_id IS NULL;

-- 2.7 Constraints: objectives.priority apenas high/medium/low
SELECT DISTINCT priority FROM public.objectives;

-- 2.8 Constraints: key_results.baseline_value preenchido (não nulo)
SELECT COUNT(*) AS total, COUNT(baseline_value) AS com_baseline FROM public.key_results;
