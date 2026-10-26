import { memo, useMemo } from "react";
import { MetricCard } from "@/components/shared/MetricCard";
import { TrendingUp, Wallet, PieChart, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { isSellTransaction, TransactionData } from "@/utils/parseTransactions";
import { calculateXIRR } from "@/lib/xirr";
import { useInvestor } from "@/contexts/InvestorContext";
import { CommonCard } from "@/components/shared/CommonCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { CommonTable, ColumnConfig } from "@/components/shared/CommonTable";
import { cn } from "@/lib/utils";

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

  // Group by scheme and calculate totals using useMemo
  const schemeData = useMemo(() => {
    const schemes = new Map<string, SchemeHolding>();

    // Sort transactions oldest to newest so the last iterated is the latest NAV
    const sortedTx = [...filteredTransactions].sort(
      (a, b) => new Date(a.investmentDate).getTime() - new Date(b.investmentDate).getTime()
    );

    sortedTx.forEach((t) => {
      const existing = schemes.get(t.schemeName);
      const isSell = isSellTransaction(t);
      const invested = isSell ? -t.value : t.value;
      const units = isSell ? -t.units : t.units;

      if (existing) {
        existing.totalUnits += units;
        existing.totalInvested += invested;
        existing.latestNav = t.nav;
        existing.transactions.push(t);
      } else {
        schemes.set(t.schemeName, {
          id: t.schemeName,
          schemeName: t.schemeName,
          totalUnits: units,
          totalInvested: invested,
          latestNav: t.nav,
          transactions: [t],
        });
      }
    });

    return Array.from(schemes.values()).filter((s) => s.totalUnits > 0);
  }, [filteredTransactions]);

  // Calculate portfolio totals using useMemo
  const { totalInvested, totalValue, totalReturns, overallReturn } = useMemo(() => {
    if (isNewUser) {
      return { totalInvested: 0, totalValue: 0, totalReturns: 0, overallReturn: "0.00" };
    }

    let invested = 0;
    let val = 0;
    for (const s of schemeData) {
      invested += s.totalInvested;
      val += s.totalUnits * s.latestNav;
    }
    const returns = val - invested;
    const returnPct = invested > 0 ? ((returns / invested) * 100).toFixed(2) : "0.00";

    return {
      totalInvested: invested,
      totalValue: val,
      totalReturns: returns,
      overallReturn: returnPct,
    };
  }, [schemeData, isNewUser]);

  // Calculate XIRR for the selected investor using useMemo
  const xirr = useMemo(() => {
    if (filteredTransactions.length === 0 || isNewUser) return isNewUser ? 0 : null;

    const xirrTransactions = filteredTransactions.map((t) => ({
      date: new Date(t.investmentDate),
      amount: isSellTransaction(t) ? t.value : -t.value,
    }));

    if (totalValue > 0) {
      xirrTransactions.push({
        date: new Date(),
        amount: totalValue,
      });
    }

    return calculateXIRR(xirrTransactions);
  }, [filteredTransactions, isNewUser, totalValue]);

  // Performance data over time (last 12 months)
  const performanceData = useMemo(() => {
    const monthlyData = new Map<string, number>();
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      monthlyData.set(monthKey, 0);
    }

    filteredTransactions.forEach((t) => {
      const date = new Date(t.investmentDate);
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

      if (monthlyData.has(monthKey)) {
        const currentValue = monthlyData.get(monthKey) || 0;
        const value = isSellTransaction(t) ? -t.value : t.value;
        monthlyData.set(monthKey, currentValue + value);
      }
    });

    let cumulative = 0;
    return Array.from(monthlyData.entries()).map(([month, value]) => {
      cumulative += value;
      return { month, value: Math.max(0, cumulative) };
    });
  }, [filteredTransactions]);

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

  const isPositiveReturns = totalReturns >= 0;

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Mutual Funds"
        description="Comprehensive portfolio analytics with XIRR performance metrics"
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Investment"
          value={`₹${totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          change={`Across ${schemeData.length} schemes`}
          changeType="neutral"
          icon={Wallet}
        />
        <MetricCard
          title="Current Value"
          value={`₹${totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          change={`${isPositiveReturns ? "+" : ""}${overallReturn}% returns`}
          changeType={isPositiveReturns ? "positive" : "negative"}
          icon={TrendingUp}
        />
        <MetricCard
          title="Total Returns"
          value={`₹${totalReturns.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          change="Absolute Gain"
          changeType={isPositiveReturns ? "positive" : "negative"}
          icon={PieChart}
        />
        <MetricCard
          title="Portfolio XIRR"
          value={xirr ? `${xirr.toFixed(2)}%` : "N/A"}
          change="Annualized Return"
          changeType={xirr && xirr > 0 ? "positive" : "neutral"}
          icon={Calendar}
        />
      </div>

      <CommonCard title="Portfolio Growth Trend">
        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="mfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => (val >= 100000 ? `₹${(val / 100000).toFixed(0)}L` : `₹${val}`)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Cumulative Value"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#mfGrad)"
                dot={false}
                activeDot={{ r: 5, fill: "#3b82f6" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CommonCard>

      <CommonCard title="Scheme Holdings">
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
