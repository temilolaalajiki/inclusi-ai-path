-- Allow learners to insert their own profile record (with teacher_id NULL)
CREATE POLICY "Learners can insert their own profile"
ON public.learners
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND teacher_id IS NULL
  AND has_role(auth.uid(), 'learner'::app_role)
);