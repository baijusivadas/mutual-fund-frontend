import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";

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
  const { user, role, token } = useAuth();

  return useQuery({
    queryKey: ['sidebar-items', role],
    queryFn: async (): Promise<SidebarItem[]> => {
      if (!user || !role || !token) return [];

      try {
        const response = await api.get("/sidebar");
        return response.data;
      } catch (error) {
        console.error('Sidebar fetch error:', error);
        return [];
      }
    },
    enabled: !!user && !!role && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};
