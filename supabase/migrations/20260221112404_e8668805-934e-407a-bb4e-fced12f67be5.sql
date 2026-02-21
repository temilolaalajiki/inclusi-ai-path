
-- Create a teacher_feedback table for direct teacher feedback on learners
CREATE TABLE public.teacher_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID NOT NULL REFERENCES public.learners(id),
  teacher_id UUID NOT NULL,
  feedback_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teacher_feedback ENABLE ROW LEVEL SECURITY;

-- Teachers can insert feedback for their learners
CREATE POLICY "Teachers can insert feedback for their learners"
ON public.teacher_feedback
FOR INSERT
WITH CHECK (
  auth.uid() = teacher_id AND (
    EXISTS (
      SELECT 1 FROM public.learners
      WHERE learners.id = teacher_feedback.learner_id
      AND learners.teacher_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Teachers can view their own feedback
CREATE POLICY "Teachers can view their own feedback"
ON public.teacher_feedback
FOR SELECT
USING (auth.uid() = teacher_id);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
ON public.teacher_feedback
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Learners can view feedback about them
CREATE POLICY "Learners can view their own feedback"
ON public.teacher_feedback
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = teacher_feedback.learner_id
    AND learners.user_id = auth.uid()
  )
);
