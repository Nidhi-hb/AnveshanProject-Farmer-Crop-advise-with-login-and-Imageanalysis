-- Update Supabase auth settings to disable email confirmation for development
-- This script should be run in your Supabase dashboard SQL editor

-- Disable email confirmation requirement (for development)
UPDATE auth.config 
SET enable_signup = true, 
    enable_confirmations = false,
    enable_email_confirmations = false
WHERE id = 1;

-- Create a trigger to auto-confirm users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Auto-confirm email for new users
  UPDATE auth.users 
  SET email_confirmed_at = NOW(),
      confirmed_at = NOW()
  WHERE id = NEW.id;
  
  -- Insert farmer profile
  INSERT INTO public.farmer_profiles (id, farmer_name, farm_location, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'farmer_name', 'Farmer'),
    COALESCE(NEW.raw_user_meta_data->>'farm_location', 'Unknown Location'),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
