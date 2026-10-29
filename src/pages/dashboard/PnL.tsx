import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/MetricCard";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { CommonCard } from "@/components/shared/CommonCard";
import { ChartInsight } from "@/components/charts/ChartInsight";
import { cn } from "@/lib/utils";
import { formatIndianUnits, formatPercent } from "@/utils/format";
import { useInvestor } from "@/contexts/InvestorContext";
import { usePortfolioData, SchemeData } from "@/hooks/usePortfolioData";
import { isSellTransaction } from "@/utils/parseTransactions";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  BarChart3,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
  Award,
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
  Legend,
} from "recharts";

// ── Shared chart tooltip style ──────────────────────────────────────────────
const chartTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  borderColor: "hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
};

const CHART_PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
];

interface SchemePnLCardProps {
  scheme: SchemeData;
}

const SchemePnLCard = memo(({ scheme }: SchemePnLCardProps) => {
  const isPositive = scheme.returns >= 0;

  return (
    <Card className="rounded-xl border border-border bg-card hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {scheme.schemeName}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {scheme.totalUnits.toLocaleString("en-IN", { maximumFractionDigits: 2 })} units • NAV ₹{scheme.latestNav.toFixed(2)}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs font-bold shrink-0 border-none px-2.5 py-0.5 rounded-full flex items-center gap-1",
              isPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {formatPercent(scheme.returnPercent)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-border/40 pt-3">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Invested</p>
            <p className="text-base font-heading font-extrabold text-foreground mt-0.5">
              {formatIndianUnits(scheme.totalInvested)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Current Value</p>
            <p className="text-base font-heading font-extrabold text-primary mt-0.5">
              {formatIndianUnits(scheme.currentValue)}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "p-3 rounded-xl border flex items-center justify-between",
            isPositive
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400"
          )}
        >
          <span className="text-xs font-medium text-muted-foreground">Net P&amp;L</span>
          <span className="text-base font-heading font-extrabold">
            {isPositive ? "+" : ""}
            {formatIndianUnits(scheme.returns)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});
SchemePnLCard.displayName = "SchemePnLCard";

const PnL = () => {
  const { filteredTransactions, isNewUser, selectedInvestor } = useInvestor();
  const {
    schemeData,
    totalInvested,
    currentValue,
    totalReturns,
    roi,
    monthlyInvestmentMIS,
  } = usePortfolioData(filteredTransactions, isNewUser);

  // Dynamic calculations from live transactions
  const { totalRealized, monthlyTrend, schemeDistribution, bestPerformer } = useMemo(() => {
    // 1. Calculate Realized P&L from historical redemptions
    let realizedSum = 0;
    const redemptions = filteredTransactions.filter(isSellTransaction);
    for (const r of redemptions) {
      realizedSum += r.value || 0;
    }

    // 2. Monthly Trend from monthlyInvestmentMIS
    const trend = monthlyInvestmentMIS.map((m) => ({
      month: m.label,
      inflow: m.purchases,
      outflow: m.redemptions,
      netflow: m.net,
    }));

    // 3. Scheme-wise value distribution for pie chart
    const distribution = schemeData.slice(0, 6).map((s, idx) => ({
      name: s.schemeName.length > 25 ? `${s.schemeName.substring(0, 25)}...` : s.schemeName,
      value: Math.max(0, s.currentValue),
      color: CHART_PIE_COLORS[idx % CHART_PIE_COLORS.length],
    }));

    // 4. Best Performing Scheme
    const sortedByReturn = [...schemeData].sort((a, b) => b.returnPercent - a.returnPercent);
    const best = sortedByReturn[0] || null;

    return {
      totalRealized: Math.round(realizedSum),
      monthlyTrend: trend,
      schemeDistribution: distribution,
      bestPerformer: best,
    };
  }, [filteredTransactions, monthlyInvestmentMIS, schemeData]);

  const isOverallPositive = totalReturns >= 0;

  const pnlInsight = useMemo(() => {
    if (schemeData.length === 0) {
      return "No active mutual fund holdings are recorded for this portfolio.";
    }
    const positiveCount = schemeData.filter((s) => s.returns >= 0).length;
    return `Your portfolio holds ${schemeData.length} active scheme(s) with ${formatIndianUnits(totalReturns)} total unrealized return (${isOverallPositive ? "+" : ""}${Number(roi).toFixed(2)}%). ${positiveCount} out of ${schemeData.length} positions are currently in profit.`;
  }, [schemeData, totalReturns, roi, isOverallPositive]);

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Profit & Loss Report"
        description={`${selectedInvestor === "all" ? "All Investors" : selectedInvestor} — Comprehensive real-time realized & unrealized capital gains analysis`}
      />

      {/* Top 4 Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Realized Redemptions"
          value={formatIndianUnits(totalRealized)}
          change="Historical Exit Liquidity"
          changeType="neutral"
          icon={DollarSign}
        />
        <MetricCard
          title="Total Unrealized P&L"
          value={`${isOverallPositive ? "+" : ""}${formatIndianUnits(totalReturns)}`}
          change="Open Portfolio Valuation Gain"
          changeType={isOverallPositive ? "positive" : "negative"}
          icon={isOverallPositive ? TrendingUp : TrendingDown}
        />
        <MetricCard
          title="Overall Return"
          value={`${isOverallPositive ? "+" : ""}${Number(roi).toFixed(2)}%`}
          change="Net Capital Appreciation"
          changeType={isOverallPositive ? "positive" : "negative"}
          icon={Percent}
        />
        <MetricCard
          title="Top Performer"
          value={bestPerformer ? bestPerformer.schemeName.substring(0, 20) + "..." : "N/A"}
          change={bestPerformer ? `+${bestPerformer.returnPercent.toFixed(2)}%` : "0%"}
          changeType="positive"
          icon={Award}
        />
      </div>

      <ChartInsight>{pnlInsight}</ChartInsight>

      {/* Charts Section */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        {/* Monthly Investment & Liquidity Trend */}
        <Card className="lg:col-span-4 rounded-2xl border border-border/70 bg-card shadow-xs overflow-hidden">
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Monthly Cash Inflow &amp; Redemptions (MIS)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-6">
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrend} margin={{ top: 10, right: 20, left: 10, bottom: 5 }} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatIndianUnits(v)}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(val: number) => [formatIndianUnits(val), ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="inflow" fill="#2563eb" name="Purchases / SIP" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outflow" fill="#ef4444" name="Redemptions" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No monthly transactions recorded.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheme Valuation Distribution */}
        <Card className="lg:col-span-3 rounded-2xl border border-border/70 bg-card shadow-xs overflow-hidden flex flex-col">
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-primary" />
              Holdings Value Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-4">
            {schemeDistribution.length > 0 && currentValue > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={schemeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name.substring(0, 12)} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  >
                    {schemeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(val: number) => [formatIndianUnits(val), "Valuation"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                No active scheme allocation data.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scheme-wise Detailed P&L Cards */}
      <CommonCard title={`Active Scheme Holdings (${schemeData.length})`}>
        {schemeData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemeData.map((scheme) => (
              <SchemePnLCard key={scheme.schemeName} scheme={scheme} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No active positions found. Ingest transaction records to view scheme-wise P&amp;L.
          </div>
        )}
      </CommonCard>
    </div>
  );
};

export default memo(PnL);
