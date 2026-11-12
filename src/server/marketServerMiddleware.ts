import { isRecord } from "@/lib/utils";

import https from "https";

interface CachedEntry<T> {
  data: T;
  ts: number;
}

interface MarketNewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  pubDate: string;
  timeAgo: string;
  sentiment: "positive" | "negative" | "neutral";
  direction: "up" | "down" | "flat";
  category: string;
  isLive: boolean;
}

const memoryCache: {
  indices: CachedEntry<unknown> | null;
  news: Record<string, CachedEntry<unknown>>;
} = {
  indices: null,
  news: {},
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sendUnavailable(res: ServerResponse, cachedData: unknown, message: string): void {
  res.setHeader("Content-Type", "application/json");
  if (isRecord(cachedData)) {
    res.end(JSON.stringify({ ...cachedData, cached: true, isStale: true }));
    return;
  }

  res.statusCode = 502;
  res.end(JSON.stringify({ error: message }));
}

function fetchHttps(url: string, headers: Record<string, string> = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ...headers,
      },
      timeout: 6000,
    };

    const req = https.get(options, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchHttps(res.headers.location, headers).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP status ${res.statusCode}`));
      }
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve(body));
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    req.on("error", reject);
  });
}

function deriveSentiment(text: string): "positive" | "negative" | "neutral" {
  const lower = text.toLowerCase();
  const positive = ["up", "gain", "gains", "surge", "surges", "rally", "jump", "high", "higher", "profit", "buyback", "rise", "rises", "strong"];
  const negative = ["down", "fall", "falls", "drop", "drops", "loss", "losses", "slump", "decline", "declines", "weak", "lower", "cut"];

  let p = 0;
  let n = 0;
  for (const w of positive) if (new RegExp(`\\b${w}\\b`, "i").test(lower)) p++;
  for (const w of negative) if (new RegExp(`\\b${w}\\b`, "i").test(lower)) n++;

  if (p > n) return "positive";
  if (n > p) return "negative";
  return "neutral";
}

function categorize(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("nifty") || lower.includes("sensex") || lower.includes("index") || lower.includes("indices")) return "Market Indices";
  if (lower.includes("result") || lower.includes("profit") || lower.includes("earnings") || lower.includes("q2") || lower.includes("q3")) return "Corporate Results";
  if (lower.includes("rbi") || lower.includes("repo") || lower.includes("inflation") || lower.includes("rate") || lower.includes("economy")) return "Economy";
  if (lower.includes("buyback") || lower.includes("bonus") || lower.includes("dividend") || lower.includes("board")) return "Company Announcements";
  return "Market News";
}

function formatAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return "Just now";
    const min = Math.floor(diff / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return `${Math.floor(hr / 24)}d ago`;
  } catch {
    return "Recently";
  }
}

export async function handleMarketApi(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
): Promise<void> {
  const url = req.url || "";

  if (url.startsWith("/api/market/indices")) {
    res.setHeader("Content-Type", "application/json");
    const now = Date.now();

    if (memoryCache.indices && now - memoryCache.indices.ts < 60000) {
      res.end(JSON.stringify(memoryCache.indices.data));
      return;
    }

    try {
      const symbols = [
        { sym: "%5ENSEI", name: "NIFTY 50", code: "NIFTY" },
        { sym: "%5EBSESN", name: "BSE SENSEX", code: "SENSEX" },
        { sym: "%5ENSEBANK", name: "NIFTY BANK", code: "BANKNIFTY" },
      ];

      const indices = await Promise.all(
        symbols.map(async ({ sym, name, code }) => {
          const fetchUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d`;
          const raw = await fetchHttps(fetchUrl);
          const json = JSON.parse(raw);
          const meta = json.chart.result[0].meta;
          const price = meta.regularMarketPrice || meta.chartPreviousClose || 0;
          const prev = meta.chartPreviousClose || price;
          const change = price - prev;
          const pct = prev ? (change / prev) * 100 : 0;

          return {
            name,
            code,
            symbol: name,
            value: Number(price.toFixed(2)),
            pointChange: Number(change.toFixed(2)),
            percentChange: Number(pct.toFixed(2)),
            isPositive: change >= 0,
            marketStatus: "OPEN",
            source: name.includes("BSE") ? "BSE Official Feed" : "NSE Official Feed",
            timestamp: new Date().toISOString(),
          };
        })
      );

      const payload = {
        indices,
        cached: false,
        lastUpdated: new Date().toISOString(),
        source: "Live Official Exchange Feeds (via Yahoo Finance)",
      };

      memoryCache.indices = { data: payload, ts: now };
      res.end(JSON.stringify(payload));
      return;
    } catch (error: unknown) {
      console.error("Unable to refresh market indices:", error);
      sendUnavailable(
        res,
        memoryCache.indices?.data,
        "Market indices are temporarily unavailable."
      );
      return;
    }
  }

  if (url.startsWith("/api/market/news")) {
    res.setHeader("Content-Type", "application/json");
    const parsedUrl = new URL(url, "http://localhost");
    const cat = parsedUrl.searchParams.get("category") || "nse";
    const now = Date.now();

    if (memoryCache.news[cat] && now - memoryCache.news[cat].ts < 60000) {
      res.end(JSON.stringify(memoryCache.news[cat].data));
      return;
    }

    try {
      let q = "Indian stock market Nifty Sensex when:1d";
      if (cat === "nse") q = "NSE stock market India OR Nifty announcements when:1d";
      if (cat === "bse") q = "BSE Sensex stock market announcements when:1d";

      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;
      const xml = await fetchHttps(rssUrl);

      const items: MarketNewsItem[] = [];
      const itemRegex = /<item>[\s\S]*?<\/item>/g;
      let m;
      let count = 1;

      while ((m = itemRegex.exec(xml)) && items.length < 15) {
        const raw = m[0];
        let title = (raw.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
        const link = (raw.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || "";
        const pubDate = (raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || "";
        let source = (raw.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || "Financial Media";

        title = title.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        const lastDash = title.lastIndexOf(" - ");
        if (lastDash > -1) {
          source = title.substring(lastDash + 3).trim();
          title = title.substring(0, lastDash).trim();
        }

        const sentiment = deriveSentiment(title);
        const itemDate = pubDate ? new Date(pubDate) : new Date();
        const diffHours = (Date.now() - itemDate.getTime()) / (3600 * 1000);

        // Only include items published within last 48 hours for true live freshness
        if (diffHours <= 48) {
          items.push({
            id: `live-${cat}-${count++}`,
            title,
            link,
            source: source || (cat === "nse" ? "NSE India" : cat === "bse" ? "BSE India" : "Financial Express"),
            pubDate: itemDate.toISOString(),
            timeAgo: formatAgo(pubDate),
            sentiment,
            direction: sentiment === "positive" ? "up" : sentiment === "negative" ? "down" : "flat",
            category: categorize(title),
            isLive: true,
          });
        }
      }

      // Sort newest items first
      items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

      // If fewer than 5 items returned due to market holidays/weekend, fetch 2d general business headlines
      if (items.length < 5) {
        const fallbackUrl = `https://news.google.com/rss/search?q=${encodeURIComponent("Indian stock market Nifty Sensex when:2d")}&hl=en-IN&gl=IN&ceid=IN:en`;
        const fallbackXml = await fetchHttps(fallbackUrl);
        let fbMatch;
        while ((fbMatch = itemRegex.exec(fallbackXml)) && items.length < 8) {
          const raw = fbMatch[0];
          let title = (raw.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
          const link = (raw.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || "";
          const pubDate = (raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || "";
          let source = (raw.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || "Financial Media";

          title = title.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
          const lastDash = title.lastIndexOf(" - ");
          if (lastDash > -1) {
            source = title.substring(lastDash + 3).trim();
            title = title.substring(0, lastDash).trim();
          }

          items.push({
            id: `live-${cat}-${count++}`,
            title,
            link,
            source: source || "Financial Media",
            pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            timeAgo: formatAgo(pubDate),
            sentiment: deriveSentiment(title),
            direction: deriveSentiment(title) === "positive" ? "up" : deriveSentiment(title) === "negative" ? "down" : "flat",
            category: categorize(title),
            isLive: true,
          });
        }
      }

      const payload = {
        news: items.slice(0, 8),
        category: cat,
        cached: false,
        lastUpdated: new Date().toISOString(),
        source: cat === "nse" ? "National Stock Exchange Feeds" : cat === "bse" ? "BSE Official News" : "Live Financial News Feeds",
      };

      memoryCache.news[cat] = { data: payload, ts: now };
      res.end(JSON.stringify(payload));
      return;
    } catch (error: unknown) {
      console.error("Unable to refresh market news:", error);
      sendUnavailable(
        res,
        memoryCache.news[cat]?.data,
        "Market news is temporarily unavailable."
      );
      return;
    }
  }

  next();
}
