-- Create attendance_records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(learner_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies for attendance records
CREATE POLICY "Teachers can view their learners attendance"
ON public.attendance_records
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = attendance_records.learner_id
    AND (learners.teacher_id = auth.uid() OR auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    ))
  )
);

CREATE POLICY "Teachers can insert attendance for their learners"
ON public.attendance_records
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = attendance_records.learner_id
    AND (learners.teacher_id = auth.uid() OR auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    ))
  )
);

CREATE POLICY "Teachers can update their learners attendance"
ON public.attendance_records
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = attendance_records.learner_id
    AND (learners.teacher_id = auth.uid() OR auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    ))
  )
);

CREATE POLICY "Learners can view their own attendance"
ON public.attendance_records
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = attendance_records.learner_id
    AND learners.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_attendance_records_updated_at
BEFORE UPDATE ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_attendance_records_learner_id ON public.attendance_records(learner_id);
CREATE INDEX idx_attendance_records_date ON public.attendance_records(date DESC);
CREATE INDEX idx_attendance_records_status ON public.attendance_records(status);

-- Create function to calculate attendance rate
CREATE OR REPLACE FUNCTION public.calculate_attendance_rate(
  _learner_id UUID,
  _days INTEGER DEFAULT 30
)
RETURNS NUMERIC AS $$
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 100.0
      ELSE ROUND((COUNT(*) FILTER (WHERE status IN ('present', 'late')) * 100.0) / COUNT(*), 1)
    END
  FROM public.attendance_records
  WHERE learner_id = _learner_id
  AND date >= CURRENT_DATE - _days
$$ LANGUAGE SQL STABLE;

-- Create function to get low attendance learners
CREATE OR REPLACE FUNCTION public.get_low_attendance_learners(
  _teacher_id UUID,
  _threshold NUMERIC DEFAULT 75.0,
  _days INTEGER DEFAULT 30
)
RETURNS TABLE (
  learner_id UUID,
  attendance_rate NUMERIC,
  absent_days INTEGER,
  total_days INTEGER
) AS $$
  SELECT 
    l.id,
    public.calculate_attendance_rate(l.id, _days),
    COUNT(*) FILTER (WHERE ar.status IN ('absent')) AS absent_days,
    COUNT(*) AS total_days
  FROM public.learners l
  LEFT JOIN public.attendance_records ar ON ar.learner_id = l.id
    AND ar.date >= CURRENT_DATE - _days
  WHERE l.teacher_id = _teacher_id
  GROUP BY l.id
  HAVING public.calculate_attendance_rate(l.id, _days) < _threshold
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;