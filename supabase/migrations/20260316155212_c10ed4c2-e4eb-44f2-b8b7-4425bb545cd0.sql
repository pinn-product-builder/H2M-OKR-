-- Add okr_type column to objectives table
ALTER TABLE public.objectives 
ADD COLUMN IF NOT EXISTS okr_type text NOT NULL DEFAULT 'operational' 
CHECK (okr_type IN ('strategic', 'tactical', 'operational'));