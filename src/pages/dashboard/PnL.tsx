import { memo, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";
import { formatIndianUnits, formatPercent } from "@/utils/format";
import { useInvestor } from "@/contexts/InvestorContext";
import { useUserInvestments } from "@/hooks/useUserInvestments";
import { usePortfolioData, SchemeData } from "@/hooks/usePortfolioData";
import { useQueryClient } from "@tanstack/react-query";
import { isSellTransaction } from "@/utils/parseTransactions";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Search,
  Filter,
  Layers,
  Wallet,
  Activity,
  Calendar,
  Download,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CHART_PIE_COLORS = [
  "#2563eb",
  "#10b981",
  "#6366f1",
  "#f59e0b",
  "#ec4899",
  "#14b8a6",
  "#8b5cf6",
];

/* ── Modern Elevated KPI Card ───────────────────────────────── */
interface ModernPnlKpiCardProps {
  title: string;
  value: string;
  subValue?: string;
  tag?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  footerNote?: string;
}

const ModernPnlKpiCard = memo(
  ({ title, value, subValue, tag, isPositive = true, icon, footerNote }: ModernPnlKpiCardProps) => (
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
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{footerNote || "Recorded portfolio data"}</span>
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
ModernPnlKpiCard.displayName = "ModernPnlKpiCard";

/* ── Upgraded Scheme P&L Item ────────────────────────────────── */
const ModernSchemeCard = memo(({ scheme }: { scheme: SchemeData }) => {
  const isPositive = scheme.returns >= 0;

  return (
    <div className="p-4 rounded-2xl border border-border/70 bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {scheme.schemeName}
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {scheme.totalUnits.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Units · NAV ₹{scheme.latestNav.toFixed(2)}
          </p>
        </div>

        <Badge
          variant="secondary"
          className={cn(
            "text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-0.5 border-none",
            isPositive
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
          )}
        >
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {formatPercent(scheme.returnPercent)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/40 text-xs">
        <div>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Invested</span>
          <p className="font-extrabold text-foreground mt-0.5">{formatIndianUnits(scheme.totalInvested)}</p>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Current Value</span>
          <p className="font-extrabold text-primary mt-0.5">{formatIndianUnits(scheme.currentValue)}</p>
        </div>
      </div>

      <div
        className={cn(
          "px-3 py-2 rounded-xl flex items-center justify-between text-xs font-bold",
          isPositive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
        )}
      >
        <span className="text-[11px] font-medium text-muted-foreground">Unrealized P&L</span>
        <span className="font-heading font-extrabold">
          {isPositive ? "+" : ""}{formatIndianUnits(scheme.returns)}
        </span>
      </div>
    </div>
  );
});
ModernSchemeCard.displayName = "ModernSchemeCard";

/* ── Main PnL Component ──────────────────────────────────────── */
export const PnL = () => {
  const { filteredTransactions, isNewUser, selectedInvestor } = useInvestor();
  const { isLoading: isTransactionsLoading, error: transactionsError } = useUserInvestments();
  const queryClient = useQueryClient();
  const {
    schemeData,
    totalInvested,
    currentValue,
    totalReturns,
    roi,
    monthlyInvestmentMIS,
  } = usePortfolioData(filteredTransactions, isNewUser);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "profit" | "loss">("all");

  // Derive amounts and trends from the recorded transaction history.
  const { totalRealized, monthlyTrend, schemeDistribution, bestPerformer, worstPerformer } = useMemo(() => {
    let realizedSum = 0;
    const redemptions = filteredTransactions.filter(isSellTransaction);
    for (const r of redemptions) {
      realizedSum += r.value || 0;
    }

    const trend = monthlyInvestmentMIS.map((m) => ({
      month: m.label,
      inflow: m.purchases,
      outflow: m.redemptions,
      netflow: m.net,
    }));

    const distribution = schemeData.slice(0, 6).map((s, idx) => ({
      name: s.schemeName.length > 25 ? `${s.schemeName.substring(0, 22)}...` : s.schemeName,
      value: Math.max(0, s.currentValue),
      color: CHART_PIE_COLORS[idx % CHART_PIE_COLORS.length],
    }));

    const sorted = [...schemeData].sort((a, b) => b.returnPercent - a.returnPercent);
    const best = sorted[0] || null;
    const worst = sorted.length > 1 ? sorted[sorted.length - 1] : null;

    return {
      totalRealized: Math.round(realizedSum),
      monthlyTrend: trend,
      schemeDistribution: distribution,
      bestPerformer: best,
      worstPerformer: worst,
    };
  }, [filteredTransactions, monthlyInvestmentMIS, schemeData]);

  const isOverallPositive = totalReturns >= 0;

  // Filtered scheme cards
  const filteredSchemes = useMemo(() => {
    return schemeData.filter((s) => {
      const matchSearch = s.schemeName.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (filterType === "profit") return s.returns >= 0;
      if (filterType === "loss") return s.returns < 0;
      return true;
    });
  }, [schemeData, search, filterType]);

  if (isTransactionsLoading || transactionsError) {
    return (
      <div className="space-y-5 animate-in">
        <PageHeader title="Profit & Loss Analytics" description="Redemption proceeds and unrealized returns calculated from recorded transactions and their latest NAVs." />
        {isTransactionsLoading ? (
          <div role="status" className="rounded-xl border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">Loading transaction data…</div>
        ) : (
          <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span>Profit and loss data could not be loaded.</span>
            <Button variant="outline" onClick={() => void queryClient.invalidateQueries({ queryKey: ["user-investments"] })}>Retry</Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-heading font-extrabold text-foreground">
              Profit & Loss Analytics
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Redemption proceeds and unrealized returns calculated from recorded transactions and their latest NAVs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-muted/40">
            Client: {selectedInvestor === "all" ? "All Portfolios" : selectedInvestor}
          </Badge>
        </div>
      </div>

      {/* ── Top 4 Modern KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <ModernPnlKpiCard
          title="Redemption Proceeds"
          value={formatIndianUnits(totalRealized)}
          subValue="Cumulative Redemptions"
          icon={<DollarSign className="h-4 w-4" />}
          footerNote="Historical Liquidity"
          tag="Realized"
        />

        <ModernPnlKpiCard
          title="Unrealized Net P&L"
          value={`${isOverallPositive ? "+" : ""}${formatIndianUnits(totalReturns)}`}
          subValue={`${isOverallPositive ? "+" : ""}${Number(roi).toFixed(2)}% Overall ROI`}
          isPositive={isOverallPositive}
          icon={<Activity className="h-4 w-4" />}
          footerNote="Mark to Market"
          tag={isOverallPositive ? "Profitable" : "Drawdown"}
        />

        <ModernPnlKpiCard
          title="Total Invested Cost"
          value={formatIndianUnits(totalInvested)}
          subValue={`${schemeData.length} Active Funds`}
          icon={<Wallet className="h-4 w-4" />}
          footerNote="Net Capital Outlay"
          tag="Principal"
        />

        <ModernPnlKpiCard
          title="Latest Recorded Value"
          value={formatIndianUnits(currentValue)}
          subValue={`${totalReturns >= 0 ? "+" : ""}${formatIndianUnits(totalReturns)} net return`}
          icon={<Layers className="h-4 w-4" />}
          footerNote="Latest recorded NAV"
          tag="Net Asset Value"
        />
      </div>

      {/* ── Best & Worst Performer Highlights ── */}
      {(bestPerformer || worstPerformer) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {bestPerformer && (
            <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Top Performer</span>
                  <p className="text-xs font-bold text-foreground truncate">{bestPerformer.schemeName}</p>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white font-extrabold text-xs shrink-0">
                +{formatPercent(bestPerformer.returnPercent)}
              </Badge>
            </div>
          )}

          {worstPerformer && worstPerformer !== bestPerformer && (
            <div className="p-3.5 rounded-2xl border border-rose-500/20 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-rose-500/20 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400">Lowest Performer</span>
                  <p className="text-xs font-bold text-foreground truncate">{worstPerformer.schemeName}</p>
                </div>
              </div>
              <Badge variant="outline" className="border-rose-400 text-rose-600 font-extrabold text-xs shrink-0">
                {formatPercent(worstPerformer.returnPercent)}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* ── Main Tabbed Section ── */}
      <Tabs defaultValue="holdings" className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <TabsList className="bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="holdings" className="text-xs font-semibold rounded-lg">
              Scheme Holdings ({filteredSchemes.length})
            </TabsTrigger>
            <TabsTrigger value="charts" className="text-xs font-semibold rounded-lg">
              Allocation & Cashflow Charts
            </TabsTrigger>
          </TabsList>

          {/* Search & Filter Controls */}
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search scheme name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs rounded-xl"
              />
            </div>
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl text-[11px] font-semibold">
              <button
                onClick={() => setFilterType("all")}
                className={cn("px-2 py-1 rounded-lg transition-all", filterType === "all" ? "bg-card shadow-xs text-foreground font-bold" : "text-muted-foreground")}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("profit")}
                className={cn("px-2 py-1 rounded-lg transition-all", filterType === "profit" ? "bg-emerald-600 text-white font-bold" : "text-muted-foreground")}
              >
                Profit
              </button>
              <button
                onClick={() => setFilterType("loss")}
                className={cn("px-2 py-1 rounded-lg transition-all", filterType === "loss" ? "bg-rose-600 text-white font-bold" : "text-muted-foreground")}
              >
                Loss
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Scheme Holdings Grid */}
        <TabsContent value="holdings" className="m-0 space-y-4">
          {filteredSchemes.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
              <AlertCircle className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
              <p className="font-bold text-foreground">No schemes matching filter</p>
              <p className="text-[11px] text-muted-foreground/80 mt-0.5">Try searching with a different term or reset filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredSchemes.map((scheme) => (
                <ModernSchemeCard key={scheme.schemeName} scheme={scheme} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Visual Charts */}
        <TabsContent value="charts" className="m-0 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Asset Value Mix */}
            <Card className="lg:col-span-5 rounded-2xl border border-border bg-card p-4">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                  <PieIcon className="h-3.5 w-3.5 text-blue-600" />
                  Top Holdings Value Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[240px]">
                  {schemeDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={schemeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {schemeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "11px" }}
                        formatter={(val: number) => [formatIndianUnits(val), "Holding Value"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  ) : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No fund allocation data available.</div>}
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-2 text-[11px]">
                  {schemeDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 truncate">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Inflow vs Outflow */}
            <Card className="lg:col-span-7 rounded-2xl border border-border bg-card p-4">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-emerald-600" />
                  Monthly Investment Inflows vs Redemptions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[260px]">
                  {monthlyTrend.some((month) => month.inflow > 0 || month.outflow > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatIndianUnits(v)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "11px" }}
                        formatter={(val: number) => [formatIndianUnits(val)]}
                      />
                      <Bar dataKey="inflow" name="Purchases" fill="#2563eb" radius={[3, 3, 0, 0]} barSize={12} />
                      <Bar dataKey="outflow" name="Redemptions" fill="#f43f5e" radius={[3, 3, 0, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                  ) : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No transaction activity recorded for this period.</div>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default memo(PnL);
