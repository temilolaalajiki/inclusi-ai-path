-- Backfill existing user emails from auth.users to profiles table
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
AND p.email IS NULL;