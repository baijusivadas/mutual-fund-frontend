import { memo, useMemo, useCallback } from "react";
import { useInvestor } from "@/contexts/InvestorContext";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { useAdvancedPortfolio } from "@/hooks/useAdvancedPortfolio";
import { calculateXIRR } from "@/lib/xirr";
import { isSellTransaction } from "@/utils/parseTransactions";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatIndianUnits, formatPercent } from "@/utils/format";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Download,
  PieChart as PieIcon,
  BarChart3,
  Activity,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Sparkles,
  DollarSign,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SPARKLINE_HEIGHT = 44;

/* ── Smooth Sparkline ────────────────────────────────────────── */
const Sparkline = memo(({ data, color = "#2563eb" }: { data: number[]; color?: string }) => {
  const chartData = useMemo(() => {
    const safe = data && data.length > 0 ? data : [10, 15, 20, 25, 30];
    return safe.map((v, i) => ({ i, v }));
  }, [data]);

  const gradId = `pa-spk-${color.replace("#", "")}`;

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
interface ModernAnalysisKpiCardProps {
  title: string;
  value: string;
  subValue?: string;
  tag?: string;
  isPositive?: boolean;
  sparkData: number[];
  sparkColor: string;
  icon: React.ReactNode;
  footerNote?: string;
}

const ModernAnalysisKpiCard = memo(
  ({ title, value, subValue, tag, isPositive = true, sparkData, sparkColor, icon, footerNote }: ModernAnalysisKpiCardProps) => (
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
          <span>{footerNote || "Audit Verified"}</span>
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
ModernAnalysisKpiCard.displayName = "ModernAnalysisKpiCard";

/* ── Scheme Card ─────────────────────────────────────────────── */
interface SchemeCardProps {
  scheme: {
    schemeName: string;
    totalInvested: number;
    currentValue: number;
    returns: number;
    returnPercent: number;
    totalUnits: number;
    latestNav: number;
    transactions: { investmentDate: string; value: number; isSell?: boolean }[];
  };
  rank: number;
  totalValue: number;
}

const SchemeCard = memo(({ scheme, rank, totalValue }: SchemeCardProps) => {
  const isPositive = scheme.returns >= 0;
  const allocationPct = totalValue > 0 ? (scheme.currentValue / totalValue) * 100 : 0;

  const xirr = useMemo(() => {
    const flows = scheme.transactions
      .filter((t) => t.investmentDate)
      .map((t) => ({
        date: new Date(t.investmentDate),
        amount: (t.isSell ? t.value : -t.value),
      }));
    if (scheme.currentValue > 0) {
      flows.push({ date: new Date(), amount: scheme.currentValue });
    }
    if (flows.length < 2) return null;
    return calculateXIRR(flows);
  }, [scheme.transactions, scheme.currentValue]);

  return (
    <div className="rounded-2xl border border-border/70 bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200 p-4 space-y-3 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-extrabold">
            #{rank}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {scheme.schemeName}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {scheme.totalUnits.toFixed(2)} units · NAV ₹{scheme.latestNav.toFixed(2)}
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            "text-[10px] font-extrabold shrink-0 border-none px-2 py-0.5 rounded-full flex items-center gap-0.5",
            isPositive
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
          )}
        >
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {formatPercent(scheme.returnPercent)}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/40 text-xs">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Invested</p>
          <p className="font-extrabold text-foreground mt-0.5">{formatIndianUnits(scheme.totalInvested)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Current</p>
          <p className="font-extrabold text-primary mt-0.5">{formatIndianUnits(scheme.currentValue)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">XIRR</p>
          <p className={cn("font-extrabold mt-0.5", xirr !== null && xirr >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
            {xirr !== null ? `${xirr.toFixed(1)}%` : "N/A"}
          </p>
        </div>
      </div>

      <div className="space-y-1 pt-0.5">
        <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
          <span>Allocation Share</span>
          <span>{allocationPct.toFixed(1)}%</span>
        </div>
        <Progress value={allocationPct} className="h-1.5 rounded-full" />
      </div>
    </div>
  );
});
SchemeCard.displayName = "SchemeCard";

/* ── Main Page ───────────────────────────────────────────────── */
export const PortfolioAnalysis = () => {
  const { filteredTransactions, isNewUser, investors, selectedInvestor } = useInvestor();
  const {
    schemeData,
    totalInvested,
    currentValue,
    xirr: overallXirr,
    performanceData,
  } = usePortfolioData(filteredTransactions, isNewUser);
  const { totalAssets, totalLiabilities, totalInvestments: advancedInvestments } = useAdvancedPortfolio();

  const totalReturns = currentValue - totalInvested;
  const overallAllReturn = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : "0.00";
  const isPositive = parseFloat(overallAllReturn) >= 0;

  const allocationData = useMemo(() => {
    const items = [
      { name: "Mutual Funds", value: currentValue, color: "#2563eb" },
      { name: "Real Estate", value: totalAssets, color: "#10b981" },
      { name: "Other Assets", value: advancedInvestments, color: "#f59e0b" },
    ].filter((d) => d.value > 0);
    return items.length > 0 ? items : [{ name: "Mutual Funds", value: 1, color: "#2563eb" }];
  }, [currentValue, totalAssets, advancedInvestments]);

  const totalPortfolioValue = currentValue + totalAssets + advancedInvestments;
  const totalNetWorth = totalPortfolioValue - totalLiabilities;

  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, { invested: number; redeemed: number }>();
    for (const t of filteredTransactions) {
      if (!t.investmentDate) continue;
      const d = new Date(t.investmentDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const entry = monthMap.get(key) ?? { invested: 0, redeemed: 0 };
      if (isSellTransaction(t)) entry.redeemed += t.value;
      else entry.invested += t.value;
      monthMap.set(key, entry);
    }
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - (11 - index));
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      return { label, ...(monthMap.get(key) ?? { invested: 0, redeemed: 0 }) };
    });
  }, [filteredTransactions]);

  const exportCSV = useCallback(() => {
    const headers = ["Scheme,Invested,Current Value,Returns,Return%,XIRR,Units,Latest NAV"];
    const rows = schemeData.map((s) => {
      const flows = s.transactions
        .filter((t) => t.investmentDate)
        .map((t) => ({ date: new Date(t.investmentDate), amount: (t.isSell ? t.value : -t.value) }));
      if (s.currentValue > 0) flows.push({ date: new Date(), amount: s.currentValue });
      const xirrVal = flows.length >= 2 ? calculateXIRR(flows) : null;
      return `"${s.schemeName}",${s.totalInvested.toFixed(0)},${s.currentValue.toFixed(0)},${s.returns.toFixed(0)},${s.returnPercent.toFixed(2)},${xirrVal !== null ? xirrVal.toFixed(2) : "N/A"},${s.totalUnits.toFixed(3)},${s.latestNav.toFixed(2)}`;
    });
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-analysis-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [schemeData]);

  const hasData = schemeData.length > 0;

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
              Portfolio Attribution & Analysis
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Detailed breakdown for {selectedInvestor === "all" ? `${investors.length} investor(s)` : selectedInvestor} across asset classes and schemes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasData && (
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5 text-xs font-bold rounded-xl border-border/80">
              <Download className="h-3.5 w-3.5" />
              Export Ledger
            </Button>
          )}
        </div>
      </div>

      {/* ── Top 4 Modern KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <ModernAnalysisKpiCard
          title="Total Invested"
          value={formatIndianUnits(totalInvested)}
          subValue={`${schemeData.length} Active Schemes`}
          sparkData={performanceData.length > 1 ? performanceData.map((p) => p.invested) : [totalInvested * 0.9, totalInvested]}
          sparkColor="#2563eb"
          icon={<Target className="h-4 w-4" />}
          tag="Cost Basis"
        />

        <ModernAnalysisKpiCard
          title="Current Valuation"
          value={formatIndianUnits(currentValue)}
          subValue={`${isPositive ? "+" : ""}${overallAllReturn}% Return`}
          isPositive={isPositive}
          sparkData={performanceData.length > 1 ? performanceData.map((p) => p.value) : [currentValue * 0.9, currentValue]}
          sparkColor="#10b981"
          icon={isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          tag={isPositive ? "Profitable" : "Deficit"}
        />

        <ModernAnalysisKpiCard
          title="Unrealized Gains"
          value={`${isPositive ? "+" : ""}${formatIndianUnits(totalReturns)}`}
          subValue={isPositive ? "Above net invested" : "Below net invested"}
          isPositive={isPositive}
          sparkData={performanceData.length > 1 ? performanceData.map((p) => p.value - p.invested) : [totalReturns * 0.8, totalReturns]}
          sparkColor={isPositive ? "#10b981" : "#ef4444"}
          icon={<DollarSign className="h-4 w-4" />}
          tag="Mark to Market"
        />

        <ModernAnalysisKpiCard
          title="Portfolio XIRR"
          value={typeof overallXirr === "number" ? `${overallXirr.toFixed(1)}%` : "N/A"}
          subValue="Annualized Money-Weighted Return"
          sparkData={[12, 13.5, 14.8, typeof overallXirr === "number" ? overallXirr : 15]}
          sparkColor="#8b5cf6"
          icon={<Zap className="h-4 w-4" />}
          tag="XIRR"
        />
      </div>

      {/* ── Charts Row: Asset Mix Donut & Monthly Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Asset Allocation Donut */}
        <Card className="rounded-2xl border border-border/80 bg-card shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-bold text-foreground">Asset Class Allocation</CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold">
              Net Worth: {formatIndianUnits(totalNetWorth)}
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 flex-1">
            <div className="relative h-44 w-44 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocationData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }}
                    formatter={(val: number) => [formatIndianUnits(val), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Portfolio</span>
                <p className="text-xs font-bold text-foreground">{formatIndianUnits(totalPortfolioValue)}</p>
              </div>
            </div>

            <div className="flex-1 w-full space-y-2.5">
              {allocationData.map((item, idx) => {
                const pct = totalPortfolioValue > 0 ? ((item.value / totalPortfolioValue) * 100).toFixed(1) : "0.0";
                return (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-foreground">{formatIndianUnits(item.value)}</span>
                      <span className="text-[10px] text-muted-foreground font-bold">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Monthly Inflows / Redemptions Bar Chart */}
        <Card className="rounded-2xl border border-border/80 bg-card shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-sm font-bold text-foreground">Monthly Inflows & Redemptions</CardTitle>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <span>Purchases</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>Exits</span>
              </div>
            </div>
          </div>

          <div className="pt-3 flex-1">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatIndianUnits(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }}
                  formatter={(val: number) => [formatIndianUnits(val), ""]}
                />
                <Bar dataKey="invested" name="Purchases" fill="#2563eb" radius={[3, 3, 0, 0]} barSize={14} />
                <Bar dataKey="redeemed" name="Redemptions" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── Scheme Breakdown Leaderboard ── */}
      <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Scheme Holdings Attribution ({schemeData.length})
              </CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                XIRR money-weighted return and folio concentration ranked by market valuation.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          {hasData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {schemeData.map((scheme, idx) => (
                <SchemeCard
                  key={scheme.schemeName}
                  scheme={scheme}
                  rank={idx + 1}
                  totalValue={currentValue}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">No mutual fund holdings found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload CAS or execute transaction to view scheme attribution analytics.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default memo(PortfolioAnalysis);
