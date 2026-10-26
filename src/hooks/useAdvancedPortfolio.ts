import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";
import api from "@/services/api";

type PortfolioRecord = Record<string, string | number | null | undefined>;

export interface AdvancedPortfolioData {
  metrics: {
    totalProperties: number;
    totalPropertyValue: number;
    totalMonthlyRevenue: number;
    occupancyRate: number;
    statusDistribution: { name: string; value: number }[];
    revenueData: { month: string; revenue: number }[];
  };
  details: {
    realEstate: PortfolioRecord[];
    flats: PortfolioRecord[];
    rentalProperties: PortfolioRecord[];
    bankAccounts: PortfolioRecord[];
    liabilities: PortfolioRecord[];
    customAssets: PortfolioRecord[];
    crypto: PortfolioRecord[];
    bonds: PortfolioRecord[];
    etfs: PortfolioRecord[];
    nps: PortfolioRecord[];
    mutualFunds: PortfolioRecord[];
  };
}

function numericValue(value: string | number | null | undefined): number {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export const useAdvancedPortfolio = () => {
  const { token } = useAuth();

  const { data, isLoading, error } = useQuery<AdvancedPortfolioData>({
    queryKey: ["consolidated-portfolio"],
    queryFn: async () => {
      const res = await api.get("/analytics/metrics");
      return res.data;
    },
    enabled: !!token,
    staleTime: 60 * 1000, // 1 minute stale time for portfolio data
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
  });

  const calculatedMetrics = useMemo(() => {
    if (!data?.details) return { totalLiabilities: 0, totalAssets: 0, totalInvestments: 0 };

    const { details } = data;

    const totalLiabilities = (details.liabilities || []).reduce(
      (sum, l) => sum + numericValue(l.outstanding_amount),
      0
    );

    const totalAssets = [
      ...(details.bankAccounts || []),
      ...(details.customAssets || []),
      ...(details.realEstate || []),
      ...(details.flats || []),
      ...(details.rentalProperties || []),
    ].reduce((sum, a) => {
      const val = numericValue(a.current_balance || a.current_value || a.price || a.purchase_price);
      return sum + val;
    }, 0);

    const totalInvestments = [
      ...(details.crypto || []).map(
        (c) => numericValue(c.current_price || c.average_price) * numericValue(c.quantity)
      ),
      ...(details.bonds || []).map(
        (b) => numericValue(b.face_value || b.amount) * numericValue(b.quantity || 1)
      ),
      ...(details.etfs || []).map(
        (e) => numericValue(e.current_nav || e.purchase_price) * numericValue(e.quantity)
      ),
      ...(details.nps || []).map((n) => numericValue(n.current_value || n.amount_invested)),
    ].reduce((sum, val) => sum + val, 0);

    return {
      totalLiabilities,
      totalAssets,
      totalInvestments,
    };
  }, [data]);

  return {
    raw: data?.details || {},
    ...calculatedMetrics,
    isLoading,
    error,
  };
};

export const getAdvancedQueryKey = (entity: string) => ["advanced", entity];

export const useAdvancedEntity = <T extends object = PortfolioRecord>(entity: string) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: getAdvancedQueryKey(entity),
    queryFn: async () => {
      const res = await api.get(`/advanced/${entity}`);
      const payload: unknown = res.data;
      if (Array.isArray(payload)) return payload as T[];
      if (
        typeof payload === "object" &&
        payload !== null &&
        "data" in payload &&
        Array.isArray(payload.data)
      ) {
        return payload.data as T[];
      }
      throw new Error("The backend returned an invalid asset list");
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
};
