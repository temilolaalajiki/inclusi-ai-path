-- Create accessibility_logs table to track feature usage
CREATE TABLE public.accessibility_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_type TEXT NOT NULL, -- 'tts', 'high_contrast', 'font_size', 'keyboard_nav', 'read_selection'
  feature_value TEXT, -- specific value like voice name, font size, etc.
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.accessibility_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for accessibility logs
CREATE POLICY "Users can view their own accessibility logs" 
ON public.accessibility_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accessibility logs" 
ON public.accessibility_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all logs for analytics
CREATE POLICY "Admins can view all accessibility logs" 
ON public.accessibility_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create index for faster queries
CREATE INDEX idx_accessibility_logs_user_id ON public.accessibility_logs(user_id);
CREATE INDEX idx_accessibility_logs_feature_type ON public.accessibility_logs(feature_type);
CREATE INDEX idx_accessibility_logs_created_at ON public.accessibility_logs(created_at DESC);