import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  return useQuery({
    queryKey: ["net-worth"],
    queryFn: async (): Promise<NetWorthData> => {
      // Fetch all asset data in parallel
      const [
        portfolioRes,
        rentalRes,
        flatsRes,
        goldRes,
        carsRes,
        realEstateRes,
        liabilitiesRes,
      ] = await Promise.all([
        supabase.from("scheme_summary").select("net_value"),
        supabase.from("rental_properties").select("monthly_rent, deposit"),
        supabase.from("flats").select("price"),
        supabase.from("gold").select("price"),
        supabase.from("cars").select("current_value"),
        supabase.from("real_estate").select("price"),
        supabase.from("liabilities").select("outstanding_amount").eq("status", "active"),
      ]);

      // Calculate totals
      const portfolio = (portfolioRes.data || []).reduce(
        (sum, item) => sum + (Number(item.net_value) || 0),
        0
      );

      const rentalProperties = (rentalRes.data || []).reduce(
        (sum, item) => sum + (Number(item.deposit) || 0) + (Number(item.monthly_rent) || 0) * 12,
        0
      );

      const flats = (flatsRes.data || []).reduce(
        (sum, item) => sum + (Number(item.price) || 0),
        0
      );

      const gold = (goldRes.data || []).reduce(
        (sum, item) => sum + (Number(item.price) || 0),
        0
      );

      const cars = (carsRes.data || []).reduce(
        (sum, item) => sum + (Number(item.current_value) || 0),
        0
      );

      const realEstate = (realEstateRes.data || []).reduce(
        (sum, item) => sum + (Number(item.price) || 0),
        0
      );

      const liabilities = (liabilitiesRes.data || []).reduce(
        (sum, item) => sum + (Number(item.outstanding_amount) || 0),
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
    staleTime: 5 * 60 * 1000,
  });
}
