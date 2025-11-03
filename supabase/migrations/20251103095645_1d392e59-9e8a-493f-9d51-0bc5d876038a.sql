-- Create training resources table
CREATE TABLE public.training_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  target_skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  resource_url TEXT,
  difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on training_resources
ALTER TABLE public.training_resources ENABLE ROW LEVEL SECURITY;

-- Teachers and admins can view all training resources
CREATE POLICY "Teachers and admins can view all training resources"
  ON public.training_resources
  FOR SELECT
  USING (
    has_role(auth.uid(), 'teacher'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Admins can insert training resources
CREATE POLICY "Admins can insert training resources"
  ON public.training_resources
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update training resources
CREATE POLICY "Admins can update training resources"
  ON public.training_resources
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create training reviews table
CREATE TABLE public.training_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID NOT NULL REFERENCES public.training_resources(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on training_reviews
ALTER TABLE public.training_reviews ENABLE ROW LEVEL SECURITY;

-- Teachers can view all reviews
CREATE POLICY "Teachers can view all reviews"
  ON public.training_reviews
  FOR SELECT
  USING (
    has_role(auth.uid(), 'teacher'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Teachers can insert their own reviews
CREATE POLICY "Teachers can insert their own reviews"
  ON public.training_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- Create learner documents table for file storage
CREATE TABLE public.learner_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on learner_documents
ALTER TABLE public.learner_documents ENABLE ROW LEVEL SECURITY;

-- Teachers can view documents for their learners
CREATE POLICY "Teachers can view their learners documents"
  ON public.learner_documents
  FOR SELECT
  USING (
    auth.uid() = teacher_id OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Teachers can insert documents
CREATE POLICY "Teachers can insert documents"
  ON public.learner_documents
  FOR INSERT
  WITH CHECK (
    auth.uid() = teacher_id OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Learners can view their own documents
CREATE POLICY "Learners can view their own documents"
  ON public.learner_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM learners 
      WHERE learners.id = learner_documents.learner_id 
      AND learners.user_id = auth.uid()
    )
  );

-- Create storage bucket for learner documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('learner-documents', 'learner-documents', false);

-- Create storage policies for learner documents
CREATE POLICY "Teachers can upload learner documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'learner-documents' AND
    (SELECT has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Teachers and learners can view documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'learner-documents' AND
    (
      has_role(auth.uid(), 'teacher'::app_role) OR 
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'learner'::app_role)
    )
  );

-- Create trigger for updated_at on training_resources
CREATE TRIGGER update_training_resources_updated_at
  BEFORE UPDATE ON public.training_resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample training resources
INSERT INTO public.training_resources (title, description, duration, target_skills, resource_url, difficulty_level)
VALUES
  (
    'Supporting Students with Dyslexia',
    'Comprehensive guide to teaching strategies for dyslexic learners including multisensory approaches and assistive technology.',
    '3 hours',
    ARRAY['dyslexia', 'reading support', 'assistive technology'],
    'https://example.com/dyslexia-course',
    'intermediate'
  ),
  (
    'ADHD: Classroom Management Strategies',
    'Practical techniques for supporting students with ADHD including environmental modifications and behavioral interventions.',
    '2 hours',
    ARRAY['adhd', 'classroom management', 'behavioral support'],
    'https://example.com/adhd-course',
    'beginner'
  ),
  (
    'Visual Learning Techniques',
    'Methods for incorporating visual aids, graphic organizers, and multimedia to enhance learning.',
    '1.5 hours',
    ARRAY['visual learning', 'teaching strategies'],
    'https://example.com/visual-learning',
    'beginner'
  ),
  (
    'Accessibility Tools and Technology',
    'Overview of assistive technology tools including text-to-speech, screen readers, and accessibility features.',
    '2.5 hours',
    ARRAY['assistive technology', 'accessibility', 'technology integration'],
    'https://example.com/accessibility-tech',
    'intermediate'
  ),
  (
    'Differentiated Instruction Advanced',
    'Advanced strategies for tailoring instruction to meet diverse learning needs in inclusive classrooms.',
    '4 hours',
    ARRAY['differentiation', 'inclusive education', 'teaching strategies'],
    'https://example.com/differentiation-advanced',
    'advanced'
  );