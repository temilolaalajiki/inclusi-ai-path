-- Add class capacity management
CREATE TABLE IF NOT EXISTS public.class_capacity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_capacity integer NOT NULL DEFAULT 30,
  current_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(teacher_id)
);

-- Enable RLS
ALTER TABLE public.class_capacity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for class_capacity
CREATE POLICY "Admins can manage class capacity"
  ON public.class_capacity
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can view their class capacity"
  ON public.class_capacity
  FOR SELECT
  USING (auth.uid() = teacher_id);

-- Trigger for updated_at
CREATE TRIGGER update_class_capacity_updated_at
  BEFORE UPDATE ON public.class_capacity
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update class counts automatically
CREATE OR REPLACE FUNCTION public.update_class_counts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.class_capacity (teacher_id, current_count)
  SELECT teacher_id, COUNT(*) as current_count
  FROM public.learners
  WHERE teacher_id IS NOT NULL
  GROUP BY teacher_id
  ON CONFLICT (teacher_id)
  DO UPDATE SET 
    current_count = EXCLUDED.current_count,
    updated_at = now();
$$;

-- Function to get overcrowded classes
CREATE OR REPLACE FUNCTION public.get_overcrowded_classes()
RETURNS TABLE(
  teacher_id uuid,
  current_count integer,
  max_capacity integer,
  overflow integer,
  utilization_rate numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cc.teacher_id,
    cc.current_count,
    cc.max_capacity,
    cc.current_count - cc.max_capacity as overflow,
    ROUND((cc.current_count::numeric / cc.max_capacity::numeric) * 100, 1) as utilization_rate
  FROM public.class_capacity cc
  WHERE cc.current_count > cc.max_capacity
  ORDER BY overflow DESC;
$$;

-- Add intervention tracking to recommendations table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='recommendations' AND column_name='intervention_triggered') THEN
    ALTER TABLE public.recommendations 
    ADD COLUMN intervention_triggered boolean DEFAULT false;
  END IF;
END $$;