-- Update learners table RLS policy to allow only admins to insert
DROP POLICY IF EXISTS "Teachers can insert learner data" ON public.learners;

CREATE POLICY "Only admins can insert learner data"
ON public.learners
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));