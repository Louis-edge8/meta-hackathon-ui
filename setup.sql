-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modify user_interests table to reference profiles instead of auth.users directly
ALTER TABLE user_interests 
DROP CONSTRAINT IF EXISTS user_interests_user_id_fkey;

ALTER TABLE user_interests
ADD CONSTRAINT user_interests_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
