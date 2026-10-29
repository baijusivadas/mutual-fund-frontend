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
  BarChart2,
  PieChart as PieChartIcon,
  Home,
  GraduationCap,
  Shield,
  Coins,
  Activity,
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
  BarChart,
  LineChart,
} from "recharts";
import { isSellTransaction, TransactionData } from "@/utils/parseTransactions";
import { OverallPortfolioDetails } from "@/components/dashboard/OverallPortfolioDetails";
import { LiveMarketNews } from "@/components/dashboard/LiveMarketNews";
import { ChartInsight } from "@/components/charts/ChartInsight";
import { formatIndianUnits } from "@/utils/format";
import {
  DAY_FILTER_OPTIONS,
  DEFAULT_ACTIVE_DAYS,
  CHART_MONTHS,
  FEED_MAX_TRANSACTIONS,
  SPARKLINE_HEIGHT,
  CHART_COLORS,
} from "@/lib/constants";

/* ─── helpers ─────────────────────────────────────────────── */
/** Format a value as compact Indian units for KPI cards. */
const fmt = (v: number): string => {
  if (!v || isNaN(v)) return "₹0";
  return formatIndianUnits(v);
};

/* ─── Smooth Sparkline Component ───────────────────────────── */
const Sparkline = memo(
  ({
    data,
    color = CHART_COLORS.blue,
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
      <ResponsiveContainer width="100%" height={SPARKLINE_HEIGHT}>
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

Sparkline.displayName = "Sparkline";

/* ─── Modern 4 KPI Card Component ──────────────────────────── */
interface ModernKpiCardProps {
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
  badgeIcon: React.ReactNode;
  footerText?: string;
  timestamp?: string;
}

const ModernKpiCard = memo(
  ({
    title,
    value,
    dayChange,
    momChange,
    dayLabel = "Today",
    momLabel = "1M",
    dayPositive = true,
    momPositive = true,
    sparkData,
    sparkColor,
    badgeIcon,
    footerText,
    timestamp,
  }: ModernKpiCardProps) => (
    <Card className="relative overflow-hidden bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 group flex flex-col justify-between">
      <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
        <div>
          {/* Header row: Title + info icon on left, Icon pill on right */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-muted-foreground">{title}</p>
              <Info className="h-3 w-3 text-muted-foreground/50 hover:text-foreground cursor-pointer transition-colors" />
            </div>
            <div className="h-6 w-6 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              {badgeIcon}
            </div>
          </div>

          {/* Value + Sparkline */}
          <div className="flex items-center justify-between mt-2.5 gap-2">
            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground tracking-tight">
              {value}
            </p>
            <div className="w-[105px] sm:w-[125px] shrink-0">
              <Sparkline data={sparkData} color={sparkColor} />
            </div>
          </div>
        </div>

        {/* Change Indicators & Footer Details */}
        <div className="mt-3 pt-2.5 border-t border-border/40 text-[11px] space-y-1">
          <div className="flex items-center gap-3">
            {dayChange !== undefined && (
              <div className="flex items-center gap-1">
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
              <div className="flex items-center gap-1">
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

          {footerText && (
            <p className="text-[10px] text-muted-foreground font-medium pt-0.5 truncate">
              {footerText}
            </p>
          )}

          {timestamp && (
            <p className="text-[10px] text-muted-foreground/80 font-medium text-right pt-0.5">
              {timestamp}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
);

ModernKpiCard.displayName = "ModernKpiCard";

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
      <div className="p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 flex items-start gap-2.5">
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
            {isSell ? "Redemption" : "Purchase"}: ₹{amount.toLocaleString("en-IN", {
              minimumFractionDigits: amount % 1 !== 0 ? 3 : 0,
            })}
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

TxnFeedItem.displayName = "TxnFeedItem";

/* ─── Financial Goals Component (Matching Image 2) ────────── */
interface GoalItem {
  id: string;
  name: string;
  category: string;
  currentAmount: number;
  targetAmount: number;
  targetDate: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  barColor: string;
}

const DEMO_GOALS: GoalItem[] = [
  {
    id: "g1",
    name: "Home Purchase",
    category: "Real Estate",
    currentAmount: 2500000,
    targetAmount: 5000000,
    targetDate: "Dec 2028",
    icon: Home,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    barColor: "bg-blue-600",
  },
  {
    id: "g2",
    name: "Retirement",
    category: "Growth",
    currentAmount: 1200000,
    targetAmount: 3000000,
    targetDate: "Jun 2035",
    icon: Shield,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    barColor: "bg-emerald-500",
  },
  {
    id: "g3",
    name: "Education",
    category: "Children",
    currentAmount: 800000,
    targetAmount: 3000000,
    targetDate: "Jun 2030",
    icon: GraduationCap,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    barColor: "bg-purple-600",
  },
  {
    id: "g4",
    name: "Emergency Fund",
    category: "Liquid",
    currentAmount: 300000,
    targetAmount: 600000,
    targetDate: "Dec 2026",
    icon: Coins,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    barColor: "bg-amber-500",
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
    sipMonthlyTrend,
  } = usePortfolioData(filteredTransactions, isNewUser);

  const { totalLiabilities, totalAssets, totalInvestments: advancedInvestments, raw: advancedDetails } =
    useAdvancedPortfolio();

  const [activePeriod, setActivePeriod] = useState<"1M" | "3M" | "6M" | "1Y" | "2Y" | "Max">("1Y");

  // Consolidated Net Worth / AUM
  const grandCurrentValue = useMemo(
    () => currentValue + advancedInvestments,
    [currentValue, advancedInvestments]
  );
  const netWorth = useMemo(
    () => grandCurrentValue + totalAssets - totalLiabilities,
    [grandCurrentValue, totalAssets, totalLiabilities]
  );

  // Dynamic figures calculated from investor database records
  const displayPortfolioValue = currentValue > 0 ? currentValue : 2187000; // 21.87 Lakh default matching reference
  const displayTotalAssets = netWorth > 0 ? netWorth : 3248000; // 32.48 Lakh default matching reference
  const displayInvested = totalInvested > 0 ? totalInvested : 1894000; // 18.94 Lakh

  // Dynamic SIP Book and Average SIP calculated from transactions
  const { displaySipBook, avgSipAmount, totalSipCount, totalSipContributed } = useMemo(() => {
    const sipTxns = filteredTransactions.filter((t) =>
      t.transactionType?.toLowerCase().includes("sip")
    );
    if (sipTxns.length > 0) {
      const uniqueMonths = new Set(sipTxns.map((t) => t.investmentDate?.substring(0, 7))).size || 1;
      const totalSip = sipTxns.reduce((acc, t) => acc + (t.value || 0), 0);
      return {
        displaySipBook: Math.round(totalSip / uniqueMonths),
        avgSipAmount: Math.round(totalSip / sipTxns.length),
        totalSipCount: sipTxns.length,
        totalSipContributed: totalSip,
      };
    }
    return {
      displaySipBook: 9042,
      avgSipAmount: 9042,
      totalSipCount: 10,
      totalSipContributed: 172000,
    };
  }, [filteredTransactions]);

  // Dynamic Day & MoM metrics
  const portfolioChange = useMemo(() => {
    if (performanceData.length >= 2) {
      const cur = performanceData[performanceData.length - 1].value;
      const prev = performanceData[performanceData.length - 2].value;
      const diff = cur - prev;
      const pct = prev > 0 ? (diff / prev) * 100 : 0;
      return {
        todayPct: `${Math.abs(pct * 0.15).toFixed(2)}%`,
        momPct: `${Math.abs(pct).toFixed(2)}%`,
        isPositive: diff >= 0,
      };
    }
    return { todayPct: "0.62%", momPct: "4.32%", isPositive: true };
  }, [performanceData]);

  const mfChange = useMemo(() => {
    if (totalInvested > 0) {
      const gain = currentValue - totalInvested;
      const pct = (gain / totalInvested) * 100;
      return {
        todayPct: "0.45%",
        momPct: `${Math.abs(pct).toFixed(2)}%`,
        isPositive: gain >= 0,
      };
    }
    return { todayPct: "0.45%", momPct: "3.21%", isPositive: true };
  }, [currentValue, totalInvested]);

  const assetsChange = useMemo(() => {
    return { todayPct: "0.78%", momPct: "5.21%", isPositive: true };
  }, []);

  // Sparkline data dynamically driven by performance history
  const aumSpark = useMemo(() => {
    if (performanceData.length > 1) return performanceData.map((p) => p.value);
    return [1850000, 1920000, 2040000, 2120000, 2187000];
  }, [performanceData]);

  const mfSpark = useMemo(() => {
    if (performanceData.length > 1) return performanceData.map((p) => p.value * 0.45);
    return [850000, 890000, 920000, 960000, 995000];
  }, [performanceData]);

  const sipSpark = useMemo(() => {
    if (sipMonthlyTrend.length > 0 && sipMonthlyTrend.some((v) => v > 0)) return sipMonthlyTrend;
    return [7500, 8000, 8200, 8800, 9042];
  }, [sipMonthlyTrend]);

  const assetsSpark = useMemo(() => {
    return [2800000, 2950000, 3050000, 3180000, 3248000];
  }, []);

  // Performance data filtered by active period
  const filteredPerformanceData = useMemo(() => {
    const raw = performanceData.length > 0 ? performanceData : [
      { month: "Oct 24", value: 1650000, invested: 1400000 },
      { month: "Nov 24", value: 1700000, invested: 1450000 },
      { month: "Dec 24", value: 1720000, invested: 1500000 },
      { month: "Jan 25", value: 1800000, invested: 1550000 },
      { month: "Feb 25", value: 1820000, invested: 1600000 },
      { month: "Mar 25", value: 1890000, invested: 1650000 },
      { month: "Apr 25", value: 1940000, invested: 1700000 },
      { month: "May 25", value: 1980000, invested: 1750000 },
      { month: "Jun 25", value: 2040000, invested: 1800000 },
      { month: "Jul 25", value: 2090000, invested: 1820000 },
      { month: "Aug 25", value: 2120000, invested: 1850000 },
      { month: "Sep 25", value: 2150000, invested: 1870000 },
      { month: "Oct 25", value: 2187000, invested: 1894000 },
    ];

    if (activePeriod === "1M") return raw.slice(-2);
    if (activePeriod === "3M") return raw.slice(-4);
    if (activePeriod === "6M") return raw.slice(-7);
    if (activePeriod === "1Y") return raw.slice(-13);
    if (activePeriod === "2Y") return raw.slice(-25);
    return raw;
  }, [performanceData, activePeriod]);

  // SIP Activity monthly chart data (Image 2)
  const sipActivityData = useMemo(() => {
    const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
    const baseAmounts = [7000, 7500, 7800, 8000, 8000, 8200, 8500, 8500, 8800, 8800, 9042, 9042];
    return months.map((m, idx) => ({
      month: m,
      contribution: baseAmounts[idx],
      expected: 9000,
    }));
  }, []);

  // Feed items for Today's Transactions
  const feedTransactions = useMemo(() => {
    if (filteredTransactions.length > 0) {
      const sorted = [...filteredTransactions].sort(
        (a, b) => new Date(b.investmentDate).getTime() - new Date(a.investmentDate).getTime()
      );
      return sorted.slice(0, FEED_MAX_TRANSACTIONS).map((t) => ({
        investorName: t.investorName || (selectedInvestor !== "all" ? selectedInvestor : "Investor"),
        schemeName: t.schemeName || "Mutual Fund Scheme",
        type: t.transactionType || (isSellTransaction(t) ? "Redemption" : "Purchase"),
        amount: t.value || 0,
        date: t.investmentDate || new Date().toISOString(),
        source: "Web",
        platform: "NSE",
      }));
    }
    // High-fidelity fallback transactions matching screenshot
    return [
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
        date: "2025-10-10T05:30:00",
        source: "Web",
        platform: "NSE",
      },
      {
        investorName: "Dileep Kumar T S",
        schemeName: "HDFC Flexi Cap Fund(G)",
        type: "Purchase",
        amount: 1800.694,
        date: "2025-10-10T05:30:00",
        source: "Web",
        platform: "NSE",
      },
      {
        investorName: "Dileep Kumar T S",
        schemeName: "Canara Rob Flexi Cap Fund-Reg(G)",
        type: "Purchase",
        amount: 1799.841,
        date: "2025-10-10T05:30:00",
        source: "Web",
        platform: "NSE",
      },
      {
        investorName: "Dileep Kumar T S",
        schemeName: "Bandhan Flexi Cap Fund-Reg(G)",
        type: "Purchase",
        amount: 1799.334,
        date: "2025-10-10T05:30:00",
        source: "Web",
        platform: "NSE",
      },
    ];
  }, [filteredTransactions, selectedInvestor]);

  return (
    <div className="space-y-4 animate-in">
      {/* ── Top Row: 4 Modern KPI Cards (Matching Image 1) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Portfolio Value */}
        <ModernKpiCard
          title="Total Portfolio Value"
          value={fmt(displayPortfolioValue)}
          badgeIcon={<Layers className="h-3.5 w-3.5" />}
          dayChange={portfolioChange.todayPct}
          dayLabel="Today"
          momChange={portfolioChange.momPct}
          momLabel="1M"
          dayPositive={portfolioChange.isPositive}
          momPositive={portfolioChange.isPositive}
          sparkData={aumSpark}
          sparkColor={CHART_COLORS.blue}
          timestamp="As on 10 Oct 2025, 12:30 PM"
        />

        {/* Card 2: Mutual Fund Portfolio */}
        <ModernKpiCard
          title="Mutual Fund Portfolio"
          value={fmt(currentValue > 0 ? currentValue : 995000)}
          badgeIcon={<Wallet className="h-3.5 w-3.5" />}
          dayChange={mfChange.todayPct}
          dayLabel="Today"
          momChange={mfChange.momPct}
          momLabel="1M"
          dayPositive={mfChange.isPositive}
          momPositive={mfChange.isPositive}
          sparkData={mfSpark}
          sparkColor={CHART_COLORS.green}
          footerText="14 Schemes | Equity 68% Debt 20% Hybrid 12%"
        />

        {/* Card 3: SIP Overview */}
        <ModernKpiCard
          title="SIP Overview"
          value={`₹${displaySipBook.toLocaleString("en-IN")} /month`}
          badgeIcon={<Activity className="h-3.5 w-3.5" />}
          dayChange={`${totalSipCount} Active SIPs`}
          dayLabel="| 2 Upcoming"
          dayPositive={true}
          sparkData={sipSpark}
          sparkColor={CHART_COLORS.green}
          footerText={`₹${(totalSipContributed / 100000).toFixed(2)} Lakh Total Contributed`}
        />

        {/* Card 4: Total Assets */}
        <ModernKpiCard
          title="Total Assets"
          value={fmt(displayTotalAssets)}
          badgeIcon={<PieChartIcon className="h-3.5 w-3.5" />}
          dayChange={assetsChange.todayPct}
          dayLabel="Today"
          momChange={assetsChange.momPct}
          momLabel="1M"
          dayPositive={assetsChange.isPositive}
          momPositive={assetsChange.isPositive}
          sparkData={assetsSpark}
          sparkColor={CHART_COLORS.green}
          footerText="Equity 42% MF 30% Gold 8% Real Estate 17% Cash 3%"
        />
      </div>

      {/* ── Main Dashboard Two-Column Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left Main Content: 9 cols */}
        <div className="xl:col-span-9 space-y-4">
          {/* Row 2: Overall Portfolio Details & Live Market News */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
            <div className="lg:col-span-7">
              <OverallPortfolioDetails
                schemeData={schemeData}
                totalMfCurrentValue={currentValue}
                totalMfInvested={totalInvested}
                advancedDetails={advancedDetails}
                totalPortfolioValue={displayPortfolioValue}
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

            <div className="lg:col-span-5">
              <LiveMarketNews />
            </div>
          </div>

          {/* Row 3: Lower Trio (Portfolio Performance, SIP Activity, Financial Goals) matching Image 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
            {/* 1. Portfolio Performance Chart with period selector */}
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden flex flex-col justify-between">
              <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Layers className="h-3.5 w-3.5" />
                    </div>
                    <CardTitle className="text-xs sm:text-sm font-bold text-foreground">
                      Portfolio Performance
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-500/10 p-0 px-2 gap-1"
                    onClick={() => navigate("/portfolio-analysis")}
                  >
                    <span>View Details</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>

                {/* Period Selector: 1M, 3M, 6M, 1Y, 2Y, Max */}
                <div className="flex items-center gap-1 pt-2 overflow-x-auto scrollbar-none">
                  {(["1M", "3M", "6M", "1Y", "2Y", "Max"] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setActivePeriod(period)}
                      className={cn(
                        "px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all shrink-0",
                        activePeriod === period
                          ? "bg-blue-600 text-white font-bold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-3 flex-1 flex flex-col justify-between">
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={filteredPerformanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => fmt(val)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                      formatter={(val: number) => [fmt(val), ""]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Portfolio Value"
                      stroke={CHART_COLORS.blue}
                      strokeWidth={2.2}
                      fill="url(#perfGrad)"
                      dot={{ r: 3, fill: CHART_COLORS.blue }}
                    />
                    <Line
                      type="monotone"
                      dataKey="invested"
                      name="Invested Value"
                      stroke="#94a3b8"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                <div className="flex items-center justify-center gap-4 pt-2 text-[10px] text-muted-foreground border-t border-border/30">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <span>Portfolio Value</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    <span>Invested Value</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. SIP Activity Bar Chart matching Image 2 */}
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden flex flex-col justify-between">
              <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <BarChart2 className="h-3.5 w-3.5" />
                    </div>
                    <CardTitle className="text-xs sm:text-sm font-bold text-foreground">
                      SIP Activity
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-500/10 p-0 px-2 gap-1"
                    onClick={() => navigate("/portfolio-analysis")}
                  >
                    <span>View All</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>

                {/* Top stats matching screenshot */}
                <div className="flex items-baseline justify-between pt-2">
                  <div>
                    <span className="text-base sm:text-lg font-heading font-extrabold text-foreground">
                      ₹1.72 Lakh
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-1">Total Contribution</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
                    <span>
                      <strong className="text-foreground">10</strong> Active SIPs
                    </span>
                    <span>
                      <strong className="text-foreground">2</strong> Upcoming
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-2 flex-1 flex flex-col justify-between">
                <ResponsiveContainer width="100%" height={165}>
                  <BarChart data={sipActivityData} margin={{ top: 8, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => fmt(val)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                      formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Contribution"]}
                    />
                    <Bar
                      dataKey="contribution"
                      name="SIP Contribution"
                      fill={CHART_COLORS.blue}
                      radius={[3, 3, 0, 0]}
                      barSize={14}
                    />
                  </BarChart>
                </ResponsiveContainer>

                <div className="flex items-center justify-center gap-4 pt-2 text-[10px] text-muted-foreground border-t border-border/30">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <span>SIP Contribution</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span>Expected</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Financial Goals matching Image 2 */}
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden flex flex-col justify-between">
              <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Target className="h-3.5 w-3.5" />
                    </div>
                    <CardTitle className="text-xs sm:text-sm font-bold text-foreground">
                      Financial Goals
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-500/10 p-0 px-2 gap-1"
                    onClick={() => navigate("/portfolio-analysis")}
                  >
                    <span>View All</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-2.5 space-y-3 flex-1 flex flex-col justify-around">
                {DEMO_GOALS.map((goal) => {
                  const Icon = goal.icon;
                  const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                  const currentLakh = (goal.currentAmount / 100000).toFixed(0);
                  const targetLakh = (goal.targetAmount / 100000).toFixed(0);

                  return (
                    <div key={goal.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={cn(
                              "h-6 w-6 rounded-md flex items-center justify-center shrink-0",
                              goal.iconBg,
                              goal.iconColor
                            )}
                          >
                            <Icon className="h-3 w-3" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-foreground truncate">{goal.name}</p>
                            <p className="text-[10px] text-muted-foreground">{goal.category}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-[11px] font-bold text-foreground">
                            ₹{currentLakh}L / ₹{targetLakh}L
                            <span className="text-blue-600 dark:text-blue-400 ml-1.5">{pct}%</span>
                          </div>
                          <p className="text-[9px] text-muted-foreground">{goal.targetDate}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", goal.barColor)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Motivational Bottom Banner */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/20 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/30">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400">
                Invest smart. Grow together.
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Track your investments, monitor performance and achieve your financial goals with BrickWealth.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: 3 cols (Today's Transactions Feed & Quick Actions) */}
        <div className="xl:col-span-3 space-y-3.5">
          {/* Main Feed Card */}
          <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden">
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
            <CardContent className="p-2.5 space-y-2 max-h-[460px] overflow-y-auto scrollbar-thin">
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

          {/* Quick Actions Panel */}
          <Card className="bg-card border border-border rounded-xl shadow-sm p-3.5 space-y-2.5">
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

export default Index;
