import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface SidebarItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  display_order: number;
  parent_id: string | null;
  is_active: boolean;
}

// Static fallback items for instant loading
const STATIC_SIDEBAR_ITEMS: Record<string, SidebarItem[]> = {
  superAdmin: [
    { id: '1', name: 'Dashboard', href: '/', icon: 'LayoutDashboard', display_order: 1, parent_id: null, is_active: true },
    { id: '2', name: 'Portfolio', href: '/portfolio', icon: 'Briefcase', display_order: 2, parent_id: null, is_active: true },
    { id: '3', name: 'Transactions', href: '/transactions', icon: 'ArrowLeftRight', display_order: 3, parent_id: null, is_active: true },
    { id: '4', name: 'Transaction Reports', href: '/transaction-reports', icon: 'FileText', display_order: 4, parent_id: null, is_active: true },
    { id: '5', name: 'Stock Reports', href: '/stock-reports', icon: 'TrendingUp', display_order: 5, parent_id: null, is_active: true },
    { id: '6', name: 'Analytics', href: '/analytics', icon: 'PieChart', display_order: 6, parent_id: null, is_active: true },
    { id: '7', name: 'P&L', href: '/pnl', icon: 'TrendingDown', display_order: 7, parent_id: null, is_active: true },
    { id: '8', name: 'Mutual Funds', href: '/mutual-funds', icon: 'Landmark', display_order: 8, parent_id: null, is_active: true },
    { id: '9', name: 'Derivatives', href: '/derivatives', icon: 'TableProperties', display_order: 9, parent_id: null, is_active: true },
    { id: '10', name: 'User Management', href: '/admin/users', icon: 'Users', display_order: 10, parent_id: null, is_active: true },
    { id: '11', name: 'Real Estate', href: '/real-estate', icon: 'Building2', display_order: 11, parent_id: null, is_active: true },
    { id: '12', name: 'Gold', href: '/gold', icon: 'Coins', display_order: 12, parent_id: null, is_active: true },
    { id: '13', name: 'Flats', href: '/flats', icon: 'Home', display_order: 13, parent_id: null, is_active: true },
    { id: '14', name: 'Rental Properties', href: '/rental-properties', icon: 'KeyRound', display_order: 14, parent_id: null, is_active: true },
    { id: '15', name: 'Capital Gains', href: '/capital-gains', icon: 'BarChart3', display_order: 15, parent_id: null, is_active: true },
    { id: '16', name: 'Notifications', href: '/notifications', icon: 'Bell', display_order: 16, parent_id: null, is_active: true },
    { id: '17', name: 'Roles Management', href: '/admin/roles', icon: 'Shield', display_order: 17, parent_id: null, is_active: true },
    { id: '18', name: 'Data Upload', href: '/admin/data-upload', icon: 'Upload', display_order: 18, parent_id: null, is_active: true },
    { id: '19', name: 'User Investment Mapping', href: '/admin/user-investment-mapping', icon: 'Link2', display_order: 19, parent_id: null, is_active: true },
  ],
  user: [
    { id: '1', name: 'Dashboard', href: '/', icon: 'LayoutDashboard', display_order: 1, parent_id: null, is_active: true },
    { id: '2', name: 'Portfolio', href: '/portfolio', icon: 'Briefcase', display_order: 2, parent_id: null, is_active: true },
    { id: '3', name: 'Transactions', href: '/transactions', icon: 'ArrowLeftRight', display_order: 3, parent_id: null, is_active: true },
    { id: '4', name: 'Transaction Reports', href: '/transaction-reports', icon: 'FileText', display_order: 4, parent_id: null, is_active: true },
    { id: '5', name: 'Stock Reports', href: '/stock-reports', icon: 'TrendingUp', display_order: 5, parent_id: null, is_active: true },
    { id: '6', name: 'Analytics', href: '/analytics', icon: 'PieChart', display_order: 6, parent_id: null, is_active: true },
    { id: '7', name: 'P&L', href: '/pnl', icon: 'TrendingDown', display_order: 7, parent_id: null, is_active: true },
    { id: '8', name: 'Mutual Funds', href: '/mutual-funds', icon: 'Landmark', display_order: 8, parent_id: null, is_active: true },
    { id: '9', name: 'Derivatives', href: '/derivatives', icon: 'TableProperties', display_order: 9, parent_id: null, is_active: true },
  ],
};

export const useSidebarItems = () => {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['sidebar-items', role],
    queryFn: async (): Promise<SidebarItem[]> => {
      if (!user || !role) return [];

      try {
        // Get the role record
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', role)
          .maybeSingle();

        if (roleError || !roleData) {
          console.error('Error fetching role:', roleError);
          return STATIC_SIDEBAR_ITEMS[role] || STATIC_SIDEBAR_ITEMS.user;
        }

        // Get sidebar items for this role in a single optimized query
        const { data: sidebarItems, error: sidebarError } = await supabase
          .from('sidebar_items')
          .select(`
            id, name, href, icon, display_order, parent_id, is_active,
            role_sidebar_items!inner(role_id)
          `)
          .eq('role_sidebar_items.role_id', roleData.id)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (sidebarError) {
          console.error('Error fetching sidebar items:', sidebarError);
          return STATIC_SIDEBAR_ITEMS[role] || STATIC_SIDEBAR_ITEMS.user;
        }

        return sidebarItems || STATIC_SIDEBAR_ITEMS[role] || [];
      } catch (error) {
        console.error('Sidebar fetch error:', error);
        return STATIC_SIDEBAR_ITEMS[role] || STATIC_SIDEBAR_ITEMS.user;
      }
    },
    enabled: !!user && !!role,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in garbage collection for 30 minutes
    placeholderData: () => {
      // Return static items immediately while loading
      return role ? STATIC_SIDEBAR_ITEMS[role] || STATIC_SIDEBAR_ITEMS.user : [];
    },
  });
};
