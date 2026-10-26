import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export interface NetWorthData {
  portfolio: number;
  rentalProperties: number;
  flats: number;
  gold: number;
  cars: number;
  otherAssets: number;
  realEstate: number;
  liabilities: number;
  totalAssets: number;
  netWorth: number;
}

type AssetRecord = Record<string, unknown>;

function isAssetRecord(value: unknown): value is AssetRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getArray(response: { data: unknown }): AssetRecord[] {
  const payload = response.data;
  const records = Array.isArray(payload)
    ? payload
    : isAssetRecord(payload)
      ? payload.data
      : undefined;

  if (!Array.isArray(records) || !records.every(isAssetRecord)) {
    throw new Error("The backend returned an invalid asset list");
  }

  return records;
}

function numericValue(value: unknown): number {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function useNetWorthData() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["net-worth"],
    queryFn: async (): Promise<NetWorthData> => {
      // Fetch portfolio net values from the Express API, and advanced assets
      const [
        portfolioRes,
        rentalRes,
        flatsRes,
        goldRes,
        customAssetsRes,
        realEstateRes,
        liabilitiesRes,
      ] = await Promise.all([
        api.get("/analytics/scheme-summary"),
        api.get("/advanced/rental_properties"),
        api.get("/advanced/flats"),
        api.get("/advanced/gold"),
        api.get("/advanced/custom_assets"),
        api.get("/advanced/real_estate"),
        api.get("/advanced/liabilities"),
      ]);

      const portfolioData = getArray(portfolioRes);
      const rentalData = getArray(rentalRes);
      const flatsData = getArray(flatsRes);
      const goldData = getArray(goldRes);
      const customAssetsData = getArray(customAssetsRes);
      const realEstateData = getArray(realEstateRes);
      const liabilitiesData = getArray(liabilitiesRes);

      // Calculate totals
      const portfolio = portfolioData.reduce((sum, item) => sum + numericValue(item.net_value), 0);

      const rentalProperties = rentalData.reduce(
        (sum, item) => sum + numericValue(item.deposit) + numericValue(item.monthly_rent) * 12,
        0
      );

      const flats = flatsData.reduce((sum, item) => sum + numericValue(item.price), 0);

      const gold = goldData.reduce((sum, item) => sum + numericValue(item.price), 0);

      // Separate vehicles from other custom assets so every custom asset is included once.
      const cars = customAssetsData
        .filter((item) => item.asset_type === "vehicle")
        .reduce((sum, item) => sum + numericValue(item.current_value || item.purchase_price), 0);

      const otherAssets = customAssetsData
        .filter((item) => item.asset_type !== "vehicle")
        .reduce((sum, item) => sum + numericValue(item.current_value || item.purchase_price), 0);

      const realEstate = realEstateData.reduce((sum, item) => sum + numericValue(item.price), 0);

      const liabilities = liabilitiesData.reduce(
        (sum, item) => sum + numericValue(item.outstanding_amount),
        0
      );

      const totalAssets =
        portfolio + rentalProperties + flats + gold + cars + otherAssets + realEstate;
      const netWorth = totalAssets - liabilities;

      return {
        portfolio,
        rentalProperties,
        flats,
        gold,
        cars,
        otherAssets,
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
