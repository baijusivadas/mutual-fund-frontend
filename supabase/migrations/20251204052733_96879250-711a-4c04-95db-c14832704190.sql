-- Create roles table for custom roles
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_system_role boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create sidebar_items table to define navigation items
CREATE TABLE public.sidebar_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  href text NOT NULL,
  icon text NOT NULL,
  display_order integer DEFAULT 0,
  parent_id uuid REFERENCES public.sidebar_items(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create role_sidebar_items junction table
CREATE TABLE public.role_sidebar_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  sidebar_item_id uuid NOT NULL REFERENCES public.sidebar_items(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(role_id, sidebar_item_id)
);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sidebar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_sidebar_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for roles
CREATE POLICY "Authenticated users can view roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "SuperAdmins can manage roles" ON public.roles FOR ALL USING (has_role(auth.uid(), 'superAdmin'::app_role));

-- RLS policies for sidebar_items
CREATE POLICY "Authenticated users can view sidebar items" ON public.sidebar_items FOR SELECT USING (true);
CREATE POLICY "SuperAdmins can manage sidebar items" ON public.sidebar_items FOR ALL USING (has_role(auth.uid(), 'superAdmin'::app_role));

-- RLS policies for role_sidebar_items
CREATE POLICY "Authenticated users can view role sidebar items" ON public.role_sidebar_items FOR SELECT USING (true);
CREATE POLICY "SuperAdmins can manage role sidebar items" ON public.role_sidebar_items FOR ALL USING (has_role(auth.uid(), 'superAdmin'::app_role));

-- Update triggers
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system roles
INSERT INTO public.roles (name, description, is_system_role) VALUES
  ('superAdmin', 'Full system access', true),
  ('user', 'Standard user access', true);

-- Insert default sidebar items
INSERT INTO public.sidebar_items (name, href, icon, display_order) VALUES
  ('Dashboard', '/', 'LayoutDashboard', 1),
  ('Portfolio', '/portfolio', 'Briefcase', 2),
  ('Mutual Funds', '/mutual-funds', 'Landmark', 3),
  ('Derivatives', '/derivatives', 'TrendingDown', 4),
  ('Transactions', '/transactions', 'ArrowLeftRight', 5),
  ('Transaction Reports', '/transaction-reports', 'TableProperties', 6),
  ('P&L Report', '/pnl', 'TrendingUp', 7),
  ('Capital Gains', '/capital-gains', 'PieChart', 8),
  ('Stock Reports', '/stock-reports', 'FileText', 9),
  ('User Management', '/admin/users', 'Users', 10),
  ('Roles Management', '/admin/roles', 'Shield', 11),
  ('Real Estate', '/admin/real-estate', 'Building2', 12),
  ('Gold', '/admin/gold', 'Coins', 13),
  ('Flats', '/admin/flats', 'Home', 14),
  ('Rental Properties', '/admin/rental-properties', 'KeyRound', 15),
  ('Analytics', '/admin/analytics', 'BarChart3', 16),
  ('Notification History', '/admin/notifications', 'Bell', 17);

-- Assign sidebar items to roles
-- User role gets basic items (1-9)
INSERT INTO public.role_sidebar_items (role_id, sidebar_item_id)
SELECT r.id, s.id FROM public.roles r, public.sidebar_items s 
WHERE r.name = 'user' AND s.display_order <= 9;

-- SuperAdmin gets all items
INSERT INTO public.role_sidebar_items (role_id, sidebar_item_id)
SELECT r.id, s.id FROM public.roles r, public.sidebar_items s 
WHERE r.name = 'superAdmin';