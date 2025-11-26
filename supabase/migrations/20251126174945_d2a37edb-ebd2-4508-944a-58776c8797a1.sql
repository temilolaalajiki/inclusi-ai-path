-- Nigerian education system curriculum standards
CREATE TABLE IF NOT EXISTS public.curriculum_standards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  examination_body text NOT NULL, -- 'WAEC', 'NECO', 'JAMB', 'STATE'
  subject text NOT NULL,
  grade_level text NOT NULL,
  learning_objectives jsonb NOT NULL DEFAULT '[]'::jsonb,
  competency_areas text[] DEFAULT ARRAY[]::text[],
  assessment_criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- State-specific educational policies
CREATE TABLE IF NOT EXISTS public.state_education_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state text NOT NULL,
  policy_name text NOT NULL,
  policy_type text NOT NULL, -- 'CURRICULUM', 'ASSESSMENT', 'ACCESSIBILITY', 'INFRASTRUCTURE'
  description text NOT NULL,
  implementation_guidelines text,
  effective_date date,
  requirements jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(state, policy_name)
);

-- Link performance records to curriculum standards
ALTER TABLE public.performance_records 
ADD COLUMN IF NOT EXISTS curriculum_standard_id uuid REFERENCES public.curriculum_standards(id),
ADD COLUMN IF NOT EXISTS examination_body text,
ADD COLUMN IF NOT EXISTS grade_level text,
ADD COLUMN IF NOT EXISTS competency_scores jsonb DEFAULT '{}'::jsonb;

-- Assessment frameworks
CREATE TABLE IF NOT EXISTS public.assessment_frameworks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  framework_type text NOT NULL, -- 'FORMATIVE', 'SUMMATIVE', 'DIAGNOSTIC', 'CONTINUOUS'
  examination_body text, -- 'WAEC', 'NECO', 'INTERNAL'
  grade_levels text[] NOT NULL,
  subjects text[] NOT NULL,
  grading_scale jsonb NOT NULL DEFAULT '{}'::jsonb,
  pass_mark numeric NOT NULL DEFAULT 40,
  excellence_mark numeric NOT NULL DEFAULT 75,
  assessment_components jsonb NOT NULL DEFAULT '[]'::jsonb,
  weighting jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Learner curriculum alignment tracking
CREATE TABLE IF NOT EXISTS public.learner_curriculum_alignment (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id uuid NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  curriculum_standard_id uuid NOT NULL REFERENCES public.curriculum_standards(id),
  grade_level text NOT NULL,
  alignment_status text DEFAULT 'on_track', -- 'ahead', 'on_track', 'needs_support', 'critical'
  competency_progress jsonb DEFAULT '{}'::jsonb,
  last_assessment_date date,
  next_assessment_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(learner_id, curriculum_standard_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.curriculum_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.state_education_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_curriculum_alignment ENABLE ROW LEVEL SECURITY;

-- RLS Policies for curriculum_standards
CREATE POLICY "Everyone can view curriculum standards"
  ON public.curriculum_standards
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage curriculum standards"
  ON public.curriculum_standards
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for state_education_policies
CREATE POLICY "Everyone can view education policies"
  ON public.state_education_policies
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage education policies"
  ON public.state_education_policies
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for assessment_frameworks
CREATE POLICY "Teachers and admins can view assessment frameworks"
  ON public.assessment_frameworks
  FOR SELECT
  USING (
    has_role(auth.uid(), 'teacher'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Only admins can manage assessment frameworks"
  ON public.assessment_frameworks
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for learner_curriculum_alignment
CREATE POLICY "Learners can view their own curriculum alignment"
  ON public.learner_curriculum_alignment
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = learner_curriculum_alignment.learner_id
    AND learners.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can view their learners curriculum alignment"
  ON public.learner_curriculum_alignment
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = learner_curriculum_alignment.learner_id
    AND (learners.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ));

CREATE POLICY "Teachers and admins can manage curriculum alignment"
  ON public.learner_curriculum_alignment
  FOR ALL
  USING (
    has_role(auth.uid(), 'teacher'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Add triggers for updated_at
CREATE TRIGGER update_curriculum_standards_updated_at
  BEFORE UPDATE ON public.curriculum_standards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_state_education_policies_updated_at
  BEFORE UPDATE ON public.state_education_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessment_frameworks_updated_at
  BEFORE UPDATE ON public.assessment_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learner_curriculum_alignment_updated_at
  BEFORE UPDATE ON public.learner_curriculum_alignment
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_curriculum_standards_subject ON public.curriculum_standards(subject);
CREATE INDEX idx_curriculum_standards_exam_body ON public.curriculum_standards(examination_body);
CREATE INDEX idx_state_policies_state ON public.state_education_policies(state);
CREATE INDEX idx_assessment_frameworks_type ON public.assessment_frameworks(framework_type);
CREATE INDEX idx_learner_alignment_learner ON public.learner_curriculum_alignment(learner_id);
CREATE INDEX idx_learner_alignment_standard ON public.learner_curriculum_alignment(curriculum_standard_id);