import { memo, useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Radio,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MarketNewsItem,
  fetchMarketNews,
  DEFAULT_NEWS_BY_CATEGORY,
} from "@/services/marketService";

type NewsTab = "nse" | "bse" | "market";

export const LiveMarketNews = memo(() => {
  const [activeTab, setActiveTab] = useState<NewsTab>("nse");
  const [news, setNews] = useState<MarketNewsItem[]>(DEFAULT_NEWS_BY_CATEGORY.nse);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadData = useCallback(async (tab: NewsTab, isManual = false) => {
    if (isManual) setIsLoading(true);
    try {
      const newsRes = await fetchMarketNews(tab);
      if (newsRes && newsRes.news && newsRes.news.length > 0) {
        setNews(newsRes.news);
      }
    } catch (err) {
      console.warn("Failed to refresh live market news:", err);
    } finally {
      if (isManual) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(activeTab, false);
    const interval = setInterval(() => {
      loadData(activeTab, false);
    }, 180000);
    return () => clearInterval(interval);
  }, [activeTab, loadData]);

  const handleRefresh = () => {
    loadData(activeTab, true);
  };

  return (
    <Card className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-xs hover:border-primary/30 transition-all h-full flex flex-col justify-between">
      <div>
        {/* Header matching target UI reference exactly */}
        <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
              </div>
              <CardTitle className="text-sm font-bold text-foreground">
                Live Market News
              </CardTitle>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleRefresh}
                title="Refresh feed"
                className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 flex items-center justify-center transition-all"
              >
                <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin text-blue-600")} />
              </button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-500/10 p-0 px-2 gap-1"
                onClick={() => {
                  window.open("https://www.nseindia.com/market-data/live-market-indices", "_blank");
                }}
              >
                <span>View All</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* 3 Tabs: NSE, BSE, Market News */}
          <div className="flex items-center gap-1.5 pt-2">
            <button
              onClick={() => setActiveTab("nse")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                activeTab === "nse"
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              NSE
            </button>
            <button
              onClick={() => setActiveTab("bse")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                activeTab === "bse"
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              BSE
            </button>
            <button
              onClick={() => setActiveTab("market")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                activeTab === "market"
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Market News
            </button>
          </div>
        </CardHeader>

        {/* 5 Compact Headline Items matching reference image */}
        <CardContent className="p-3 sm:p-3.5 pt-1.5 pb-2">
          <div className="divide-y divide-border/30">
            {news.slice(0, 5).map((item) => {
              const isUp = item.direction === "up" || item.sentiment === "positive";
              const isDown = item.direction === "down" || item.sentiment === "negative";

              return (
                <a
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-1 flex items-center justify-between gap-3 group hover:bg-muted/40 rounded-md transition-colors"
                >
                  {/* Headline truncated to 1 line for clean vertical balance */}
                  <p className="text-xs font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate flex-1 min-w-0">
                    {item.title}
                  </p>

                  {/* Timestamp & Trend Arrow matching reference image */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-muted-foreground">
                      {item.timeAgo}
                    </span>
                    <span
                      className={cn(
                        "font-bold text-xs w-3 text-center",
                        isUp && "text-emerald-600 dark:text-emerald-400",
                        isDown && "text-rose-600 dark:text-rose-400",
                        !isUp && !isDown && "text-muted-foreground"
                      )}
                    >
                      {isUp ? "↑" : isDown ? "↓" : "—"}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </CardContent>
      </div>
    </Card>
  );
});
