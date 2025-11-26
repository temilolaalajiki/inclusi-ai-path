-- Phase 1: Critical Authentication Fixes
-- Fix RLS policy to prevent privilege escalation during self-registration

-- Drop the vulnerable policy that allows users to self-assign any role
DROP POLICY IF EXISTS "Users can insert their own role during signup" ON public.user_roles;

-- Create secure policy: users can ONLY self-register as learner
-- Admins can still create any role via edge functions
CREATE POLICY "Users can only self-register as learner" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  -- Users can ONLY insert themselves with 'learner' role
  (auth.uid() = user_id AND role = 'learner'::app_role) 
  -- OR admins can insert any role (for creating teachers/admins)
  OR has_role(auth.uid(), 'admin'::app_role)
);