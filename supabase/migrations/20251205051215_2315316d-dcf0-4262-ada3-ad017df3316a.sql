-- Add parent_id to roles for hierarchical structure
ALTER TABLE public.roles ADD COLUMN parent_id uuid REFERENCES public.roles(id) ON DELETE SET NULL;

-- Create index for faster hierarchy queries
CREATE INDEX idx_roles_parent_id ON public.roles(parent_id);

-- Create a function to get all descendant roles
CREATE OR REPLACE FUNCTION public.get_role_descendants(root_role_id uuid)
RETURNS TABLE(role_id uuid, role_name text, depth integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE role_tree AS (
    SELECT id, name, 0 as depth
    FROM public.roles
    WHERE id = root_role_id
    UNION ALL
    SELECT r.id, r.name, rt.depth + 1
    FROM public.roles r
    INNER JOIN role_tree rt ON r.parent_id = rt.id
  )
  SELECT id as role_id, name as role_name, depth
  FROM role_tree
  WHERE id != root_role_id;
$$;

-- Create a function to check if user has access to another user's data based on role hierarchy
CREATE OR REPLACE FUNCTION public.can_access_user_data(accessor_user_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles accessor_role
    INNER JOIN public.user_roles target_role ON target_role.user_id = target_user_id
    INNER JOIN public.roles target_r ON target_r.id = (
      SELECT r.id FROM public.roles r WHERE r.name = target_role.role::text
    )
    WHERE accessor_role.user_id = accessor_user_id
    AND (
      -- SuperAdmin can access everyone
      accessor_role.role = 'superAdmin'::app_role
      -- Or check if target role is a descendant of accessor's role
      OR EXISTS (
        SELECT 1 FROM public.get_role_descendants(
          (SELECT r.id FROM public.roles r WHERE r.name = accessor_role.role::text)
        ) d WHERE d.role_name = target_role.role::text
      )
    )
  );
$$;