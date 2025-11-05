-- Allow teachers to view profiles of their assigned learners
CREATE POLICY "Teachers can view their learners profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.learners
    WHERE learners.user_id = profiles.id
    AND learners.teacher_id = auth.uid()
  )
);