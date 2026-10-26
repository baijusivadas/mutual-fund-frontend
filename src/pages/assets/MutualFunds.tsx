import { memo, useMemo } from "react";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { TrendingUp, Wallet, PieChart, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { useInvestor } from "@/contexts/InvestorContext";
import { CommonCard } from "@/components/shared/CommonCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { CommonTable, ColumnConfig } from "@/components/shared/CommonTable";
import { cn } from "@/lib/utils";
import { ChartInsight } from "@/components/charts/ChartInsight";
import type { TransactionData } from "@/utils/parseTransactions";

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const formatCompactCurrency = (value: number) => {
  if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
};

interface SchemeHolding {
  id: string;
  schemeName: string;
  totalUnits: number;
  totalInvested: number;
  latestNav: number;
  transactions: TransactionData[];
}

const MutualFunds = () => {
  const { filteredTransactions, isNewUser } = useInvestor();
  const {
    schemeData: portfolioSchemes,
    totalInvested,
    currentValue: totalValue,
    totalReturns,
    roi: overallReturn,
    xirr,
    performanceData,
  } = usePortfolioData(filteredTransactions, isNewUser);
  const schemeData = useMemo(
    () =>
      portfolioSchemes.map((scheme) => ({
        id: scheme.schemeName,
        schemeName: scheme.schemeName,
        totalUnits: scheme.totalUnits,
        totalInvested: scheme.totalInvested,
        latestNav: scheme.latestNav,
        transactions: scheme.transactions,
      })),
    [portfolioSchemes]
  );
  const isPositiveReturns = totalReturns >= 0;
  const portfolioInsight =
    totalInvested > 0
      ? `Current value is ${formatCurrency(Math.abs(totalReturns))} ${isPositiveReturns ? "above" : "below"} net invested (${Math.abs(Number(overallReturn)).toFixed(2)}%). The chart shows the recent valuation trend alongside net invested.`
      : "Add mutual fund transactions to see your portfolio valuation trend and performance.";

  // Table columns memoized to prevent table rows from re-rendering unnecessarily
  const columns: ColumnConfig<SchemeHolding>[] = useMemo(
    () => [
      {
        key: "schemeName",
        label: "Scheme Name",
        sortable: true,
        className: "font-semibold max-w-md text-foreground",
      },
      {
        key: "totalUnits",
        label: "Units",
        sortable: true,
        className: "text-right font-medium",
        render: (item) => item.totalUnits.toLocaleString("en-IN", { maximumFractionDigits: 2 }),
      },
      {
        key: "latestNav",
        label: "NAV",
        sortable: true,
        className: "text-right font-medium",
        render: (item) => `₹${item.latestNav.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
      },
      {
        key: "totalInvested",
        label: "Invested",
        sortable: true,
        className: "text-right font-medium",
        render: (item) =>
          `₹${item.totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      },
      {
        key: "currentValue",
        label: "Current Value",
        sortable: true,
        className: "text-right font-extrabold text-foreground",
        render: (item) =>
          `₹${(item.totalUnits * item.latestNav).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      },
      {
        key: "returns",
        label: "Returns",
        sortable: true,
        className: "text-right",
        render: (item) => {
          const returns = item.totalUnits * item.latestNav - item.totalInvested;
          const isPos = returns >= 0;
          return (
            <div
              className={cn(
                "text-sm font-bold flex items-center justify-end gap-0.5",
                isPos ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {isPos ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {isPos ? "+" : ""}₹{returns.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>
          );
        },
      },
      {
        key: "returnPercent",
        label: "Returns %",
        sortable: true,
        className: "text-right",
        render: (item) => {
          const returns = item.totalUnits * item.latestNav - item.totalInvested;
          const returnPercent = item.totalInvested > 0 ? (returns / item.totalInvested) * 100 : 0;
          const isPos = returns >= 0;
          return (
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] font-bold border-none px-2 py-0.5 rounded-full",
                isPos
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              )}
            >
              {isPos ? "+" : ""}
              {returnPercent.toFixed(2)}%
            </Badge>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Mutual Funds"
        description="Comprehensive portfolio analytics with XIRR performance metrics"
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          title="Total Investment"
          value={formatCurrency(totalInvested)}
          change={`Across ${schemeData.length} schemes`}
          changeType="neutral"
          icon={Wallet}
          tone="blue"
          sparkData={performanceData.map((point) => point.invested)}
        />
        <DashboardMetricCard
          title="Current Value"
          value={formatCurrency(totalValue)}
          change={`${isPositiveReturns ? "+" : ""}${overallReturn}% vs. net invested`}
          changeType={isPositiveReturns ? "positive" : "negative"}
          icon={TrendingUp}
          tone="green"
          sparkData={performanceData.map((point) => point.value)}
        />
        <DashboardMetricCard
          title="Total Returns"
          value={formatCurrency(totalReturns)}
          change="Value vs. net invested"
          changeType={isPositiveReturns ? "positive" : "negative"}
          icon={PieChart}
          tone={isPositiveReturns ? "amber" : "rose"}
          sparkData={performanceData.map((point) => point.value - point.invested)}
        />
        <DashboardMetricCard
          title="Portfolio XIRR"
          value={typeof xirr === "number" ? `${xirr.toFixed(2)}%` : "N/A"}
          change="Annualized Return"
          changeType={typeof xirr === "number" && xirr >= 0 ? "positive" : "neutral"}
          icon={Calendar}
          tone="rose"
        />
      </div>

      <CommonCard title="Portfolio Valuation Trend" className="bg-card border border-border/70 rounded-xl shadow-xs" titleClassName="text-base">
        <div className="h-[280px] w-full pt-2">
          {performanceData.length > 0 ? <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="mfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickMargin={8} />
              <YAxis
                width={56}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tickFormatter={formatCompactCurrency}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
              />
              <Line
                type="monotone"
                dataKey="invested"
                name="Net invested"
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                name="Portfolio value"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#mfGrad)"
                dot={false}
                activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
              />
            </AreaChart>
          </ResponsiveContainer> : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No portfolio valuation data available.
            </div>
          )}
        </div>
        <ChartInsight>{portfolioInsight}</ChartInsight>
      </CommonCard>

      <CommonCard title="Scheme Holdings" className="bg-card border border-border/70 rounded-xl shadow-xs" titleClassName="text-base">
        <CommonTable<SchemeHolding>
          data={schemeData}
          columns={columns}
          searchPlaceholder="Search schemes..."
          searchKeys={["schemeName"]}
          emptyMessage="No scheme holdings found"
        />
      </CommonCard>
    </div>
  );
};

export default memo(MutualFunds);
