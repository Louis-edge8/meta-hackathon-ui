-- This is a simplified SQL script to fix the foreign key issue
-- Run this in your Supabase SQL editor

-- First, let's check what table the user_interests.user_id is referencing
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM
  information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'user_interests'
  AND kcu.column_name = 'user_id';

-- Create a simple function to create a user entry if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_user_if_not_exists(
  user_id uuid,
  user_email text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ref_table text;
  ref_column text;
BEGIN
  -- Find out which table the user_id references
  SELECT ccu.table_name, ccu.column_name
  INTO ref_table, ref_column
  FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'user_interests'
    AND kcu.column_name = 'user_id'
  LIMIT 1;

  -- If we found a reference table
  IF ref_table IS NOT NULL THEN
    -- Check if the table is in public schema
    IF ref_table = 'users' AND EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
      -- Insert into public.users if it exists
      EXECUTE format('
        INSERT INTO public.users (id, email)
        VALUES ($1, $2)
        ON CONFLICT (id) DO NOTHING
      ')
      USING user_id, user_email;
    ELSIF ref_table = 'profiles' AND EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN
      -- Insert into public.profiles if it exists
      EXECUTE format('
        INSERT INTO public.profiles (id)
        VALUES ($1)
        ON CONFLICT (id) DO NOTHING
      ')
      USING user_id;
    END IF;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_if_not_exists TO authenticated;

-- Option 1: If you want to create a public.users table that mirrors auth.users
-- Uncomment and run this if you don't already have a public.users table
/*
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to automatically add users to the public.users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Populate the users table with existing auth users
INSERT INTO public.users (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
*/

-- Option 2: If you want to modify the foreign key to point directly to auth.users
-- Uncomment and run this if you want to change the constraint
/*
ALTER TABLE user_interests DROP CONSTRAINT IF EXISTS user_interests_user_id_fkey;
ALTER TABLE user_interests ADD CONSTRAINT user_interests_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
*/

-- Enable RLS on user_interests table
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own interests
CREATE POLICY insert_own_interests ON user_interests
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to select their own interests
CREATE POLICY select_own_interests ON user_interests
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to update their own interests
CREATE POLICY update_own_interests ON user_interests
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own interests
CREATE POLICY delete_own_interests ON user_interests
FOR DELETE TO authenticated
USING (auth.uid() = user_id);
