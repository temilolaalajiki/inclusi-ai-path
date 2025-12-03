-- =====================================================
-- CONTENT MANAGEMENT SYSTEM - Phase 1: Database Schema
-- =====================================================

-- 1. LEARNING MATERIALS TABLE
CREATE TABLE public.learning_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'document', 'article', 'external_link')),
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL CHECK (grade_level IN ('JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3')),
  file_url TEXT,
  external_url TEXT,
  content_text TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. QUIZZES TABLE
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  material_id UUID REFERENCES public.learning_materials(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL CHECK (grade_level IN ('JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3')),
  time_limit_minutes INTEGER,
  pass_score NUMERIC NOT NULL DEFAULT 50,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. QUIZ QUESTIONS TABLE
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. QUIZ ATTEMPTS TABLE
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '{}'::jsonb,
  score NUMERIC,
  max_score NUMERIC,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. MATERIAL PROGRESS TABLE
CREATE TABLE public.material_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES public.learning_materials(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (material_id, learner_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_learning_materials_teacher ON public.learning_materials(teacher_id);
CREATE INDEX idx_learning_materials_subject ON public.learning_materials(subject);
CREATE INDEX idx_learning_materials_grade ON public.learning_materials(grade_level);
CREATE INDEX idx_learning_materials_published ON public.learning_materials(is_published);

CREATE INDEX idx_quizzes_teacher ON public.quizzes(teacher_id);
CREATE INDEX idx_quizzes_material ON public.quizzes(material_id);
CREATE INDEX idx_quizzes_subject ON public.quizzes(subject);
CREATE INDEX idx_quizzes_grade ON public.quizzes(grade_level);
CREATE INDEX idx_quizzes_published ON public.quizzes(is_published);

CREATE INDEX idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_order ON public.quiz_questions(quiz_id, order_index);

CREATE INDEX idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_learner ON public.quiz_attempts(learner_id);

CREATE INDEX idx_material_progress_material ON public.material_progress(material_id);
CREATE INDEX idx_material_progress_learner ON public.material_progress(learner_id);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_progress ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: LEARNING MATERIALS
-- =====================================================

-- Teachers can manage their own materials
CREATE POLICY "Teachers can manage their own materials"
ON public.learning_materials
FOR ALL
USING (auth.uid() = teacher_id OR has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = teacher_id OR has_role(auth.uid(), 'admin'));

-- Teachers can view all published materials
CREATE POLICY "Teachers can view published materials"
ON public.learning_materials
FOR SELECT
USING (is_published = true AND has_role(auth.uid(), 'teacher'));

-- Learners can view published materials for their grade
CREATE POLICY "Learners can view published materials for their grade"
ON public.learning_materials
FOR SELECT
USING (
  is_published = true 
  AND EXISTS (
    SELECT 1 FROM public.learners l
    WHERE l.user_id = auth.uid()
    AND l.demographics->>'grade' = learning_materials.grade_level
  )
);

-- =====================================================
-- RLS POLICIES: QUIZZES
-- =====================================================

-- Teachers can manage their own quizzes
CREATE POLICY "Teachers can manage their own quizzes"
ON public.quizzes
FOR ALL
USING (auth.uid() = teacher_id OR has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = teacher_id OR has_role(auth.uid(), 'admin'));

-- Teachers can view all published quizzes
CREATE POLICY "Teachers can view published quizzes"
ON public.quizzes
FOR SELECT
USING (is_published = true AND has_role(auth.uid(), 'teacher'));

-- Learners can view published quizzes for their grade
CREATE POLICY "Learners can view published quizzes for their grade"
ON public.quizzes
FOR SELECT
USING (
  is_published = true 
  AND EXISTS (
    SELECT 1 FROM public.learners l
    WHERE l.user_id = auth.uid()
    AND l.demographics->>'grade' = quizzes.grade_level
  )
);

-- =====================================================
-- RLS POLICIES: QUIZ QUESTIONS
-- =====================================================

-- Teachers can manage questions for their quizzes
CREATE POLICY "Teachers can manage their quiz questions"
ON public.quiz_questions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_questions.quiz_id
    AND (q.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_questions.quiz_id
    AND (q.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- Learners can view questions for published quizzes they can access
CREATE POLICY "Learners can view questions for accessible quizzes"
ON public.quiz_questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.learners l ON l.demographics->>'grade' = q.grade_level
    WHERE q.id = quiz_questions.quiz_id
    AND q.is_published = true
    AND l.user_id = auth.uid()
  )
);

-- =====================================================
-- RLS POLICIES: QUIZ ATTEMPTS
-- =====================================================

-- Learners can manage their own attempts
CREATE POLICY "Learners can manage their own quiz attempts"
ON public.quiz_attempts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.learners l
    WHERE l.id = quiz_attempts.learner_id
    AND l.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.learners l
    WHERE l.id = quiz_attempts.learner_id
    AND l.user_id = auth.uid()
  )
);

-- Teachers can view attempts by their learners
CREATE POLICY "Teachers can view their learners quiz attempts"
ON public.quiz_attempts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.learners l
    WHERE l.id = quiz_attempts.learner_id
    AND (l.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- =====================================================
-- RLS POLICIES: MATERIAL PROGRESS
-- =====================================================

-- Learners can manage their own progress
CREATE POLICY "Learners can manage their own material progress"
ON public.material_progress
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.learners l
    WHERE l.id = material_progress.learner_id
    AND l.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.learners l
    WHERE l.id = material_progress.learner_id
    AND l.user_id = auth.uid()
  )
);

-- Teachers can view their learners' progress
CREATE POLICY "Teachers can view their learners material progress"
ON public.material_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.learners l
    WHERE l.id = material_progress.learner_id
    AND (l.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

CREATE TRIGGER update_learning_materials_updated_at
BEFORE UPDATE ON public.learning_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_material_progress_updated_at
BEFORE UPDATE ON public.material_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- STORAGE BUCKET: LEARNING CONTENT
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('learning-content', 'learning-content', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Teachers can upload files
CREATE POLICY "Teachers can upload learning content"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'learning-content' 
  AND has_role(auth.uid(), 'teacher')
);

-- Storage RLS: Teachers can manage their own files
CREATE POLICY "Teachers can manage their learning content"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'learning-content' 
  AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'))
);

-- Storage RLS: Authenticated users can view files
CREATE POLICY "Authenticated users can view learning content"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'learning-content' 
  AND auth.role() = 'authenticated'
);