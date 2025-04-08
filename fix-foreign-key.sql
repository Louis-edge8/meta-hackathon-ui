-- Create a function to check if a user exists in auth.users
CREATE OR REPLACE FUNCTION public.get_auth_user_by_id(user_id UUID)
RETURNS SETOF auth.users
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM auth.users WHERE id = user_id;
$$;

-- Grant execute permission to the anon role
GRANT EXECUTE ON FUNCTION public.get_auth_user_by_id TO anon;
GRANT EXECUTE ON FUNCTION public.get_auth_user_by_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_user_by_id TO service_role;

-- Check the current foreign key constraint
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

-- If needed, drop and recreate the foreign key constraint
-- ALTER TABLE user_interests DROP CONSTRAINT user_interests_user_id_fkey;
-- ALTER TABLE user_interests ADD CONSTRAINT user_interests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create a trigger to validate user_id before insert
CREATE OR REPLACE FUNCTION public.validate_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user_id exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.user_id) THEN
    RAISE EXCEPTION 'User ID % does not exist in auth.users', NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_user_id_trigger ON user_interests;
CREATE TRIGGER validate_user_id_trigger
BEFORE INSERT OR UPDATE ON user_interests
FOR EACH ROW
EXECUTE FUNCTION validate_user_id();

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
