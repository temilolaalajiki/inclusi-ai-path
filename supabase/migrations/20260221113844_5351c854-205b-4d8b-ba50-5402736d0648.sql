
-- Make user_id nullable for external learners (students not on the platform)
ALTER TABLE public.learners ALTER COLUMN user_id DROP NOT NULL;

-- Add columns for external learner tracking
ALTER TABLE public.learners ADD COLUMN is_external BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.learners ADD COLUMN external_name TEXT;

-- Allow teachers to insert external learners
CREATE POLICY "Teachers can insert external learners"
ON public.learners
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role)
  AND is_external = true
  AND teacher_id = auth.uid()
  AND user_id IS NULL
);
