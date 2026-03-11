import { useQuery } from "@tanstack/react-query";
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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const useSidebarItems = () => {
  const { user, role, token } = useAuth();

  return useQuery({
    queryKey: ['sidebar-items', role],
    queryFn: async (): Promise<SidebarItem[]> => {
      if (!user || !role || !token) return [];

      try {
        const response = await fetch(`${BACKEND_URL}/api/sidebar`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch sidebar items');
        }

        return await response.json();
      } catch (error) {
        console.error('Sidebar fetch error:', error);
        return [];
      }
    },
    enabled: !!user && !!role && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};


