import { memo, useMemo, useState } from "react";
import { useInvestor } from "@/contexts/InvestorContext";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { calculateXIRR } from "@/lib/xirr";
import { isSellTransaction } from "@/utils/parseTransactions";
import { ChartInsight } from "@/components/charts/ChartInsight";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowDownRight,
  BarChart3,
  Target,
  MinusCircle,
  Info,
  Download,
  RefreshCcw,
  Filter,
  ArrowUpRight,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

/* ─── helpers ─────────────────────────────────────────────── */
const fmt = (v: number | null) => {
  if (v === null || v === undefined || !Number.isFinite(v)) return "N/A";
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
};

type PerfStatus = "outperforming" | "in-line" | "underperforming" | "unavailable";

const getStatus = (fundXirr: number, benchmarkXirr: number): PerfStatus => {
  const diff = fundXirr - benchmarkXirr;
  if (diff > 1) return "outperforming";
  if (diff < -1) return "underperforming";
  return "in-line";
};

const STATUS_CONFIG: Record<PerfStatus, {
  label: string;
  color: string;
  bg: string;
  icon: React.ElementType;
}> = {
  "outperforming": {
    label: "Outperforming",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    icon: ArrowUpRight,
  },
  "in-line": {
    label: "In Line",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    icon: MinusCircle,
  },
  "underperforming": {
    label: "Underperforming",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/30",
    icon: ArrowDownRight,
  },
  "unavailable": {
    label: "Unavailable",
    color: "text-muted-foreground",
    bg: "bg-muted/60 border-border/60",
    icon: MinusCircle,
  },
};

/* ─── Mock Benchmark Data (real would come from AMC/API) ─── */
const BENCHMARK_INDICES: Record<string, { name: string; xirr: number }> = {
  default: { name: "Nifty 50", xirr: 14.2 },
  "large cap": { name: "Nifty 100", xirr: 13.8 },
  "mid cap": { name: "Nifty Midcap 150", xirr: 17.5 },
  "small cap": { name: "Nifty Smallcap 250", xirr: 18.9 },
  "debt": { name: "CRISIL Composite Bond", xirr: 7.2 },
  "liquid": { name: "CRISIL Liquid Fund", xirr: 6.8 },
  "balanced": { name: "Nifty 50 Hybrid Composite", xirr: 12.1 },
  "arbitrage": { name: "Nifty 50 Arbitrage", xirr: 6.5 },
  "banking": { name: "Nifty Bank", xirr: 11.3 },
  "consumption": { name: "Nifty India Consumption", xirr: 15.7 },
  "infrastructure": { name: "Nifty Infrastructure", xirr: 13.4 },
};

function getBenchmarkForScheme(schemeName: string): { name: string; xirr: number } {
  const lower = schemeName.toLowerCase();
  for (const [key, bench] of Object.entries(BENCHMARK_INDICES)) {
    if (lower.includes(key)) return bench;
  }
  return BENCHMARK_INDICES.default;
}

/* ─── Fund Row Card ─────────────────────────────────────────── */
interface FundCompareCardProps {
  rank: number;
  schemeName: string;
  fundXirr: number | null;
  benchmark: { name: string; xirr: number };
  invested: number;
  currentValue: number;
  status: PerfStatus;
}

const FundCompareCard = memo(
  ({ rank, schemeName, fundXirr, benchmark, invested, currentValue, status }: FundCompareCardProps) => {
    const cfg = STATUS_CONFIG[status];
    const StatusIcon = cfg.icon;
    const diff = fundXirr !== null ? fundXirr - benchmark.xirr : null;
    const returnPct = invested > 0 ? ((currentValue - invested) / invested) * 100 : 0;

    return (
      <div className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl border transition-all hover:shadow-md",
        cfg.bg
      )}>
        {/* Rank */}
        <div className="h-8 w-8 rounded-lg bg-background border border-border/60 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-muted-foreground">#{rank}</span>
        </div>

        {/* Scheme Name */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground line-clamp-2 leading-snug">{schemeName}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Benchmark: {benchmark.name}</p>
        </div>

        {/* Fund XIRR */}
        <div className="text-center min-w-[80px]">
          <p className={cn("text-sm font-extrabold", fundXirr === null ? "text-muted-foreground" : fundXirr >= benchmark.xirr ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
            {fmt(fundXirr)}
          </p>
          <p className="text-[10px] text-muted-foreground">Fund XIRR</p>
        </div>

        {/* Benchmark XIRR */}
        <div className="text-center min-w-[80px]">
          <p className="text-sm font-extrabold text-foreground">{fmt(benchmark.xirr)}</p>
          <p className="text-[10px] text-muted-foreground">Benchmark</p>
        </div>

        {/* Alpha */}
        <div className="text-center min-w-[70px]">
          <p className={cn("text-sm font-extrabold", diff === null ? "text-muted-foreground" : diff >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
            {diff === null ? "N/A" : `${diff >= 0 ? "+" : ""}${diff.toFixed(2)}%`}
          </p>
          <p className="text-[10px] text-muted-foreground">Alpha</p>
        </div>

        {/* Returns */}
        <div className="text-center min-w-[90px]">
          <p className={cn("text-sm font-bold", returnPct >= 0 ? "text-emerald-600" : "text-rose-600")}>
            {returnPct >= 0 ? "+" : ""}{returnPct.toFixed(1)}%
          </p>
          <p className="text-[10px] text-muted-foreground">Returns</p>
        </div>

        {/* Status Badge */}
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-bold shrink-0 px-2 py-0.5 rounded-lg border flex items-center gap-1",
            cfg.color,
            "border-current/30 bg-current/5"
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {cfg.label}
        </Badge>
      </div>
    );
  }
);

/* ─── Benchmark Comparison Page ─────────────────────────────── */
const BenchmarkComparison = () => {
  const { filteredTransactions, isNewUser } = useInvestor();
  const { schemeData } = usePortfolioData(filteredTransactions, isNewUser);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | PerfStatus>("all");

  // Build fund comparison list from real data
  const fundList = useMemo(() => {
    return schemeData.map((scheme, idx) => {
      const benchmark = getBenchmarkForScheme(scheme.schemeName);
      const cashFlows = scheme.transactions
        .filter((transaction) => transaction.investmentDate)
        .map((transaction) => ({
          date: new Date(transaction.investmentDate),
          amount: isSellTransaction(transaction) ? transaction.value : -transaction.value,
        }));
      if (scheme.currentValue > 0) {
        cashFlows.push({ date: new Date(), amount: scheme.currentValue });
      }
      const fundXirr = calculateXIRR(cashFlows);
      const status = fundXirr === null ? "unavailable" : getStatus(fundXirr, benchmark.xirr);
      return {
        rank: idx + 1,
        schemeName: scheme.schemeName,
        fundXirr,
        benchmark,
        invested: scheme.totalInvested,
        currentValue: scheme.currentValue,
        status,
      };
    });
  }, [schemeData]);

  // Summary stats
  const summary = useMemo(() => {
    const out = fundList.filter((f) => f.status === "outperforming").length;
    const inl = fundList.filter((f) => f.status === "in-line").length;
    const under = fundList.filter((f) => f.status === "underperforming").length;
    const unavailable = fundList.filter((f) => f.status === "unavailable").length;
    return { outperforming: out, inLine: inl, underperforming: under, unavailable };
  }, [fundList]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = fundList;
    if (activeFilter !== "all") {
      list = list.filter((f) => f.status === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((f) => f.schemeName.toLowerCase().includes(q));
    }
    return list;
  }, [fundList, activeFilter, search]);

  // Bar chart data (top 8 funds by alpha)
  const chartData = useMemo(() => {
    return [...fundList]
      .filter((fund): fund is typeof fund & { fundXirr: number } => fund.fundXirr !== null)
      .sort((a, b) => {
        return (b.fundXirr - b.benchmark.xirr) - (a.fundXirr - a.benchmark.xirr);
      })
      .slice(0, 8)
      .map((f) => ({
        name: f.schemeName.length > 20 ? f.schemeName.substring(0, 20) + "…" : f.schemeName,
        Fund: parseFloat(f.fundXirr.toFixed(2)),
        Benchmark: parseFloat(f.benchmark.xirr.toFixed(2)),
        Alpha: parseFloat((f.fundXirr - f.benchmark.xirr).toFixed(2)),
      }));
  }, [fundList]);

  const hasData = fundList.length > 0;
  const strongestAlpha = chartData[0];

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-heading font-extrabold text-foreground">Benchmark Comparison</h1>
            <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 rounded-full font-bold">XIRR</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compare your portfolio performance with benchmark indices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg gap-1.5">
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* 3 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            key: "outperforming" as const,
            label: "Outperforming",
            count: summary.outperforming,
            icon: ArrowUpRight,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-500/10 border-emerald-500/30",
            desc: "Beating their benchmark index",
          },
          {
            key: "in-line" as const,
            label: "In Line",
            count: summary.inLine,
            icon: MinusCircle,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/30",
            desc: "Tracking benchmark closely",
          },
          {
            key: "underperforming" as const,
            label: "Underperforming",
            count: summary.underperforming,
            icon: ArrowDownRight,
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-500/10 border-rose-500/30",
            desc: "Below benchmark performance",
          },
          {
            key: "unavailable" as const,
            label: "Unavailable",
            count: summary.unavailable,
            icon: MinusCircle,
            color: "text-muted-foreground",
            bg: "bg-muted/60 border-border/60",
            desc: "Insufficient cash-flow data for XIRR",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.key}
              className={cn(
                "cursor-pointer border transition-all hover:shadow-md rounded-xl",
                item.bg,
                activeFilter === item.key && "ring-2 ring-offset-2 ring-current"
              )}
              onClick={() => setActiveFilter(activeFilter === item.key ? "all" : item.key)}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", item.color, "bg-current/10")}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className={cn("text-2xl font-heading font-extrabold", item.color)}>{item.count}</p>
                  <p className="text-sm font-bold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      {hasData && chartData.length > 0 && (
        <Card className="border border-border/70 rounded-xl overflow-hidden">
          <CardHeader className="p-4 pb-2 border-b border-border/30">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm font-bold">Fund vs Benchmark XIRR (Top 8)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                  formatter={(v: number) => [`${v.toFixed(2)}%`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" />
                <Bar dataKey="Fund" name="Fund XIRR" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="Benchmark" name="Benchmark" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
            {strongestAlpha && (
              <ChartInsight>
                {strongestAlpha.Alpha >= 0
                  ? `${strongestAlpha.name} leads its benchmark by ${fmt(strongestAlpha.Alpha)} percentage points.`
                  : `${strongestAlpha.name} has the smallest benchmark gap at ${fmt(strongestAlpha.Alpha)} percentage points.`}{" "}
                {summary.outperforming} of {fundList.length} fund(s) are outperforming their benchmark.
              </ChartInsight>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fund List */}
      <Card className="border border-border/70 rounded-xl overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-border/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold">Scheme-wise Performance</CardTitle>
              <Badge variant="secondary" className="text-[10px] font-bold">{filtered.length}</Badge>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search scheme..."
                  className="pl-8 h-8 text-xs w-52 rounded-lg"
                />
              </div>
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("all")}
                className="h-8 text-xs rounded-lg"
              >
                All
              </Button>
            </div>
          </div>

          {/* Column Headers */}
          {filtered.length > 0 && (
            <div className="hidden sm:flex items-center gap-3 px-3 pt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <div className="h-8 w-8 shrink-0" />
              <div className="flex-1">Scheme</div>
              <div className="min-w-[80px] text-center">Fund XIRR</div>
              <div className="min-w-[80px] text-center">Benchmark</div>
              <div className="min-w-[70px] text-center">Alpha</div>
              <div className="min-w-[90px] text-center">Returns</div>
              <div className="min-w-[110px] text-right">Status</div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              {hasData ? (
                <>
                  <Filter className="h-10 w-10 text-muted-foreground/40" />
                  <div>
                    <p className="font-bold text-foreground">No matching funds</p>
                    <p className="text-sm text-muted-foreground">Try changing filters or search terms</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setSearch(""); setActiveFilter("all"); }}>
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <BarChart3 className="h-12 w-12 text-muted-foreground/30" />
                  <div>
                    <p className="font-bold text-foreground">No portfolio data</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      Upload your investment transactions to compare fund performance against benchmarks
                    </p>
                  </div>

                  {/* Sample preview cards */}
                  <div className="w-full max-w-2xl space-y-2 mt-4 opacity-50 pointer-events-none">
                    {[
                      { name: "Axis Bluechip Fund - Regular Plan - Growth", fund: 18.5, bench: 14.2, status: "outperforming" as const },
                      { name: "Mirae Asset Large Cap Fund - Regular - Growth", fund: 13.1, bench: 13.8, status: "underperforming" as const },
                      { name: "ICICI Pru Balanced Advantage Fund - Growth", fund: 12.2, bench: 12.1, status: "in-line" as const },
                    ].map((item, i) => (
                      <FundCompareCard
                        key={i}
                        rank={i + 1}
                        schemeName={item.name}
                        fundXirr={item.fund}
                        benchmark={{ name: "Nifty 50", xirr: item.bench }}
                        invested={500000}
                        currentValue={620000}
                        status={item.status}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground/70 -mt-2">(Preview — upload data to see your real funds)</p>
                </>
              )}
            </div>
          ) : (
            filtered.map((fund, i) => (
              <FundCompareCard key={i} {...fund} />
            ))
          )}
        </CardContent>
      </Card>

      {/* Info Footer */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-400">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          <strong>Note:</strong> XIRR calculations are based on actual cash flows. Benchmark XIRR values are approximate index returns.
          Alpha = Fund XIRR − Benchmark XIRR. Positive alpha indicates outperformance.
        </p>
      </div>
    </div>
  );
};

export default BenchmarkComparison;
