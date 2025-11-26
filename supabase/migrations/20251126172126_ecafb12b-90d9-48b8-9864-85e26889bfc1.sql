-- Fix search_path for calculate_attendance_rate function
CREATE OR REPLACE FUNCTION public.calculate_attendance_rate(
  _learner_id UUID,
  _days INTEGER DEFAULT 30
)
RETURNS NUMERIC 
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 100.0
      ELSE ROUND((COUNT(*) FILTER (WHERE status IN ('present', 'late')) * 100.0) / COUNT(*), 1)
    END
  FROM public.attendance_records
  WHERE learner_id = _learner_id
  AND date >= CURRENT_DATE - _days
$$;