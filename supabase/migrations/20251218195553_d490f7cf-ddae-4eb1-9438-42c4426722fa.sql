-- Allow learners to view their assigned teacher's profile
CREATE POLICY "Learners can view their teacher's profile" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM learners 
    WHERE learners.user_id = auth.uid() 
    AND learners.teacher_id = profiles.id
  )
);