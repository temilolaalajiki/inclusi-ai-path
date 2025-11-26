-- AI Reasoning and Explainability tracking
CREATE TABLE IF NOT EXISTS public.ai_reasoning_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recommendation_id uuid REFERENCES public.recommendations(id) ON DELETE CASCADE,
  learner_id uuid NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  ai_model text NOT NULL,
  reasoning_chain jsonb NOT NULL DEFAULT '[]'::jsonb,
  data_sources_used jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence_score numeric DEFAULT 0.0,
  rule_based_fallback boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Data usage transparency tracking
CREATE TABLE IF NOT EXISTS public.data_usage_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  data_type text NOT NULL, -- 'performance', 'demographics', 'accessibility', 'attendance'
  purpose text NOT NULL, -- 'recommendation', 'analytics', 'reporting'
  data_fields text[] NOT NULL,
  processing_context text,
  consent_required boolean DEFAULT true,
  consent_given boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Bias monitoring and equity metrics
CREATE TABLE IF NOT EXISTS public.equity_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  demographic_category text NOT NULL, -- 'gender', 'location', 'income', 'language'
  demographic_value text NOT NULL,
  total_learners integer NOT NULL DEFAULT 0,
  recommendations_count integer NOT NULL DEFAULT 0,
  avg_recommendation_priority numeric DEFAULT 0.0,
  interventions_implemented integer NOT NULL DEFAULT 0,
  success_rate numeric DEFAULT 0.0,
  resource_allocation_score numeric DEFAULT 0.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(metric_date, demographic_category, demographic_value)
);

-- Ethical compliance tracking
CREATE TABLE IF NOT EXISTS public.ethical_compliance_checks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  check_date timestamptz NOT NULL DEFAULT now(),
  check_type text NOT NULL, -- 'bias_audit', 'fairness_check', 'transparency_review'
  status text NOT NULL DEFAULT 'pending', -- 'passed', 'flagged', 'failed'
  findings jsonb DEFAULT '{}'::jsonb,
  actions_taken jsonb DEFAULT '[]'::jsonb,
  reviewed_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User consent for data processing
CREATE TABLE IF NOT EXISTS public.user_data_consent (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  analytics_consent boolean DEFAULT false,
  ai_processing_consent boolean DEFAULT false,
  demographic_sharing_consent boolean DEFAULT false,
  research_participation_consent boolean DEFAULT false,
  consent_date timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_reasoning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ethical_compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data_consent ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_reasoning_logs
CREATE POLICY "Learners can view reasoning for their recommendations"
  ON public.ai_reasoning_logs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = ai_reasoning_logs.learner_id
    AND learners.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can view reasoning for their learners"
  ON public.ai_reasoning_logs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.learners
    WHERE learners.id = ai_reasoning_logs.learner_id
    AND (learners.teacher_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ));

CREATE POLICY "System can insert reasoning logs"
  ON public.ai_reasoning_logs
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for data_usage_logs
CREATE POLICY "Users can view their own data usage logs"
  ON public.data_usage_logs
  FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert usage logs"
  ON public.data_usage_logs
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for equity_metrics
CREATE POLICY "Admins can view all equity metrics"
  ON public.equity_metrics
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can view equity metrics"
  ON public.equity_metrics
  FOR SELECT
  USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for ethical_compliance_checks
CREATE POLICY "Only admins can manage compliance checks"
  ON public.ethical_compliance_checks
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_data_consent
CREATE POLICY "Users can view and manage their own consent"
  ON public.user_data_consent
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all consent records"
  ON public.user_data_consent
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_equity_metrics_updated_at
  BEFORE UPDATE ON public.equity_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_data_consent_updated_at
  BEFORE UPDATE ON public.user_data_consent
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_ai_reasoning_learner ON public.ai_reasoning_logs(learner_id);
CREATE INDEX idx_ai_reasoning_recommendation ON public.ai_reasoning_logs(recommendation_id);
CREATE INDEX idx_data_usage_user ON public.data_usage_logs(user_id);
CREATE INDEX idx_data_usage_type ON public.data_usage_logs(data_type);
CREATE INDEX idx_equity_metrics_date ON public.equity_metrics(metric_date);
CREATE INDEX idx_equity_metrics_category ON public.equity_metrics(demographic_category);
CREATE INDEX idx_compliance_checks_date ON public.ethical_compliance_checks(check_date);
CREATE INDEX idx_compliance_checks_status ON public.ethical_compliance_checks(status);