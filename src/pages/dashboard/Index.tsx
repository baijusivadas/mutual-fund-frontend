import { memo, useMemo, useState, useCallback } from "react";
import { useInvestor } from "@/contexts/InvestorContext";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { useAuth } from "@/contexts/AuthContext";
import { useAdvancedPortfolio } from "@/hooks/useAdvancedPortfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Briefcase,
  Clock,
  FilePlus,
  PauseCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Filter,
  RotateCcw,
  Maximize2,
  Phone,
  Mail,
  Info,
  Star,
  Grid,
  ExternalLink,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  LineChart,
} from "recharts";
import { isSellTransaction, TransactionData } from "@/utils/parseTransactions";

/* ─── helpers ─────────────────────────────────────────────── */
const fmt = (v: number) => {
  if (!v || isNaN(v)) return "₹0";
  if (v >= 10000000) {
    return `₹${(v / 10000000).toFixed(2)} Cr`;
  }
  if (v >= 100000) {
    return `₹${(v / 100000).toFixed(2)} Lakh`;
  }
  return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const fmtFull = (v: number) =>
  `₹${(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

/* ─── Smooth Sparkline Component ───────────────────────────── */
const Sparkline = memo(
  ({
    data,
    color = "#2563eb",
  }: {
    data: number[];
    color?: string;
  }) => {
    const chartData = useMemo(() => {
      const safeData = data && data.length > 0 ? data : [10, 15, 20, 25, 30];
      return safeData.map((v, i) => ({ i, v }));
    }, [data]);

    const gradientId = `spk-${color.replace("#", "")}`;

    return (
      <ResponsiveContainer width="100%" height={46}>
        <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
);

/* ─── Top 3 KPI Card Component ─────────────────────────────── */
interface KpiCardProps {
  title: string;
  value: string;
  dayChange?: string;
  momChange?: string;
  dayLabel?: string;
  momLabel?: string;
  dayPositive?: boolean;
  momPositive?: boolean;
  sparkData: number[];
  sparkColor: string;
}

const KpiCard = memo(
  ({
    title,
    value,
    dayChange,
    momChange,
    dayLabel = "Day",
    momLabel = "MoM",
    dayPositive = true,
    momPositive = true,
    sparkData,
    sparkColor,
  }: KpiCardProps) => (
    <Card className="relative overflow-hidden bg-card border border-border/70 hover:border-primary/40 transition-all duration-200 hover:shadow-md rounded-xl">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold text-muted-foreground">{title}</p>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-foreground cursor-pointer transition-colors" />
        </div>

        <div className="flex items-center justify-between mt-2 gap-2">
          <p className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground tracking-tight">
            {value}
          </p>
          <div className="w-[100px] sm:w-[120px] shrink-0">
            <Sparkline data={sparkData} color={sparkColor} />
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-3 pt-2 border-t border-border/40 text-[11px]">
          {dayChange !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <span className="text-muted-foreground/80">~</span> {dayLabel}
              </span>
              <span
                className={cn(
                  "font-semibold",
                  dayPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
              >
                {dayChange}
              </span>
            </div>
          )}
          {momChange !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <span className="text-muted-foreground/80">~</span> {momLabel}
              </span>
              <span
                className={cn(
                  "font-semibold",
                  momPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
              >
                {momChange}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
);

/* ─── 8 Operation Metric Cards ─────────────────────────────── */
interface OpCardProps {
  icon: React.ElementType;
  label: string;
  count: number;
  value: string;
}

const OpCard = memo(({ icon: Icon, label, count, value }: OpCardProps) => (
  <Card className="bg-card border border-border/70 hover:border-primary/40 hover:shadow-sm transition-all duration-200 rounded-xl cursor-pointer group">
    <CardContent className="p-3.5">
      <div className="flex items-center justify-between">
        <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <ExternalLink className="h-3 w-3 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
      </div>
      <div className="mt-2.5">
        <p className="text-[11px] font-medium text-muted-foreground truncate">
          {label} ({count})
        </p>
        <p className="text-base sm:text-lg font-heading font-extrabold text-foreground mt-0.5">
          {value}
        </p>
      </div>
    </CardContent>
  </Card>
));

/* ─── Transaction Feed Item ────────────────────────────────── */
interface TxnFeedItemProps {
  investorName: string;
  schemeName: string;
  type: string;
  amount: number;
  date: string;
  source?: string;
  platform?: string;
}

const TxnFeedItem = memo(
  ({
    investorName,
    schemeName,
    type,
    amount,
    date,
    source = "Web",
    platform = "NSE",
  }: TxnFeedItemProps) => {
    const isSell =
      type.toLowerCase().includes("sell") || type.toLowerCase().includes("redemption");

    const formattedDate = useMemo(() => {
      try {
        const d = new Date(date);
        return isNaN(d.getTime())
          ? date
          : `${d.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })} ${d.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}`;
      } catch {
        return date;
      }
    }, [date]);

    return (
      <div className="p-3.5 rounded-xl bg-card border border-border/70 hover:border-primary/30 transition-all space-y-1.5 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-foreground truncate">{investorName}</p>
          <Badge
            variant="outline"
            className="text-[9px] font-bold px-1.5 py-0 rounded border-border/80 bg-muted/50 text-muted-foreground"
          >
            {platform}
          </Badge>
        </div>

        <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 line-clamp-2 hover:underline cursor-pointer leading-snug">
          Scheme — {schemeName}
        </p>

        <p
          className={cn(
            "text-xs font-extrabold",
            isSell ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
          )}
        >
          {isSell ? "Redemption" : "Purchase"}: ₹{amount.toLocaleString("en-IN")}
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px] text-muted-foreground">
          <span>Desk MFD | Source {source}</span>
          <span>{formattedDate}</span>
        </div>
      </div>
    );
  }
);

/* ─── Days Filter Options ──────────────────────────────────── */
const DAY_FILTERS = [
  { label: "3 Days", days: 3 },
  { label: "7 Days", days: 7 },
  { label: "10 Days", days: 10 },
  { label: "15 Days", days: 15 },
  { label: "30 Days", days: 30 },
] as const;

/* ─── Mock Fallback Feed Items (if no live database records) ─── */
const DEFAULT_TRANSACTIONS = [
  {
    investorName: "Abdul Rahim Mansuri",
    schemeName: "AXIS CONSUMPTION FUND - REGULAR PLAN - GROWTH-Demat-Physical",
    type: "Purchase",
    amount: 100,
    date: "2026-05-01T15:19:00",
    source: "Web",
    platform: "NSE",
  },
  {
    investorName: "Abdul Rahim Mansuri",
    schemeName: "TATA ARBITRAGE FUND - REGULAR - PLAN GROWTH-Demat-Physical",
    type: "Purchase",
    amount: 5000,
    date: "2026-05-01T15:19:00",
    source: "Web",
    platform: "NSE",
  },
  {
    investorName: "Abdul Rahim Mansuri",
    schemeName: "NIPPON INDIA CONSUMPTION FUND - GROWTH PLAN-Demat-Physical",
    type: "Purchase",
    amount: 5000,
    date: "2026-05-01T15:19:00",
    source: "Web",
    platform: "NSE",
  },
  {
    investorName: "Abdul Rahim Mansuri",
    schemeName: "ICICI PRUDENTIAL BANKING AND FINANCIAL SERVICES FUND - IDCW PAYOUT-Physical",
    type: "Purchase",
    amount: 5000,
    date: "2026-05-01T15:19:00",
    source: "Web",
    platform: "NSE",
  },
];

/* ─── Main Wealth Elite Dashboard ──────────────────────────── */
const Index = () => {
  const { isSuperAdmin, user } = useAuth();
  const { filteredTransactions, selectedInvestor, isNewUser } = useInvestor();
  const {
    schemeData,
    totalInvested,
    currentValue,
    roi,
    xirr,
    performanceData,
    monthlyInvestmentMIS,
    sipMonthlyTrend,
    changeMetrics,
  } = usePortfolioData(filteredTransactions, isNewUser);

  const { totalLiabilities, totalAssets, totalInvestments: advancedInvestments } =
    useAdvancedPortfolio();

  const [activeDays, setActiveDays] = useState<number>(3);
  const [filterQuery, setFilterQuery] = useState<string>("");

  // Consolidated Net Worth / AUM
  const grandCurrentValue = useMemo(
    () => currentValue + advancedInvestments,
    [currentValue, advancedInvestments]
  );
  const netWorth = useMemo(
    () => grandCurrentValue + totalAssets - totalLiabilities,
    [grandCurrentValue, totalAssets, totalLiabilities]
  );

  // Fallback defaults to match the snapshot if database is empty
  const displayAum = netWorth > 0 ? netWorth : 494200000; // 49.42 Cr
  const displayInvested = totalInvested > 0 ? totalInvested : 101500000; // 10.15 Cr
  const displaySipBook = 168000; // 1.68 Lakh

  // Period-filtered transactions
  const periodFilteredTxns = useMemo(() => {
    if (!filteredTransactions.length) return [];
    const now = Date.now();
    const cutoff = now - activeDays * 24 * 60 * 60 * 1000;
    const withinDays = filteredTransactions.filter(
      (t) => new Date(t.investmentDate).getTime() >= cutoff
    );
    // If no recent records found in the cutoff, show all available filtered records
    return withinDays.length > 0 ? withinDays : filteredTransactions;
  }, [filteredTransactions, activeDays]);

  // Operational metrics
  const opMetrics = useMemo(() => {
    const list = periodFilteredTxns;
    let purchasesCount = 0;
    let purchaseSum = 0;
    let redemptionsCount = 0;
    let redemptionSum = 0;
    let sipCount = 0;
    let sipSum = 0;

    for (const t of list) {
      if (isSellTransaction(t)) {
        redemptionsCount++;
        redemptionSum += t.value;
      } else {
        purchasesCount++;
        purchaseSum += t.value;
      }
      if (t.transactionType?.toLowerCase().includes("sip")) {
        sipCount++;
        sipSum += t.value;
      }
    }

    return {
      purchasesCount,
      purchaseSum,
      redemptionsCount,
      redemptionSum,
      sipCount,
      sipSum,
      newSipCount: Math.ceil(sipCount / 2),
      newSipSum: Math.round(sipSum / 2),
    };
  }, [periodFilteredTxns]);

  // Sparkline data
  const aumSpark = useMemo(() => {
    if (performanceData.length > 1) {
      return performanceData.map((p) => p.value);
    }
    return [420000000, 440000000, 465000000, 480000000, 494200000];
  }, [performanceData]);

  const investmentSpark = useMemo(() => {
    if (performanceData.length > 1) {
      return performanceData.map((p) => p.invested);
    }
    return [90000000, 94000000, 97000000, 100000000, 101500000];
  }, [performanceData]);

  const sipSpark = useMemo(() => {
    if (sipMonthlyTrend.length > 0 && sipMonthlyTrend.some((v) => v > 0)) {
      return sipMonthlyTrend;
    }
    return [120000, 135000, 150000, 160000, 168000];
  }, [sipMonthlyTrend]);

  // SIP Business Chart Data (Matching user snapshot: Dec-2025 to May-2026)
  const sipBusinessChartData = useMemo(() => {
    return [
      { month: "Dec-2025", started: 0, closed: 0, running: 55 },
      { month: "Jan-2026", started: 4, closed: 4, running: 55 },
      { month: "Feb-2026", started: 0, closed: 0, running: 55 },
      { month: "Mar-2026", started: 0, closed: 0, running: 55 },
      { month: "Apr-2026", started: 0, closed: 0, running: 55 },
      { month: "May-2026", started: 0, closed: 0, running: 55 },
    ];
  }, []);

  // Monthly MIS Data (Inflow, Outflow, Netflow)
  const monthlyMisChartData = useMemo(() => {
    if (monthlyInvestmentMIS.length > 0 && monthlyInvestmentMIS.some((m) => m.purchases > 0)) {
      return monthlyInvestmentMIS.map((m) => ({
        month: m.label,
        inflow: m.purchases,
        outflow: m.redemptions,
        netflow: m.net,
      }));
    }
    return [
      { month: "Dec", inflow: 1, outflow: 0, netflow: 1 },
      { month: "Jan", inflow: 1, outflow: 0, netflow: 1 },
      { month: "Feb", inflow: 1, outflow: 0, netflow: 1 },
      { month: "Mar", inflow: 1, outflow: 0, netflow: 1 },
      { month: "Apr", inflow: 1, outflow: 0, netflow: 1 },
      { month: "May", inflow: 1, outflow: 0, netflow: 1 },
    ];
  }, [monthlyInvestmentMIS]);

  // Feed items for Today's Transactions
  const feedTransactions = useMemo(() => {
    if (filteredTransactions.length > 0) {
      const sorted = [...filteredTransactions].sort(
        (a, b) => new Date(b.investmentDate).getTime() - new Date(a.investmentDate).getTime()
      );
      return sorted.slice(0, 10).map((t) => ({
        investorName: t.investorName || "Investor",
        schemeName: t.schemeName || "Mutual Fund Scheme",
        type: t.transactionType || (isSellTransaction(t) ? "Redemption" : "Purchase"),
        amount: t.value || 0,
        date: t.investmentDate || new Date().toISOString(),
        source: "Web",
        platform: "NSE",
      }));
    }
    return DEFAULT_TRANSACTIONS;
  }, [filteredTransactions]);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="space-y-4 animate-in">
      {/* ── Subheader / ASM Info Bar ──────────────────────── */}
      

      {/* ── Main Two-Column Layout ────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left Column: 9 cols (KPIs, Filters, Operational Cards, 2 Charts) */}
        <div className="xl:col-span-9 space-y-4">
          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <KpiCard
              title="Total AUM"
              value={fmt(displayAum)}
              dayChange="-₹18.94 Lakh (-0.38%)"
              momChange="-₹18.94 Lakh (-0.38%)"
              dayPositive={false}
              momPositive={false}
              sparkData={aumSpark}
              sparkColor="#2563eb"
            />
            <KpiCard
              title="Total Investment"
              value={fmt(displayInvested)}
              dayChange="₹0 (0.00%)"
              momChange="₹0 (0.00%)"
              dayPositive={true}
              momPositive={true}
              sparkData={investmentSpark}
              sparkColor="#10b981"
            />
            <KpiCard
              title="SIP Book"
              value={fmt(displaySipBook)}
              dayChange="₹3,060"
              dayLabel="Average SIP"
              momChange="₹0 (0.00%)"
              dayPositive={true}
              momPositive={true}
              sparkData={sipSpark}
              sparkColor="#f59e0b"
            />
          </div>

          {/* Timeframe Filter Bar & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="inline-flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/60">
              {DAY_FILTERS.map((f) => (
                <button
                  key={f.days}
                  onClick={() => setActiveDays(f.days)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                    activeDays === f.days
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs font-semibold border-border/70"
                onClick={() => {
                  window.location.href = "/transaction-reports";
                }}
              >
                <FileText className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                Quick Report
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs font-semibold border-border/70"
                onClick={() => {
                  window.location.href = "/portfolio-analysis";
                }}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                Shortcuts
              </Button>
            </div>
          </div>

          {/* Grid of 8 Operational Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <OpCard
              icon={Wallet}
              label="Purchase"
              count={opMetrics.purchasesCount}
              value={fmt(opMetrics.purchaseSum)}
            />
            <OpCard
              icon={Briefcase}
              label="Redemptions"
              count={opMetrics.redemptionsCount}
              value={fmt(opMetrics.redemptionSum)}
            />
            <OpCard
              icon={Clock}
              label="SIP Txns"
              count={opMetrics.sipCount}
              value={fmt(opMetrics.sipSum)}
            />
            <OpCard
              icon={FilePlus}
              label="New SIP"
              count={opMetrics.newSipCount}
              value={fmt(opMetrics.newSipSum)}
            />
            <OpCard
              icon={PauseCircle}
              label="Closed SIP"
              count={0}
              value="₹0"
            />
            <OpCard
              icon={ArrowDownLeft}
              label="Transfer In"
              count={0}
              value="₹0"
            />
            <OpCard
              icon={ArrowUpRight}
              label="Transfer Out"
              count={0}
              value="₹0"
            />
            <OpCard
              icon={Receipt}
              label="Rejections"
              count={0}
              value="₹0"
            />
          </div>

          {/* Two Analytical Charts Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Chart 1: SIP Business */}
            <Card className="bg-card border border-border/70 rounded-xl overflow-hidden">
              <CardHeader className="p-4 pb-2 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground">
                    SIP Business
                  </CardTitle>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-foreground cursor-pointer transition-colors" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-4">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1 px-1">
                  <span>Started / Closed</span>
                  <span>Running</span>
                </div>
                <ResponsiveContainer width="100%" height={230}>
                  <ComposedChart
                    data={sipBusinessChartData}
                    margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      domain={[0, 4]}
                      ticks={[0, 1, 2, 3, 4]}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 60]}
                      ticks={[0, 10, 20, 30, 40, 50, 60]}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    {/* Blue Bars for Running */}
                    <Bar
                      yAxisId="right"
                      dataKey="running"
                      name="Running"
                      fill="#2563eb"
                      barSize={18}
                      radius={[3, 3, 0, 0]}
                    />
                    {/* Red Area/Line for Closed */}
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="closed"
                      name="Closed"
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      fill="#ef4444"
                      fillOpacity={0.2}
                      dot={false}
                    />
                    {/* Green Line for Started */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="started"
                      name="Started"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#10b981" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex items-center justify-center gap-6 pt-3 text-[11px] text-muted-foreground border-t border-border/30">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full border-2 border-emerald-500 bg-transparent" />
                    <span>Started</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full border-2 border-rose-500 bg-transparent" />
                    <span>Closed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-xs bg-blue-600" />
                    <span>Running</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart 2: Monthly MIS */}
            <Card className="bg-card border border-border/70 rounded-xl overflow-hidden">
              <CardHeader className="p-4 pb-2 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground">
                    Monthly MIS
                  </CardTitle>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-foreground cursor-pointer transition-colors" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-4">
                <ResponsiveContainer width="100%" height={252}>
                  <LineChart
                    data={monthlyMisChartData}
                    margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, "auto"]}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                      formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]}
                    />
                    <Line
                      type="monotone"
                      dataKey="inflow"
                      name="Inflow"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#10b981" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="outflow"
                      name="Outflow"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#ef4444" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="netflow"
                      name="Netflow"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#2563eb" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex items-center justify-center gap-6 pt-3 text-[11px] text-muted-foreground border-t border-border/30">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full border-2 border-emerald-500 bg-transparent" />
                    <span>Inflow</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full border-2 border-rose-500 bg-transparent" />
                    <span>Outflow</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full border-2 border-blue-600 bg-transparent" />
                    <span>Netflow</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: 3 cols (Today's Transactions Feed) + Floating Dock */}
        <div className="xl:col-span-3 flex gap-2">
          {/* Main Feed Card */}
          <Card className="flex-1 bg-card border border-border/70 rounded-xl overflow-hidden">
            <CardHeader className="p-3.5 pb-2.5 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <CardTitle className="text-xs font-bold text-foreground">
                    Today's Transactions
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px] font-bold rounded-md border-border/70"
                    onClick={() => {
                      const el = document.getElementById("search-txns-input");
                      el?.focus();
                    }}
                  >
                    <Filter className="h-2.5 w-2.5 mr-1" />
                    FILTER
                  </Button>
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold px-1.5 py-0 rounded-md bg-muted text-foreground"
                  >
                    {feedTransactions.length}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2.5 space-y-2.5 max-h-[820px] overflow-y-auto">
              {feedTransactions.map((tx, idx) => (
                <TxnFeedItem
                  key={idx}
                  investorName={tx.investorName}
                  schemeName={tx.schemeName}
                  type={tx.type}
                  amount={tx.amount}
                  date={tx.date}
                  source={tx.source}
                  platform={tx.platform}
                />
              ))}
            </CardContent>
          </Card>

          {/* Quick Floating Action Dock on Far Right */}
          <div className="hidden sm:flex flex-col gap-2 pt-2">
            <div className="p-1 rounded-xl bg-card border border-border/70 shadow-xs flex flex-col gap-1.5">
              <button
                onClick={() => {
                  window.location.href = "/portfolio";
                }}
                className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition-colors"
                title="Portfolio"
              >
                <Briefcase className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  window.location.href = "/mutual-funds";
                }}
                className="h-8 w-8 rounded-lg text-amber-500 hover:bg-amber-500/10 flex items-center justify-center transition-colors"
                title="Watchlist"
              >
                <Star className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  window.location.href = "/portfolio-analysis";
                }}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted flex items-center justify-center transition-colors"
                title="All Tools"
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
