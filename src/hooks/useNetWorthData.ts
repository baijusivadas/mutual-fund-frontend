import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";

export interface NetWorthData {
  portfolio: number;
  rentalProperties: number;
  flats: number;
  gold: number;
  cars: number;
  realEstate: number;
  liabilities: number;
  totalAssets: number;
  netWorth: number;
}

export function useNetWorthData() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["net-worth"],
    queryFn: async (): Promise<NetWorthData> => {
      // Fetch portfolio net values from Supabase, and advanced assets from the Express API in parallel
      const [
        portfolioRes,
        rentalRes,
        flatsRes,
        goldRes,
        customAssetsRes,
        realEstateRes,
        liabilitiesRes,
      ] = await Promise.all([
        supabase.from("scheme_summary").select("net_value"),
        api.get("/advanced/rental_properties").catch(() => ({ data: [] })),
        api.get("/advanced/flats").catch(() => ({ data: [] })),
        api.get("/advanced/gold").catch(() => ({ data: [] })),
        api.get("/advanced/custom_assets").catch(() => ({ data: [] })),
        api.get("/advanced/real_estate").catch(() => ({ data: [] })),
        api.get("/advanced/liabilities").catch(() => ({ data: [] })),
      ]);

      const getArray = (res: any) => {
        if (!res || !res.data) return [];
        return Array.isArray(res.data) ? res.data : (res.data.data || []);
      };

      const rentalData = getArray(rentalRes);
      const flatsData = getArray(flatsRes);
      const goldData = getArray(goldRes);
      const customAssetsData = getArray(customAssetsRes);
      const realEstateData = getArray(realEstateRes);
      const liabilitiesData = getArray(liabilitiesRes);

      // Calculate totals
      const portfolio = (portfolioRes.data || []).reduce(
        (sum, item) => sum + (Number(item.net_value) || 0),
        0
      );

      const rentalProperties = rentalData.reduce(
        (sum, item: any) => sum + (Number(item.deposit) || 0) + (Number(item.monthly_rent) || 0) * 12,
        0
      );

      const flats = flatsData.reduce(
        (sum, item: any) => sum + (Number(item.price) || 0),
        0
      );

      const gold = goldData.reduce(
        (sum, item: any) => sum + (Number(item.price) || 0),
        0
      );

      // Extract vehicle type custom assets for vehicles count
      const cars = customAssetsData
        .filter((item: any) => item.asset_type === "vehicle")
        .reduce(
          (sum, item: any) => sum + (Number(item.current_value) || Number(item.purchase_price) || 0),
          0
        );

      const realEstate = realEstateData.reduce(
        (sum, item: any) => sum + (Number(item.price) || 0),
        0
      );

      const liabilities = liabilitiesData.reduce(
        (sum, item: any) => sum + (Number(item.outstanding_amount) || 0),
        0
      );

      const totalAssets = portfolio + rentalProperties + flats + gold + cars + realEstate;
      const netWorth = totalAssets - liabilities;

      return {
        portfolio,
        rentalProperties,
        flats,
        gold,
        cars,
        realEstate,
        liabilities,
        totalAssets,
        netWorth,
      };
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

