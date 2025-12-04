import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SidebarItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  display_order: number;
  parent_id: string | null;
  is_active: boolean;
}

export const useSidebarItems = () => {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['sidebar-items', user?.id, role],
    queryFn: async (): Promise<SidebarItem[]> => {
      if (!user || !role) return [];

      // Get the role record
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', role)
        .maybeSingle();

      if (roleError || !roleData) {
        console.error('Error fetching role:', roleError);
        return [];
      }

      // Get sidebar items for this role
      const { data: roleItems, error: itemsError } = await supabase
        .from('role_sidebar_items')
        .select('sidebar_item_id')
        .eq('role_id', roleData.id);

      if (itemsError) {
        console.error('Error fetching role sidebar items:', itemsError);
        return [];
      }

      const sidebarItemIds = roleItems.map(ri => ri.sidebar_item_id);

      if (sidebarItemIds.length === 0) return [];

      // Get the actual sidebar items
      const { data: sidebarItems, error: sidebarError } = await supabase
        .from('sidebar_items')
        .select('*')
        .in('id', sidebarItemIds)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (sidebarError) {
        console.error('Error fetching sidebar items:', sidebarError);
        return [];
      }

      return sidebarItems || [];
    },
    enabled: !!user && !!role,
    staleTime: 5 * 60 * 1000,
  });
};