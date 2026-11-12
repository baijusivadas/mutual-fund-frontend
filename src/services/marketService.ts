/**
 * Market Data & News Service for BrickWealth
 * Fetches real-time Indian stock market indices (NIFTY 50, BSE SENSEX, NIFTY BANK)
 * and verified live market news announcements for NSE, BSE, and financial media.
 */

import { isRecord } from "@/lib/utils";

export interface MarketIndex {
  name: string;
  code: string;
  symbol: string;
  value: number;
  pointChange: number;
  percentChange: number;
  isPositive: boolean;
  marketStatus: "OPEN" | "CLOSED";
  source: string;
  timestamp: string;
  isStale?: boolean;
}

export interface MarketNewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  pubDate: string;
  timeAgo: string;
  sentiment: "positive" | "negative" | "neutral";
  direction: "up" | "down" | "flat";
  category: string;
  ticker?: string | null;
  isLive: boolean;
}

export interface MarketNewsResponse {
  news: MarketNewsItem[];
  category: "nse" | "bse" | "market";
  cached: boolean;
  isStale?: boolean;
  lastUpdated: string;
  source: string;
}

function isMarketIndex(value: unknown): value is MarketIndex {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.code === "string" &&
    typeof value.symbol === "string" &&
    typeof value.value === "number" &&
    typeof value.pointChange === "number" &&
    typeof value.percentChange === "number" &&
    typeof value.isPositive === "boolean" &&
    (value.marketStatus === "OPEN" || value.marketStatus === "CLOSED") &&
    typeof value.source === "string" &&
    typeof value.timestamp === "string"
  );
}

function isMarketNewsItem(value: unknown): value is MarketNewsItem {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.link === "string" &&
    typeof value.source === "string" &&
    typeof value.pubDate === "string" &&
    typeof value.timeAgo === "string" &&
    (value.sentiment === "positive" || value.sentiment === "negative" || value.sentiment === "neutral") &&
    (value.direction === "up" || value.direction === "down" || value.direction === "flat") &&
    typeof value.category === "string" &&
    typeof value.isLive === "boolean"
  );
}

// In-memory cache in client session
const clientCache: {
  indices: { data: MarketIndex[]; ts: number } | null;
  news: Record<string, { data: MarketNewsItem[]; ts: number }>;
} = {
  indices: null,
  news: {},
};

export const fetchLiveIndices = async (): Promise<MarketIndex[]> => {
  const now = Date.now();
  if (clientCache.indices && now - clientCache.indices.ts < 60000) {
    return clientCache.indices.data;
  }

  try {
    const res = await fetch("/api/market/indices", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Market indices request failed (${res.status}).`);

    const data: unknown = await res.json();
    if (!isRecord(data) || !Array.isArray(data.indices)) {
      throw new Error("Market indices service returned an invalid response.");
    }
    const indices = data.indices.filter(isMarketIndex);
    if (indices.length === 0) {
      throw new Error("Market indices service returned no valid index data.");
    }

    const result = data.isStale === true
      ? indices.map((index) => ({ ...index, isStale: true }))
      : indices;
    clientCache.indices = { data: result, ts: now };
    return result;
  } catch (error: unknown) {
    console.warn("Unable to load market indices:", error);
    if (clientCache.indices) {
      return clientCache.indices.data.map((index) => ({ ...index, isStale: true }));
    }
    throw error instanceof Error ? error : new Error("Market indices are temporarily unavailable.");
  }
};

export const fetchMarketNews = async (
  category: "nse" | "bse" | "market" = "nse"
): Promise<MarketNewsResponse> => {
  const now = Date.now();
  const cached = clientCache.news[category];

  if (cached && now - cached.ts < 30000) {
    return {
      news: cached.data,
      category,
      cached: true,
      lastUpdated: new Date(cached.ts).toISOString(),
      source: "Cached Market News Feed",
    };
  }

  try {
    const res = await fetch(`/api/market/news?category=${category}&_t=${now}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Market news request failed (${res.status}).`);

    const data: unknown = await res.json();
    if (!isRecord(data) || !Array.isArray(data.news)) {
      throw new Error("Market news service returned an invalid response.");
    }
    const news = data.news.filter(isMarketNewsItem);
    if (news.length === 0) {
      throw new Error("Market news service returned no valid headlines.");
    }
    clientCache.news[category] = { data: news, ts: now };
    return {
      news,
      category,
      cached: data.cached === true,
      isStale: data.isStale === true,
      lastUpdated: typeof data.lastUpdated === "string" ? data.lastUpdated : new Date(now).toISOString(),
      source: typeof data.source === "string" ? data.source : "Market News Feed",
    };
  } catch (error: unknown) {
    console.warn(`Unable to load market news for ${category}:`, error);
    if (cached) {
      return {
        news: cached.data,
        category,
        cached: true,
        isStale: true,
        lastUpdated: new Date(cached.ts).toISOString(),
        source: "Cached Market News Feed",
      };
    }
    throw error instanceof Error ? error : new Error("Market news is temporarily unavailable.");
  }
};
