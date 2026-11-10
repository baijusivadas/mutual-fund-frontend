import { memo, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAdvancedPortfolio } from "@/hooks/useAdvancedPortfolio";
import { formatCurrency, formatIndianUnits, formatPercent } from "@/utils/format";
import { stockPriceData, stockDetails, StockDetail, StockPriceDataKey } from "@/data/stockData";
import { StockDetailCard } from "@/components/dashboard/investments/StockDetailCard";
import { StockPnLCard } from "@/components/dashboard/investments/StockPnLCard";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  PieChart as PieIcon,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Sparkles,
  Download,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from "recharts";
import { cn } from "@/lib/utils";

const SPARKLINE_HEIGHT = 44;

/* ── Smooth Sparkline ────────────────────────────────────────── */
const Sparkline = memo(({ data, color = "#2563eb" }: { data: number[]; color?: string }) => {
  const chartData = useMemo(() => {
    const safe = data && data.length > 0 ? data : [10, 15, 20, 25, 30];
    return safe.map((v, i) => ({ i, v }));
  }, [data]);

  const gradId = `stk-spk-${color.replace("#", "")}`;

  return (
    <ResponsiveContainer width="100%" height={SPARKLINE_HEIGHT}>
      <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.2} fill={`url(#${gradId})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
});
Sparkline.displayName = "Sparkline";

/* ── KPI Metric Card ─────────────────────────────────────────── */
interface ModernStockKpiCardProps {
  title: string;
  value: string;
  subValue?: string;
  tag?: string;
  isPositive?: boolean;
  sparkData: number[];
  sparkColor: string;
  icon: React.ReactNode;
}

const ModernStockKpiCard = memo(
  ({ title, value, subValue, tag, isPositive = true, sparkData, sparkColor, icon }: ModernStockKpiCardProps) => (
    <Card className="relative overflow-hidden bg-card border border-border/80 rounded-2xl shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-200 group flex flex-col justify-between">
      <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{title}</span>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              {icon}
            </div>
          </div>

          <div className="flex items-baseline justify-between mt-2.5 gap-2">
            <div>
              <p className="text-2xl font-heading font-extrabold text-foreground tracking-tight">{value}</p>
              {subValue && (
                <p className={cn("text-xs font-bold mt-0.5", isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                  {subValue}
                </p>
              )}
            </div>
            <div className="w-[95px] shrink-0">
              <Sparkline data={sparkData} color={sparkColor} />
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Real-time NSE Feed</span>
          {tag && (
            <Badge
              variant="outline"
              className={cn("text-[9px] font-bold px-1.5 py-0 rounded border-none", isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}
            >
              {tag}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
);
ModernStockKpiCard.displayName = "ModernStockKpiCard";

const StockReports = () => {
  const { totalInvestments, raw } = useAdvancedPortfolio();
  const [selectedStockKey, setSelectedStockKey] = useState<string>("reliance");
  const [timeframe, setTimeframe] = useState<"1W" | "1M" | "6M" | "1Y">("1W");
  const [search, setSearch] = useState("");

  // Merge database ETFs / stocks with reference watchlist
  const combinedStocks = useMemo(() => {
    const list: StockDetail[] = [...stockDetails];
    const dbEtfs = raw?.etfs || [];

    dbEtfs.forEach((e: any, idx: number) => {
      const sym = e.symbol || `ETF-${idx + 1}`;
      if (!list.some((s) => s.symbol.toLowerCase() === sym.toLowerCase())) {
        const qty = Number(e.quantity || 10);
        const buy = Number(e.purchase_price || 100);
        const cur = Number(e.current_nav || buy * 1.08);
        const gain = cur - buy;
        const gainPct = buy > 0 ? (gain / buy) * 100 : 0;

        list.push({
          name: e.asset_name || sym,
          symbol: sym,
          sector: "ETF / Index",
          holdings: qty,
          avgPrice: buy,
          currentPrice: cur,
          dayChange: `${gainPct >= 0 ? "+" : ""}${gainPct.toFixed(2)}%`,
          weekHigh: cur * 1.05,
          weekLow: cur * 0.95,
          dataKey: sym.toLowerCase(),
        });
      }
    });

    return list;
  }, [raw]);

  // Filter stocks by search
  const filteredStocks = useMemo(() => {
    if (!search.trim()) return combinedStocks;
    const q = search.toLowerCase();
    return combinedStocks.filter(
      (s) => s.name.toLowerCase().includes(q) || s.symbol.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q)
    );
  }, [combinedStocks, search]);

  const selectedStock = useMemo(() => {
    return combinedStocks.find((s) => s.dataKey === selectedStockKey) || combinedStocks[0];
  }, [combinedStocks, selectedStockKey]);

  // Aggregate portfolio metrics for stocks
  const { totalStockValue, totalStockCost, totalStockGain, totalGainPct } = useMemo(() => {
    let val = 0;
    let cost = 0;
    combinedStocks.forEach((s) => {
      val += s.holdings * s.currentPrice;
      cost += s.holdings * s.avgPrice;
    });
    const gain = val - cost;
    const pct = cost > 0 ? (gain / cost) * 100 : 0;
    return {
      totalStockValue: Math.round(val),
      totalStockCost: Math.round(cost),
      totalStockGain: Math.round(gain),
      totalGainPct: pct.toFixed(2),
    };
  }, [combinedStocks]);

  const activeChartData = useMemo(() => {
    const raw = stockPriceData[selectedStock.dataKey as StockPriceDataKey] || [
      { date: "01 Oct", price: selectedStock.currentPrice * 0.97 },
      { date: "02 Oct", price: selectedStock.currentPrice * 0.98 },
      { date: "03 Oct", price: selectedStock.currentPrice * 0.985 },
      { date: "04 Oct", price: selectedStock.currentPrice * 0.99 },
      { date: "05 Oct", price: selectedStock.currentPrice * 0.995 },
      { date: "06 Oct", price: selectedStock.currentPrice * 1.01 },
      { date: "07 Oct", price: selectedStock.currentPrice },
    ];
    return raw.map((item, idx) => ({
      ...item,
      volume: Math.round(25000 + (idx * 3200) % 15000),
    }));
  }, [selectedStock]);

  const isSelectedPos = selectedStock.dayChange.startsWith("+");

  return (
    <div className="space-y-5 animate-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Activity className="h-4 w-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-heading font-extrabold text-foreground">
              Stock & Equity Reports
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time technical tracking, unrealized positions, and sector-weighted equity attribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-muted/40">
            {combinedStocks.length} Tracked Equities
          </Badge>
        </div>
      </div>

      {/* ── Top 4 Modern KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <ModernStockKpiCard
          title="Equity Valuation"
          value={formatIndianUnits(totalStockValue)}
          subValue="Consolidated Stock Portfolio"
          sparkData={[totalStockValue * 0.92, totalStockValue * 0.95, totalStockValue * 0.98, totalStockValue]}
          sparkColor="#2563eb"
          icon={<DollarSign className="h-4 w-4" />}
          tag="Valuation"
        />

        <ModernStockKpiCard
          title="Unrealized Stock P&L"
          value={`+${formatIndianUnits(totalStockGain)}`}
          subValue={`+${totalGainPct}% ROI`}
          isPositive={totalStockGain >= 0}
          sparkData={[totalStockGain * 0.8, totalStockGain * 0.88, totalStockGain * 0.94, totalStockGain]}
          sparkColor="#10b981"
          icon={<TrendingUp className="h-4 w-4" />}
          tag="P&L"
        />

        <ModernStockKpiCard
          title="Tracked Holdings"
          value={combinedStocks.length.toString()}
          subValue="Equities & Liquid ETFs"
          sparkData={[2, 3, 3, combinedStocks.length]}
          sparkColor="#6366f1"
          icon={<BarChart2 className="h-4 w-4" />}
          tag="Active Scrips"
        />

        <ModernStockKpiCard
          title="Selected Scrip"
          value={selectedStock.symbol}
          subValue={`CMP ₹${selectedStock.currentPrice.toLocaleString("en-IN")}`}
          isPositive={isSelectedPos}
          sparkData={activeChartData.map((d) => d.price)}
          sparkColor={isSelectedPos ? "#10b981" : "#ef4444"}
          icon={<Activity className="h-4 w-4" />}
          tag={selectedStock.dayChange}
        />
      </div>

      {/* ── Stock Selection Tabs & Search ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {filteredStocks.map((stock) => {
            const isSelected = stock.dataKey === selectedStock.dataKey;
            const isPos = stock.dayChange.startsWith("+");
            return (
              <button
                key={stock.dataKey}
                onClick={() => setSelectedStockKey(stock.dataKey)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border",
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <span>{stock.name}</span>
                <span
                  className={cn(
                    "text-[10px] font-extrabold px-1.5 py-0.2 rounded",
                    isSelected
                      ? "bg-white/20 text-white"
                      : isPos
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  )}
                >
                  {stock.dayChange}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search stock by name or ticker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-card border-border/70 rounded-xl"
          />
        </div>
      </div>

      {/* ── Active Stock Analytics Grid ── */}
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <StockDetailCard stock={selectedStock} />
          <StockPnLCard stock={selectedStock} />
        </div>

        {/* ── Upgraded Technical Price Chart ── */}
        <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
          <CardHeader className="p-4 sm:p-5 pb-2 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Activity className="h-3.5 w-3.5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    {selectedStock.name} ({selectedStock.symbol}) Technical Trend
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    7-Day Price Movement & Daily Trading Volume
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border/50">
                {(["1W", "1M", "6M", "1Y"] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-bold rounded-md transition-all",
                      timeframe === tf ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={activeChartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis
                  yAxisId="price"
                  domain={["dataMin - 15", "dataMax + 15"]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <YAxis
                  yAxisId="volume"
                  orientation="right"
                  domain={[0, "dataMax * 3"]}
                  hide={true}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(val: number, name: string) => [
                    name === "price" ? `₹${val.toLocaleString("en-IN")}` : val.toLocaleString("en-IN"),
                    name === "price" ? "Price" : "Volume",
                  ]}
                />
                <Bar yAxisId="volume" dataKey="volume" fill="#94a3b8" opacity={0.25} radius={[2, 2, 0, 0]} barSize={16} />
                <Area yAxisId="price" type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2.5} fill="url(#priceGrad)" dot={{ fill: "#2563eb", r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>

            {/* 52-Week Range Bar */}
            <div className="mt-4 pt-3 border-t border-border/40 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                <span>52W Low: ₹{selectedStock.weekLow.toLocaleString("en-IN")}</span>
                <span className="font-bold text-foreground">52-Week Price Range</span>
                <span>52W High: ₹{selectedStock.weekHigh.toLocaleString("en-IN")}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        ((selectedStock.currentPrice - selectedStock.weekLow) /
                          (selectedStock.weekHigh - selectedStock.weekLow || 1)) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default memo(StockReports);
