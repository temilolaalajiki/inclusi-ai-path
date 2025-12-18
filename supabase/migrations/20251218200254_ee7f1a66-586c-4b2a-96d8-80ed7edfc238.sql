-- Drop the restrictive policy and create a permissive one
DROP POLICY IF EXISTS "Teachers can update their assigned learners" ON public.learners;

-- Create a permissive policy that allows teachers and admins to update learners
CREATE POLICY "Teachers and admins can update learners" 
ON public.learners 
FOR UPDATE 
USING (
  (auth.uid() = teacher_id) OR has_role(auth.uid(), 'admin'::app_role)
);