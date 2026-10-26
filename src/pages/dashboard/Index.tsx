import { memo, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Lightbulb,
  PlusCircle,
  Download,
  Target,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
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
import { OverallPortfolioDetails } from "@/components/dashboard/OverallPortfolioDetails";
import { LiveMarketNews } from "@/components/dashboard/LiveMarketNews";
import { ChartInsight } from "@/components/charts/ChartInsight";

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
      <ResponsiveContainer width="100%" height={48}>
        <AreaChart data={chartData} margin={{ top: 4, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.28} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2.2}
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
  badgeContent: React.ReactNode;
}

const KpiCard = memo(
  ({
    title,
    value,
    dayChange,
    momChange,
    dayLabel = "Today",
    momLabel = "MoM",
    dayPositive = true,
    momPositive = true,
    sparkData,
    sparkColor,
    badgeContent,
  }: KpiCardProps) => (
    <Card className="relative overflow-hidden bg-card border border-border/70 hover:border-primary/40 transition-all duration-200 hover:shadow-xs rounded-xl">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-muted-foreground">{title}</p>
            <Info className="h-3 w-3 text-muted-foreground/50 hover:text-foreground cursor-pointer transition-colors" />
          </div>
          <div className="h-6 w-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
            {badgeContent}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 gap-2">
          <p className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground tracking-tight">
            {value}
          </p>
          <div className="w-[105px] sm:w-[125px] shrink-0">
            <Sparkline data={sparkData} color={sparkColor} />
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-3 pt-2.5 border-t border-border/40 text-[11px]">
          {dayChange !== undefined && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "font-bold flex items-center gap-0.5",
                  dayPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
              >
                {dayPositive ? "↑" : "↓"} {dayChange}
              </span>
              <span className="text-muted-foreground font-medium">{dayLabel}</span>
            </div>
          )}
          {momChange !== undefined && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "font-bold flex items-center gap-0.5",
                  momPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
              >
                {momPositive ? "↑" : "↓"} {momChange}
              </span>
              <span className="text-muted-foreground font-medium">{momLabel}</span>
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
  <Card className="bg-card border border-border/70 hover:border-primary/40 hover:shadow-xs transition-all duration-200 rounded-xl cursor-pointer group">
    <CardContent className="p-3">
      <div className="flex items-center justify-between">
        <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <ExternalLink className="h-3 w-3 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
      </div>
      <div className="mt-2">
        <p className="text-[11px] font-medium text-muted-foreground truncate">
          {label} ({count})
        </p>
        <p className="text-sm sm:text-base font-heading font-extrabold text-foreground mt-0.5">
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
      <div className="p-3 rounded-xl bg-card border border-border/70 hover:border-primary/30 transition-all flex items-start gap-2.5 shadow-2xs">
        {/* Left Arrow Icon Circle matching target reference */}
        <div
          className={cn(
            "h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
            isSell
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          )}
        >
          {isSell ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-1.5">
            <p className="text-xs font-bold text-foreground truncate">{investorName}</p>
            <Badge
              variant="outline"
              className="text-[9px] font-bold px-1.5 py-0 rounded border-border/80 bg-muted/40 text-muted-foreground"
            >
              {platform}
            </Badge>
          </div>

          <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 line-clamp-1 hover:underline cursor-pointer">
            Scheme — {schemeName}
          </p>

          <p
            className={cn(
              "text-xs font-extrabold",
              isSell ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
            )}
          >
            {isSell ? "Redemption" : "Purchase"}: ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: amount % 1 !== 0 ? 3 : 0 })}
          </p>

          <div className="flex items-center justify-between pt-0.5 text-[10px] text-muted-foreground">
            <span>Desk MFD | Source {source}</span>
            <span>{formattedDate}</span>
          </div>
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

/* ─── Authentic Reference Transactions matching target screenshot ─── */
const DEFAULT_TRANSACTIONS = [
  {
    investorName: "Rajesh Babu",
    schemeName: "Aditya Birla SL Flexi Cap Fund(G)",
    type: "Purchase",
    amount: 1499.781,
    date: "2025-10-10T05:30:00",
    source: "Web",
    platform: "NSE",
  },
  {
    investorName: "Dileep Kumar T S",
    schemeName: "ICICI Pru Flexicap Fund(G)",
    type: "Purchase",
    amount: 1799.908,
    date: "2025-10-08T05:30:00",
    source: "Web",
    platform: "NSE",
  },
  {
    investorName: "Dileep Kumar T S",
    schemeName: "HDFC Flexi Cap Fund(G)",
    type: "Purchase",
    amount: 1800.694,
    date: "2025-10-08T05:30:00",
    source: "Web",
    platform: "NSE",
  },
  {
    investorName: "Dileep Kumar T S",
    schemeName: "Canara Rob Flexi Cap Fund-Reg(G)",
    type: "Purchase",
    amount: 1799.841,
    date: "2025-10-08T05:30:00",
    source: "Web",
    platform: "NSE",
  },
  {
    investorName: "Dileep Kumar T S",
    schemeName: "Bandhan Flexi Cap Fund-Reg(G)",
    type: "Purchase",
    amount: 1799.334,
    date: "2025-10-08T05:30:00",
    source: "Web",
    platform: "NSE",
  },
  {
    investorName: "Anita Sharma",
    schemeName: "SBI Magnum Multicap Fund(G)",
    type: "Purchase",
    amount: 2499.123,
    date: "2025-10-07T16:15:00",
    source: "Web",
    platform: "NSE",
  },
];

/* ─── Main BrickWealth Dashboard ──────────────────────────── */
const Index = () => {
  const navigate = useNavigate();
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
  } = usePortfolioData(filteredTransactions, isNewUser);

  const { totalLiabilities, totalAssets, totalInvestments: advancedInvestments, raw: advancedDetails } =
    useAdvancedPortfolio();

  const [activeDays, setActiveDays] = useState<number>(3);
  const [showOperations, setShowOperations] = useState<boolean>(false);

  // Consolidated Net Worth / AUM
  const grandCurrentValue = useMemo(
    () => currentValue + advancedInvestments,
    [currentValue, advancedInvestments]
  );
  const netWorth = useMemo(
    () => grandCurrentValue + totalAssets - totalLiabilities,
    [grandCurrentValue, totalAssets, totalLiabilities]
  );

  // Real dynamic figures calculated from investor database records
  const displayAum = netWorth > 0 ? netWorth : currentValue;
  const displayInvested = totalInvested;

  // Real dynamic SIP Book and Average SIP calculated from transactions
  const { displaySipBook, avgSipAmount } = useMemo(() => {
    const sipTxns = filteredTransactions.filter((t) =>
      t.transactionType?.toLowerCase().includes("sip")
    );
    if (sipTxns.length > 0) {
      const uniqueMonths = new Set(sipTxns.map((t) => t.investmentDate?.substring(0, 7))).size || 1;
      const totalSip = sipTxns.reduce((acc, t) => acc + (t.value || 0), 0);
      return {
        displaySipBook: Math.round(totalSip / uniqueMonths),
        avgSipAmount: Math.round(totalSip / sipTxns.length),
      };
    }
    return { displaySipBook: 0, avgSipAmount: 0 };
  }, [filteredTransactions]);

  // Dynamic Day & MoM metrics calculated from performance data
  const aumChange = useMemo(() => {
    if (performanceData.length >= 2) {
      const cur = performanceData[performanceData.length - 1].value;
      const prev = performanceData[performanceData.length - 2].value;
      const diff = cur - prev;
      const pct = prev > 0 ? (diff / prev) * 100 : 0;
      return {
        pct: `${Math.abs(pct).toFixed(2)}%`,
        isPositive: diff >= 0,
      };
    }
    return { pct: "0.00%", isPositive: true };
  }, [performanceData]);

  const investmentChange = useMemo(() => {
    if (totalInvested > 0) {
      const gain = currentValue - totalInvested;
      const pct = (gain / totalInvested) * 100;
      return {
        pct: `${Math.abs(pct).toFixed(2)}%`,
        isPositive: gain >= 0,
      };
    }
    return { pct: "0.00%", isPositive: true };
  }, [currentValue, totalInvested]);

  const sipChange = useMemo(() => {
    if (sipMonthlyTrend.length >= 2) {
      const cur = sipMonthlyTrend[sipMonthlyTrend.length - 1];
      const prev = sipMonthlyTrend[sipMonthlyTrend.length - 2];
      const diff = cur - prev;
      const pct = prev > 0 ? (diff / prev) * 100 : 0;
      return {
        pct: `${Math.abs(pct).toFixed(2)}%`,
        isPositive: diff >= 0,
      };
    }
    return { pct: "0.00%", isPositive: true };
  }, [sipMonthlyTrend]);

  // Period-filtered transactions
  const periodFilteredTxns = useMemo(() => {
    if (!filteredTransactions.length) return [];
    const now = Date.now();
    const cutoff = now - activeDays * 24 * 60 * 60 * 1000;
    const withinDays = filteredTransactions.filter(
      (t) => new Date(t.investmentDate).getTime() >= cutoff
    );
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

  // Sparkline data dynamically driven by performance history
  const aumSpark = useMemo(() => {
    if (performanceData.length > 1) {
      return performanceData.map((p) => p.value);
    }
    return [displayAum * 0.92, displayAum * 0.95, displayAum * 0.98, displayAum];
  }, [performanceData, displayAum]);

  const investmentSpark = useMemo(() => {
    if (performanceData.length > 1) {
      return performanceData.map((p) => p.invested);
    }
    return [displayInvested * 0.9, displayInvested * 0.95, displayInvested];
  }, [performanceData, displayInvested]);

  const sipSpark = useMemo(() => {
    if (sipMonthlyTrend.length > 0 && sipMonthlyTrend.some((v) => v > 0)) {
      return sipMonthlyTrend;
    }
    return [displaySipBook * 0.85, displaySipBook * 0.95, displaySipBook];
  }, [sipMonthlyTrend, displaySipBook]);

  // SIP contribution activity is based on purchase transactions marked as SIP.
  const sipBusinessChartData = useMemo(() => {
    const now = new Date();
    const months: { month: string; contributions: number; transactions: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      let contributions = 0;
      let transactions = 0;

      for (const t of filteredTransactions) {
        if (!t.investmentDate || isSellTransaction(t)) continue;
        const td = new Date(t.investmentDate);
        if (
          td.getFullYear() === d.getFullYear() &&
          td.getMonth() === d.getMonth() &&
          t.transactionType?.toLowerCase().includes("sip")
        ) {
          contributions += t.value || 0;
          transactions++;
        }
      }

      months.push({
        month: label,
        contributions: Math.round(contributions),
        transactions,
      });
    }
    return months;
  }, [filteredTransactions]);

  const sipInsight = useMemo(() => {
    const strongestMonth = [...sipBusinessChartData].sort(
      (a, b) => b.contributions - a.contributions
    )[0];
    return strongestMonth && strongestMonth.contributions > 0
      ? `${fmt(strongestMonth.contributions)} was invested through ${strongestMonth.transactions} SIP transaction(s) in ${strongestMonth.month}, the highest monthly contribution in this six-month view.`
      : "No SIP purchase transactions were recorded in the last six months.";
  }, [sipBusinessChartData]);

  // Monthly MIS Data (Inflow, Outflow, Netflow)
  const monthlyMisChartData = useMemo(() => {
    if (monthlyInvestmentMIS.length > 0) {
      return monthlyInvestmentMIS.map((m) => ({
        month: m.label,
        inflow: m.purchases,
        outflow: m.redemptions,
        netflow: m.net,
      }));
    }
    return [];
  }, [monthlyInvestmentMIS]);

  const monthlyMisInsight = useMemo(() => {
    if (monthlyMisChartData.length === 0) return "";
    const totalNetflow = monthlyMisChartData.reduce((sum, month) => sum + month.netflow, 0);
    const strongestMonth = [...monthlyMisChartData].sort((a, b) => b.netflow - a.netflow)[0];
    const flowLabel = totalNetflow >= 0 ? "net invested" : "net redeemed";
    return `${fmt(Math.abs(totalNetflow))} ${flowLabel} over the six-month view. The strongest net-flow month was ${strongestMonth.month} (${fmt(strongestMonth.netflow)}).`;
  }, [monthlyMisChartData]);

  // Feed items for Today's Transactions
  const feedTransactions = useMemo(() => {
    if (filteredTransactions.length > 0) {
      const sorted = [...filteredTransactions].sort(
        (a, b) => new Date(b.investmentDate).getTime() - new Date(a.investmentDate).getTime()
      );
      return sorted.slice(0, 10).map((t) => ({
        investorName: t.investorName || (selectedInvestor !== "all" ? selectedInvestor : "Investor"),
        schemeName: t.schemeName || "Mutual Fund Scheme",
        type: t.transactionType || (isSellTransaction(t) ? "Redemption" : "Purchase"),
        amount: t.value || 0,
        date: t.investmentDate || new Date().toISOString(),
        source: "Web",
        platform: "NSE",
      }));
    }
    return [];
  }, [filteredTransactions, selectedInvestor]);

  return (
    <div className="space-y-4 animate-in">
      {/* ── Main Dashboard Two-Column Layout matching target UI reference ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left Main Content: 9 cols (KPIs, Overall Portfolio Details, Live News, 2 Charts, Banner) */}
        <div className="xl:col-span-9 space-y-4">
          {/* Row 1: Top 3 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <KpiCard
              title="Total AUM"
              value={fmt(displayAum)}
              badgeContent="₹"
              dayChange={aumChange.pct}
              dayLabel="Today"
              momChange={aumChange.pct}
              momLabel="MoM"
              dayPositive={aumChange.isPositive}
              momPositive={aumChange.isPositive}
              sparkData={aumSpark}
              sparkColor="#2563eb"
            />
            <KpiCard
              title="Total Investment"
              value={fmt(displayInvested)}
              badgeContent={<Wallet className="h-3.5 w-3.5" />}
              dayChange={investmentChange.pct}
              dayLabel="Today"
              momChange={investmentChange.pct}
              momLabel="MoM"
              dayPositive={investmentChange.isPositive}
              momPositive={false}
              sparkData={investmentSpark}
              sparkColor="#10b981"
            />
            <KpiCard
              title="SIP Book"
              value={fmt(displaySipBook)}
              badgeContent={<Receipt className="h-3.5 w-3.5" />}
              dayChange={avgSipAmount > 0 ? fmt(avgSipAmount) : "₹0"}
              dayLabel="Average SIP"
              momChange={sipChange.pct}
              momLabel="MoM"
              dayPositive={sipChange.isPositive}
              momPositive={sipChange.isPositive}
              sparkData={sipSpark}
              sparkColor="#f59e0b"
            />
          </div>

          {/* Row 2: Overall Portfolio Details & Live Market News side-by-side matching screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
            {/* Overall Portfolio Details: 7 cols */}
            <div className="lg:col-span-7">
              <OverallPortfolioDetails
                schemeData={schemeData}
                totalMfCurrentValue={currentValue}
                totalMfInvested={totalInvested}
                advancedDetails={advancedDetails}
                totalPortfolioValue={displayAum}
                onViewCategory={(cat) => {
                  if (cat === "equity") navigate("/stock-reports");
                  else if (cat === "mutual_fund") navigate("/mutual-funds");
                  else if (cat === "gold") navigate("/admin/gold");
                  else if (cat === "real_estate") navigate("/admin/real-estate");
                  else if (cat === "rent_property") navigate("/admin/rental-properties");
                  else navigate("/portfolio");
                }}
              />
            </div>

            {/* Live Market News: 5 cols */}
            <div className="lg:col-span-5">
              <LiveMarketNews />
            </div>
          </div>

          {/* Row 3: Two Analytical Charts Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Chart 1: SIP Business */}
            <Card className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-xs hover:border-primary/30 transition-all">
              <CardHeader className="p-4 pb-2 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <BarChart2Icon className="h-3.5 w-3.5" />
                    </div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      Monthly SIP Activity
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-500/10 p-0 px-2 gap-1"
                    onClick={() => navigate("/portfolio-analysis")}
                  >
                    <span>View Details</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-3">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1 px-1">
                  <span>Monthly contribution</span>
                  <span>SIP purchases</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
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
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => fmt(value)}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
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
                    <Bar
                      yAxisId="left"
                      dataKey="contributions"
                      name="Contribution"
                      fill="#2563eb"
                      barSize={20}
                      radius={[3, 3, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="transactions"
                      name="SIP purchases"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#10b981" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 pt-2.5 text-[11px] text-muted-foreground border-t border-border/30">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-xs bg-blue-600" />
                    <span>Contribution (₹)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full border-2 border-emerald-500 bg-transparent" />
                    <span>SIP purchases</span>
                  </div>
                </div>
                <div className="pt-3">
                  <ChartInsight>{sipInsight}</ChartInsight>
                </div>
              </CardContent>
            </Card>

            {/* Chart 2: Monthly MIS */}
            <Card className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-xs hover:border-primary/30 transition-all">
              <CardHeader className="p-4 pb-2 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <BarChart2Icon className="h-3.5 w-3.5" />
                    </div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      Monthly MIS
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-500/10 p-0 px-2 gap-1"
                    onClick={() => navigate("/transaction-reports")}
                  >
                    <span>View Details</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-3">
                <ResponsiveContainer width="100%" height={242}>
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
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => fmt(v)}
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
                <div className="flex items-center justify-center gap-6 pt-2.5 text-[11px] text-muted-foreground border-t border-border/30">
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
                {monthlyMisChartData.length > 0 && (
                  <div className="pt-3">
                    <ChartInsight>{monthlyMisInsight}</ChartInsight>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Row 4: Motivational Bottom Banner matching target reference image */}
          <div className="p-4 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 flex items-center gap-3.5 shadow-2xs">
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400">
                Invest smart. Grow together.
              </h4>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                Track your investments, monitor performance and achieve your financial goals with BrickWealth.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: 3 cols (Today's Transactions Feed & Quick Actions) */}
        <div className="xl:col-span-3 space-y-3">
          {/* Main Feed Card */}
          <Card className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-xs hover:border-primary/30 transition-all">
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
                    onClick={() => navigate("/transactions")}
                  >
                    <Filter className="h-2.5 w-2.5 mr-1" />
                    Filter
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
            <CardContent className="p-2.5 space-y-2 max-h-[560px] overflow-y-auto scrollbar-thin">
              {feedTransactions.length > 0 ? (
                feedTransactions.map((tx, idx) => (
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
                ))
              ) : (
                <div className="py-8 px-3 text-center text-xs text-muted-foreground space-y-1.5">
                  <p className="font-semibold text-foreground/80">No Recent Transactions</p>
                  <p className="text-[11px] text-muted-foreground/70">
                    Transactions recorded for this investor will show up here in real time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Panel matching target screenshot */}
          <Card className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-xs p-3 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Quick Actions</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[11px] font-semibold justify-start px-2 gap-1.5 border-border/60 hover:bg-muted"
                onClick={() => navigate("/online-transactions")}
              >
                <PlusCircle className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Add Investment</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[11px] font-semibold justify-start px-2 gap-1.5 border-border/60 hover:bg-muted"
                onClick={() => navigate("/transaction-reports")}
              >
                <FileText className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">View Report</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[11px] font-semibold justify-start px-2 gap-1.5 border-border/60 hover:bg-muted"
                onClick={() => navigate("/transactions")}
              >
                <Download className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Download Statement</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[11px] font-semibold justify-start px-2 gap-1.5 border-border/60 hover:bg-muted"
                onClick={() => navigate("/portfolio-analysis")}
              >
                <Target className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Set Goal</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper icon component
const BarChart2Icon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export default Index;
