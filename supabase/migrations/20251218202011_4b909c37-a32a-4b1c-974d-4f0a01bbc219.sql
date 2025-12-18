-- Drop existing learner policies for learning_materials and quizzes
DROP POLICY IF EXISTS "Learners can view published materials for their grade" ON public.learning_materials;
DROP POLICY IF EXISTS "Learners can view published quizzes for their grade" ON public.quizzes;

-- Create new policy: Learners can only view published materials from their assigned teacher
CREATE POLICY "Learners can view published materials from their teacher" 
ON public.learning_materials 
FOR SELECT 
USING (
  is_published = true 
  AND EXISTS (
    SELECT 1 FROM learners l
    WHERE l.user_id = auth.uid()
    AND l.teacher_id = learning_materials.teacher_id
    AND (l.demographics ->> 'grade') = learning_materials.grade_level
  )
);

-- Create new policy: Learners can only view published quizzes from their assigned teacher
CREATE POLICY "Learners can view published quizzes from their teacher" 
ON public.quizzes 
FOR SELECT 
USING (
  is_published = true 
  AND EXISTS (
    SELECT 1 FROM learners l
    WHERE l.user_id = auth.uid()
    AND l.teacher_id = quizzes.teacher_id
    AND (l.demographics ->> 'grade') = quizzes.grade_level
  )
);

-- Also update quiz_questions policy to match the new quiz access
DROP POLICY IF EXISTS "Learners can view questions for accessible quizzes" ON public.quiz_questions;

CREATE POLICY "Learners can view questions for accessible quizzes" 
ON public.quiz_questions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN learners l ON l.teacher_id = q.teacher_id 
      AND (l.demographics ->> 'grade') = q.grade_level
    WHERE q.id = quiz_questions.quiz_id 
    AND q.is_published = true 
    AND l.user_id = auth.uid()
  )
);