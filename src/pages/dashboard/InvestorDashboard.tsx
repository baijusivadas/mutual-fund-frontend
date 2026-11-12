import { memo, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInvestor } from "@/contexts/InvestorContext";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { useAdvancedPortfolio } from "@/hooks/useAdvancedPortfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  Filter,
  Info,
  Lightbulb,
  PlusCircle,
  Download,
  Target,
  Sparkles,
  Layers,
  BarChart2,
  PieChart as PieChartIcon,
  Shield,
  Coins,
  Activity,
  UserCheck,
  ArrowLeft,
  ChevronDown,
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
  BarChart,
} from "recharts";
import { isSellTransaction } from "@/utils/parseTransactions";
import { OverallPortfolioDetails } from "@/components/dashboard/OverallPortfolioDetails";
import { LiveMarketNews } from "@/components/dashboard/LiveMarketNews";
import { AiPortfolioAuditDialog } from "@/components/dashboard/AiPortfolioAuditDialog";
import { formatIndianUnits } from "@/utils/format";
import { Sparkline } from "@/components/charts/Sparkline";
import {
  FEED_MAX_TRANSACTIONS,
  SPARKLINE_HEIGHT,
  CHART_COLORS,
} from "@/lib/constants";

const fmt = (v: number): string => {
  if (!v || isNaN(v)) return "₹0";
  return formatIndianUnits(v);
};

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-muted-foreground">{title}</p>
              <Info className="h-3 w-3 text-muted-foreground/50 hover:text-foreground cursor-pointer transition-colors" />
            </div>
            <div className="h-6 w-6 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              {badgeIcon}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2.5 gap-2">
            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground tracking-tight">
              {value}
            </p>
            <div className="w-[105px] sm:w-[125px] shrink-0">
              <Sparkline data={sparkData} color={sparkColor} />
            </div>
          </div>
        </div>

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



export const InvestorDashboard = memo(() => {
    const navigate = useNavigate();
    const { isAdvisor, isSuperAdmin, user } = useAuth();
    const { filteredTransactions, selectedInvestor, setSelectedInvestor, investors, isNewUser } = useInvestor();
    const {
      schemeData,
      totalInvested,
      currentValue,
      performanceData,
      sipMonthlyTrend,
    } = usePortfolioData(filteredTransactions, isNewUser);

    const { totalLiabilities, totalAssets, totalInvestments: advancedInvestments, raw: advancedDetails } =
      useAdvancedPortfolio();

    const [activePeriod, setActivePeriod] = useState<"1M" | "3M" | "6M" | "1Y" | "2Y" | "Max">("1Y");
    const [aiAuditOpen, setAiAuditOpen] = useState(false);

    const grandCurrentValue = useMemo(
      () => currentValue + advancedInvestments,
      [currentValue, advancedInvestments]
    );
    const netWorth = useMemo(
      () => grandCurrentValue + totalAssets - totalLiabilities,
      [grandCurrentValue, totalAssets, totalLiabilities]
    );

    const displayPortfolioValue = currentValue;
    const displayTotalAssets = netWorth;

    const { displaySipBook, totalSipCount, totalSipContributed } = useMemo(() => {
      const sipTxns = filteredTransactions.filter((t) =>
        t.transactionType?.toLowerCase().includes("sip")
      );
      if (sipTxns.length > 0) {
        const uniqueMonths = new Set(sipTxns.map((t) => t.investmentDate?.substring(0, 7))).size || 1;
        const totalSip = sipTxns.reduce((acc, t) => acc + (t.value || 0), 0);
        return {
          displaySipBook: Math.round(totalSip / uniqueMonths),
          totalSipCount: sipTxns.length,
          totalSipContributed: totalSip,
        };
      }
      return {
        displaySipBook: 0,
        totalSipCount: 0,
        totalSipContributed: 0,
      };
    }, [filteredTransactions]);

    const portfolioChange = useMemo(() => {
      if (performanceData.length >= 2) {
        const cur = performanceData[performanceData.length - 1].value;
        const prev = performanceData[performanceData.length - 2].value;
        const diff = cur - prev;
        const momPct = prev > 0 ? (diff / prev) * 100 : 0;
        const formatted = `${diff >= 0 ? "+" : ""}${momPct.toFixed(2)}%`;
        return {
          todayPct: formatted,
          momPct: formatted,
          isPositive: diff >= 0,
        };
      }
      if (totalInvested > 0) {
        const gain = currentValue - totalInvested;
        const pct = (gain / totalInvested) * 100;
        const formatted = `${gain >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
        return {
          todayPct: formatted,
          momPct: formatted,
          isPositive: gain >= 0,
        };
      }
      return { todayPct: "0.00%", momPct: "0.00%", isPositive: true };
    }, [performanceData, currentValue, totalInvested]);

    const mfChange = useMemo(() => {
      if (totalInvested > 0) {
        const gain = currentValue - totalInvested;
        const pct = (gain / totalInvested) * 100;
        const formatted = `${gain >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
        return {
          todayPct: formatted,
          momPct: formatted,
          isPositive: gain >= 0,
        };
      }
      return { todayPct: "0.00%", momPct: "0.00%", isPositive: true };
    }, [currentValue, totalInvested]);

    const assetsChange = useMemo(() => {
      if (totalInvested > 0 && displayTotalAssets > 0) {
        const gain = displayTotalAssets - totalInvested;
        const pct = (gain / totalInvested) * 100;
        const formatted = `${gain >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
        return {
          todayPct: formatted,
          momPct: formatted,
          isPositive: gain >= 0,
        };
      }
      return { todayPct: "0.00%", momPct: "0.00%", isPositive: true };
    }, [totalInvested, displayTotalAssets]);

    const aumSpark = useMemo(() => {
      if (performanceData.length > 0) return performanceData.map((p) => p.value);
      return [currentValue];
    }, [performanceData, currentValue]);

    const mfSpark = useMemo(() => {
      if (performanceData.length > 0) return performanceData.map((p) => p.value);
      return [currentValue];
    }, [performanceData, currentValue]);

    const sipSpark = useMemo(() => {
      if (sipMonthlyTrend.length > 0) return sipMonthlyTrend;
      return [0];
    }, [sipMonthlyTrend]);

    const assetsSpark = useMemo(() => {
      if (performanceData.length > 0) return performanceData.map((p) => p.value + totalAssets);
      return [displayTotalAssets];
    }, [performanceData, totalAssets, displayTotalAssets]);

    const filteredPerformanceData = useMemo(() => {
      const now = new Date();
      const raw = performanceData.length > 0 ? performanceData : Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return {
          month: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
          value: currentValue,
          invested: totalInvested,
        };
      });

      if (activePeriod === "1M") return raw.slice(-2);
      if (activePeriod === "3M") return raw.slice(-4);
      if (activePeriod === "6M") return raw.slice(-7);
      if (activePeriod === "1Y") return raw.slice(-13);
      if (activePeriod === "2Y") return raw.slice(-25);
      return raw;
    }, [performanceData, activePeriod, currentValue, totalInvested]);

    const sipActivityData = useMemo(() => {
      const now = new Date();
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return d.toLocaleDateString("en-IN", { month: "short" });
      });

      return months.map((m, idx) => ({
        month: m,
        contribution: sipMonthlyTrend[idx] || 0,
        expected: displaySipBook,
      }));
    }, [sipMonthlyTrend, displaySipBook]);

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
      return [];
    }, [filteredTransactions, selectedInvestor]);

    const formattedTimestamp = useMemo(() => {
      return `As on ${new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}, ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
    }, []);

    return (
      <div className="space-y-4 animate-in">
        {/* Client View Header or Investor Greeting */}
        {(isAdvisor || isSuperAdmin) && selectedInvestor !== "all" ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-900/90 via-slate-900 to-indigo-950 text-white border border-blue-500/20 shadow-glass">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/10 ring-1 ring-white/10 flex items-center justify-center font-bold text-base text-blue-200">
                {selectedInvestor.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-blue-300/80 font-medium">Client Portfolio View</span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-semibold">Active Client</Badge>
                </div>
                <h1 className="text-xl font-heading font-bold text-white tracking-tight">{selectedInvestor}</h1>
                <p className="text-[11px] text-slate-300">
                  {schemeData.length} Mutual Fund Scheme{schemeData.length !== 1 ? "s" : ""} · {filteredTransactions.length} Total Transactions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {investors.length > 1 && (
                <div className="relative">
                  <select
                    aria-label="Switch client portfolio"
                    value={selectedInvestor}
                    onChange={(e) => setSelectedInvestor(e.target.value)}
                    className="h-8 pl-2.5 pr-7 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer appearance-none"
                  >
                    <option value="all" className="bg-slate-900 text-white">All Clients (Consolidated)</option>
                    {investors.map((inv) => (
                      <option key={inv} value={inv} className="bg-slate-900 text-white">{inv}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-3.5 w-3.5 text-white/70 pointer-events-none" />
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/advisor")}
                className="h-8 gap-1.5 text-xs font-semibold bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Advisor
              </Button>
            </div>
          </div>
        ) : (isAdvisor || isSuperAdmin) ? (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/90 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs">
            <div className="flex items-center gap-2.5">
              <UserCheck className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                <strong className="text-foreground">Previewing Consolidated Investor View:</strong> Showing aggregate portfolio across all clients.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/advisor")}
              className="h-7 text-xs font-bold border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300"
            >
              Return to Advisor Portal →
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950 text-white border border-slate-800 shadow-sm">
            <div>
              <p className="text-[11px] font-medium text-blue-300/90 uppercase tracking-wider">Welcome back</p>
              <h1 className="text-xl font-heading font-bold text-white tracking-tight">{user?.name || "Investor"}</h1>
              <p className="text-xs text-slate-300 mt-0.5">Overview of your mutual fund schemes, systematic plans, and consolidated portfolio.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-semibold px-2.5 py-1">
                {schemeData.length} Schemes in Folio
              </Badge>
            </div>
          </div>
        )}

        {/* ── Top Row: 4 Modern KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
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
            timestamp={formattedTimestamp}
          />

          <ModernKpiCard
            title="Mutual Fund Portfolio"
            value={fmt(currentValue)}
            badgeIcon={<Wallet className="h-3.5 w-3.5" />}
            dayChange={mfChange.todayPct}
            dayLabel="Today"
            momChange={mfChange.momPct}
            momLabel="1M"
            dayPositive={mfChange.isPositive}
            momPositive={mfChange.isPositive}
            sparkData={mfSpark}
            sparkColor={CHART_COLORS.green}
            footerText={schemeData.length > 0 ? `${schemeData.length} Scheme(s) in Folio` : "No mutual fund holdings"}
          />

          <ModernKpiCard
            title="SIP Overview"
            value={`₹${displaySipBook.toLocaleString("en-IN")} /month`}
            badgeIcon={<Activity className="h-3.5 w-3.5" />}
            dayChange={`${totalSipCount} Active SIPs`}
            dayLabel="| Monthly Run-rate"
            dayPositive={true}
            sparkData={sipSpark}
            sparkColor={CHART_COLORS.green}
            footerText={`₹${(totalSipContributed / 100000).toFixed(2)} Lakh Total Contributed`}
          />

          <ModernKpiCard
            title="Total Net Worth"
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
            footerText="Multi-Asset Holdings Net of Liabilities"
          />
        </div>

        {/* ── Main Dashboard Two-Column Layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          <div className="xl:col-span-9 space-y-4">
            {/* Row 2: Overall Portfolio Details & Live Market News */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
              <div className="lg:col-span-7">
                <OverallPortfolioDetails
                  schemeData={schemeData}
                  totalMfCurrentValue={currentValue}
                  totalMfInvested={totalInvested}
                  advancedDetails={advancedDetails}
                  onViewCategory={(cat) => {
                    if (cat === "equity") navigate("/stock-reports");
                    else if (cat === "mutual_fund") navigate("/mutual-funds");
                    else if (cat === "gold") navigate("/gold");
                    else if (cat === "real_estate") navigate("/real-estate");
                    else if (cat === "rent_property") navigate("/rental-properties");
                    else navigate("/portfolio");
                  }}
                />
              </div>

              <div className="lg:col-span-5">
                <LiveMarketNews />
              </div>
            </div>

            {/* Row 3: Lower Trio (Performance, SIP Activity, Goals) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
              {/* 1. Portfolio Performance Chart with period selector */}
              <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
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
                      className="h-6 text-xs font-semibold text-blue-600 dark:text-blue-400 p-0 px-2 gap-1"
                      onClick={() => navigate("/portfolio-analysis")}
                    >
                      <span>View Details</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>

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
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(val) => fmt(val)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }}
                        formatter={(val: number) => [fmt(val), ""]}
                      />
                      <Area type="monotone" dataKey="value" name="Portfolio Value" stroke={CHART_COLORS.blue} strokeWidth={2.2} fill="url(#perfGrad)" dot={{ r: 3, fill: CHART_COLORS.blue }} />
                      <Line type="monotone" dataKey="invested" name="Invested Value" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
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

              {/* 2. SIP Activity Bar Chart */}
              <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
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
                      className="h-6 text-xs font-semibold text-blue-600 dark:text-blue-400 p-0 px-2 gap-1"
                      onClick={() => navigate("/portfolio-analysis")}
                    >
                      <span>View All</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-baseline justify-between pt-2">
                    <div>
                      <span className="text-base sm:text-lg font-heading font-extrabold text-foreground">
                        ₹1.72 Lakh
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-1">Total Contribution</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
                      <span><strong className="text-foreground">10</strong> Active SIPs</span>
                      <span><strong className="text-foreground">2</strong> Upcoming</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-2 flex-1 flex flex-col justify-between">
                  <ResponsiveContainer width="100%" height={165}>
                    <BarChart data={sipActivityData} margin={{ top: 8, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(val) => fmt(val)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }}
                        formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Contribution"]}
                      />
                      <Bar dataKey="contribution" name="SIP Contribution" fill={CHART_COLORS.blue} radius={[3, 3, 0, 0]} barSize={14} />
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

              {/* 3. Top Portfolio Holdings / Scheme Allocation */}
              <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Target className="h-3.5 w-3.5" />
                      </div>
                      <CardTitle className="text-xs sm:text-sm font-bold text-foreground">
                        Top Scheme Holdings
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs font-semibold text-blue-600 dark:text-blue-400 p-0 px-2 gap-1"
                      onClick={() => navigate("/mutual-funds")}
                    >
                      <span>View All</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-2.5 space-y-3 flex-1 flex flex-col justify-around">
                  {schemeData.length > 0 ? (
                    schemeData.slice(0, 4).map((scheme, idx) => {
                      const pct = currentValue > 0 ? Math.round((scheme.currentValue / currentValue) * 100) : 0;
                      return (
                        <div key={scheme.schemeName} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-6 w-6 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                                #{idx + 1}
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-bold text-foreground truncate">{scheme.schemeName}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {scheme.totalUnits.toFixed(2)} units · NAV ₹{scheme.latestNav.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-[11px] font-bold text-foreground">
                                {formatIndianUnits(scheme.currentValue)}
                                <span className={cn(
                                  "ml-1.5 text-[10px] font-bold",
                                  scheme.returnPercent >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                )}>
                                  {scheme.returnPercent >= 0 ? "+" : ""}{scheme.returnPercent.toFixed(1)}%
                                </span>
                              </div>
                              <p className="text-[9px] text-muted-foreground">{pct}% of portfolio</p>
                            </div>
                          </div>

                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-600 transition-all duration-500"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                      <Wallet className="h-6 w-6 mb-1 opacity-40" />
                      <p className="text-xs">No mutual fund holdings found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Motivational Banner */}
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

          {/* Right Column: Today's Transactions & Quick Actions */}
          <div className="xl:col-span-3 space-y-3.5">
            <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
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
                    <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 rounded-md bg-muted text-foreground">
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
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">No recent transactions</p>
                    <p className="text-[10px] mt-0.5">Purchases and redemptions will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <span>Quick Actions</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAiAuditOpen(true)}
                  className="h-6 px-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 gap-1 rounded-md"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>AI Audit</span>
                </Button>
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
                  onClick={() => setAiAuditOpen(true)}
                >
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">AI Wealth Report</span>
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

        {/* AI Portfolio Audit & Wealth Diagnostic Dialog */}
        <AiPortfolioAuditDialog
          open={aiAuditOpen}
          onOpenChange={setAiAuditOpen}
          investorName={selectedInvestor !== "all" ? selectedInvestor : "Valued Investor"}
          totalCurrentValue={displayPortfolioValue}
          totalInvested={totalInvested}
          holdings={schemeData.map((s) => ({
            name: s.schemeName,
            currentValue: s.currentValue,
            type: "mutual_fund",
          }))}
        />
      </div>
    );
});

InvestorDashboard.displayName = "InvestorDashboard";
