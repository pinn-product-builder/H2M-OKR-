-- Migration: Ajustes no modelo OKR (departments/sectors, cycles, objectives, key_results)
-- Ref: docs/RAIO-X-MODELO-OKR.md
-- - sectors: slug (opcional, único)
-- - objectives: priority (high | medium | low)
-- - key_results: baseline_value (numérico, default 0)

-- 1. Sectors: adicionar slug para identificação única por área
ALTER TABLE public.sectors
  ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS sectors_slug_key
  ON public.sectors (slug)
  WHERE slug IS NOT NULL;

COMMENT ON COLUMN public.sectors.slug IS 'Identificador único do setor (ex.: para URLs). Opcional.';

-- 2. Objectives: adicionar prioridade (alta, média, baixa)
ALTER TABLE public.objectives
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium'
  CHECK (priority IN ('high', 'medium', 'low'));

COMMENT ON COLUMN public.objectives.priority IS 'Prioridade do objetivo: high, medium, low.';

-- 3. Key Results: adicionar valor baseline para cálculo de progresso e análises
ALTER TABLE public.key_results
  ADD COLUMN IF NOT EXISTS baseline_value numeric DEFAULT 0;

COMMENT ON COLUMN public.key_results.baseline_value IS 'Valor inicial de referência do KR para cálculo de progresso.';

-- Backfill e constraint NOT NULL para baseline_value
UPDATE public.key_results
SET baseline_value = 0
WHERE baseline_value IS NULL;

ALTER TABLE public.key_results
  ALTER COLUMN baseline_value SET NOT NULL;
