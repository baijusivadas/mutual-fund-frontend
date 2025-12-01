-- Create function to delete a user (for superAdmins only)
-- This will delete the user from profiles and user_roles (cascade)
-- Note: We cannot delete from auth.users directly via SQL, so this soft-deletes by removing profile
CREATE OR REPLACE FUNCTION public.delete_user(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow superAdmins to delete users
  IF NOT has_role(auth.uid(), 'superAdmin'::app_role) THEN
    RAISE EXCEPTION 'Only superAdmins can delete users';
  END IF;

  -- Delete from profiles (this will cascade to user_roles)
  DELETE FROM public.profiles WHERE id = _user_id;
END;
$$;