-- Add Nigerian-specific learning challenges tracking
CREATE TABLE IF NOT EXISTS public.nigerian_learning_contexts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id uuid NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  primary_language text NOT NULL DEFAULT 'English',
  home_languages text[] DEFAULT ARRAY[]::text[],
  language_proficiency jsonb DEFAULT '{"english": "intermediate", "home_language": "fluent"}'::jsonb,
  resource_constraints text[] DEFAULT ARRAY[]::text[],
  cultural_considerations text[] DEFAULT ARRAY[]::text[],
  community_support_level text DEFAULT 'moderate',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(learner_id)
);

-- Add socioeconomic demographics
CREATE TABLE IF NOT EXISTS public.learner_demographics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id uuid NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  household_size integer,
  guardian_education_level text,
  family_income_bracket text,
  access_to_technology text DEFAULT 'limited',
  distance_to_school_km numeric,
  transportation_method text,
  meals_per_day integer,
  has_electricity boolean DEFAULT false,
  has_internet_access boolean DEFAULT false,
  location_type text DEFAULT 'urban',
  state text,
  lga text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(learner_id)
);

-- Expand accessibility needs with Nigerian context
CREATE TABLE IF NOT EXISTS public.accessibility_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id uuid NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  visual_needs text[] DEFAULT ARRAY[]::text[],
  auditory_needs text[] DEFAULT ARRAY[]::text[],
  physical_needs text[] DEFAULT ARRAY[]::text[],
  cognitive_needs text[] DEFAULT ARRAY[]::text[],
  language_support_needs text[] DEFAULT ARRAY[]::text[],
  assistive_devices_available text[] DEFAULT ARRAY[]::text[],
  assistive_devices_needed text[] DEFAULT ARRAY[]::text[],
  environmental_accommodations text[] DEFAULT ARRAY[]::text[],
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(learner_id)
);

-- Enable RLS on new tables
ALTER TABLE public.nigerian_learning_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nigerian_learning_contexts
CREATE POLICY "Learners can view their own learning context"
  ON public.nigerian_learning_contexts
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = nigerian_learning_contexts.learner_id
    AND learners.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can view their learners context"
  ON public.nigerian_learning_contexts
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = nigerian_learning_contexts.learner_id
    AND (learners.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ));

CREATE POLICY "Teachers and admins can insert context"
  ON public.nigerian_learning_contexts
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'teacher'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Teachers and admins can update context"
  ON public.nigerian_learning_contexts
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = nigerian_learning_contexts.learner_id
    AND (learners.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ));

-- RLS Policies for learner_demographics
CREATE POLICY "Learners can view their own demographics"
  ON public.learner_demographics
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = learner_demographics.learner_id
    AND learners.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can view their learners demographics"
  ON public.learner_demographics
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = learner_demographics.learner_id
    AND (learners.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ));

CREATE POLICY "Teachers and admins can insert demographics"
  ON public.learner_demographics
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'teacher'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Teachers and admins can update demographics"
  ON public.learner_demographics
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = learner_demographics.learner_id
    AND (learners.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ));

-- RLS Policies for accessibility_profiles
CREATE POLICY "Learners can view their own accessibility profile"
  ON public.accessibility_profiles
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = accessibility_profiles.learner_id
    AND learners.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can view their learners accessibility profiles"
  ON public.accessibility_profiles
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = accessibility_profiles.learner_id
    AND (learners.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ));

CREATE POLICY "Teachers and admins can insert accessibility profiles"
  ON public.accessibility_profiles
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'teacher'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Teachers and admins can update accessibility profiles"
  ON public.accessibility_profiles
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = accessibility_profiles.learner_id
    AND (learners.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_nigerian_learning_contexts_updated_at
  BEFORE UPDATE ON public.nigerian_learning_contexts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learner_demographics_updated_at
  BEFORE UPDATE ON public.learner_demographics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accessibility_profiles_updated_at
  BEFORE UPDATE ON public.accessibility_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_nigerian_contexts_learner ON public.nigerian_learning_contexts(learner_id);
CREATE INDEX idx_demographics_learner ON public.learner_demographics(learner_id);
CREATE INDEX idx_accessibility_profiles_learner ON public.accessibility_profiles(learner_id);