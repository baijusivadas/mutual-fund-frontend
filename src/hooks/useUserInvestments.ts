import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserInvestmentMapping {
  id: string;
  user_id: string;
  asset_type: string;
  asset_id: string | null;
  investor_name: string | null;
  created_at: string;
}

export const useUserInvestments = () => {
  const { user, isSuperAdmin } = useAuth();

  // Fetch user's investment mappings
  const { data: mappings = [], isLoading: loadingMappings } = useQuery({
    queryKey: ["user-investment-mappings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_investment_mapping")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data as UserInvestmentMapping[];
    },
    enabled: !!user,
  });

  // Get mapped investor names for mutual funds
  const mappedInvestorNames = mappings
    .filter((m) => m.asset_type === "mutual_funds" && m.investor_name)
    .map((m) => m.investor_name as string);

  // Fetch purchases for mapped investor names only (for regular users)
  const { data: purchases = [], isLoading: loadingPurchases } = useQuery({
    queryKey: ["user-purchases", user?.id, mappedInvestorNames, isSuperAdmin],
    queryFn: async () => {
      if (!user) return [];
      
      // SuperAdmin sees all purchases
      if (isSuperAdmin) {
        const { data, error } = await supabase
          .from("purchases")
          .select("*")
          .order("date", { ascending: false });
        if (error) throw error;
        return data;
      }
      
      // Regular users see only their mapped investments
      if (mappedInvestorNames.length === 0) return [];
      
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .in("investor_name", mappedInvestorNames)
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && (isSuperAdmin || mappedInvestorNames.length > 0),
  });

  // Fetch redemptions for mapped investor names only (for regular users)
  const { data: redemptions = [], isLoading: loadingRedemptions } = useQuery({
    queryKey: ["user-redemptions", user?.id, mappedInvestorNames, isSuperAdmin],
    queryFn: async () => {
      if (!user) return [];
      
      // SuperAdmin sees all redemptions
      if (isSuperAdmin) {
        const { data, error } = await supabase
          .from("redemptions")
          .select("*")
          .order("date", { ascending: false });
        if (error) throw error;
        return data;
      }
      
      // Regular users see only their mapped investments
      if (mappedInvestorNames.length === 0) return [];
      
      const { data, error } = await supabase
        .from("redemptions")
        .select("*")
        .in("investor_name", mappedInvestorNames)
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && (isSuperAdmin || mappedInvestorNames.length > 0),
  });

  // Check if user has specific asset type mapped
  const hasAssetTypeAccess = (assetType: string) => {
    if (isSuperAdmin) return true;
    return mappings.some((m) => m.asset_type === assetType);
  };

  return {
    mappings,
    purchases,
    redemptions,
    mappedInvestorNames,
    hasAssetTypeAccess,
    isLoading: loadingMappings || loadingPurchases || loadingRedemptions,
    hasInvestments: mappings.length > 0 || isSuperAdmin,
  };
};
