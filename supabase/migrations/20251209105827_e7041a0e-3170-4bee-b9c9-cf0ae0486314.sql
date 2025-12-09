-- Add email column to profiles table to store user emails for display purposes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);