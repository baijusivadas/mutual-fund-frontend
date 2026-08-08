import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export interface UserInvestmentMapping {
  id: string;
  user_id: string;
  asset_type: string;
  investor_name: string | null;
  created_at: string;
}

export const useUserInvestments = () => {
  const { user, isSuperAdmin } = useAuth();

  // Fetch user's investment mappings, purchases, and redemptions in one API call
  const { data, isLoading } = useQuery({
    queryKey: ["user-investments", user?.id],
    queryFn: async () => {
      if (!user) return { mappings: [], purchases: [], redemptions: [], mappedInvestorNames: [] };
      
      const response = await api.get("/user-investments");
      return response.data || { mappings: [], purchases: [], redemptions: [], mappedInvestorNames: [] };
    },
    enabled: !!user,
  });

  const mappings = data?.mappings || [];
  const purchases = data?.purchases || [];
  const redemptions = data?.redemptions || [];
  const mappedInvestorNames = data?.mappedInvestorNames || [];

  // Check if user has specific asset type mapped
  const hasAssetTypeAccess = (assetType: string) => {
    if (isSuperAdmin) return true;
    return mappings.some((m: any) => m.asset_type === assetType);
  };

  return {
    mappings,
    purchases,
    redemptions,
    mappedInvestorNames,
    hasAssetTypeAccess,
    isLoading,
    hasInvestments: mappings.length > 0 || isSuperAdmin,
  };
};
