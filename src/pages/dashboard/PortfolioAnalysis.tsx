import { memo, useMemo, useCallback } from "react";
import { useInvestor } from "@/contexts/InvestorContext";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { useAdvancedPortfolio } from "@/hooks/useAdvancedPortfolio";
import { calculateXIRR } from "@/lib/xirr";
import { isSellTransaction } from "@/utils/parseTransactions";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { CommonCard } from "@/components/shared/CommonCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── helpers ────────────────────────────────────────────────── */
const fmt = (v: number) =>
  v >= 10000000
    ? `₹${(v / 10000000).toFixed(2)} Cr`
    : v >= 100000
    ? `₹${(v / 100000).toFixed(2)} L`
    : `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

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
    <div className="rounded-2xl border border-border/60 bg-card/85 backdrop-blur-sm hover:border-primary/40 hover:shadow-lg transition-all duration-300 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary text-sm font-extrabold">
            #{rank}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground line-clamp-2 leading-snug">{scheme.schemeName}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {scheme.totalUnits.toFixed(3)} units · NAV ₹{scheme.latestNav.toFixed(2)}
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            "text-[10px] font-bold shrink-0 border-none px-2 py-0.5 rounded-full flex items-center gap-1",
            isPositive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          )}
        >
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {isPositive ? "+" : ""}{scheme.returnPercent.toFixed(1)}%
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Invested</p>
          <p className="text-sm font-bold text-foreground">{fmt(scheme.totalInvested)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Current</p>
          <p className="text-sm font-bold text-foreground">{fmt(scheme.currentValue)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">XIRR</p>
          <p className={cn("text-sm font-bold", xirr !== null && xirr >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500")}>
            {xirr !== null ? `${xirr.toFixed(1)}%` : "N/A"}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Portfolio share</span>
          <span>{allocationPct.toFixed(1)}%</span>
        </div>
        <Progress value={allocationPct} className="h-1.5" />
      </div>
    </div>
  );
});

/* ── Main Page ───────────────────────────────────────────────── */
const PortfolioAnalysis = () => {
  const { filteredTransactions, isNewUser, investors, selectedInvestor } = useInvestor();
  const { schemeData, totalInvested, currentValue, xirr: overallXirr } = usePortfolioData(filteredTransactions, isNewUser);
  const { totalAssets, totalLiabilities, totalInvestments: advancedInvestments } = useAdvancedPortfolio();

  const totalReturns = currentValue - totalInvested;
  const overallAllReturn = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : "0.00";
  const isPositive = parseFloat(overallAllReturn) >= 0;

  const allocationData = useMemo(() => {
    const items = [
      { name: "Mutual Funds", value: currentValue, color: "#6366f1" },
      { name: "Real Estate", value: totalAssets, color: "#10b981" },
      { name: "Other Assets", value: advancedInvestments, color: "#f59e0b" },
    ].filter((d) => d.value > 0);
    return items.length > 0 ? items : [{ name: "No Data", value: 1, color: "#94a3b8" }];
  }, [currentValue, totalAssets, advancedInvestments]);

  const totalPortfolioValue = currentValue + totalAssets + advancedInvestments;
  const totalNetWorth = totalPortfolioValue - totalLiabilities;

  const { sipInvested, lumpSumInvested, sipCount, lumpSumCount } = useMemo(() => {
    let sip = 0, lump = 0, sipC = 0, lumpC = 0;
    for (const t of filteredTransactions) {
      if (!isSellTransaction(t)) {
        const isSIP = /sip|systematic/i.test(t.transactionType || "");
        if (isSIP) { sip += t.value; sipC++; }
        else { lump += t.value; lumpC++; }
      }
    }
    return { sipInvested: sip, lumpSumInvested: lump, sipCount: sipC, lumpSumCount: lumpC };
  }, [filteredTransactions]);

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
    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, data]) => {
        const [year, month] = key.split("-");
        const label = new Date(Number(year), Number(month) - 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        return { label, ...data };
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
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Portfolio Analysis"
        description={`Detailed breakdown for ${selectedInvestor === "all" ? `${investors.length} investor(s)` : selectedInvestor}`}
        actions={
          hasData ? (
            <Button variant="outline" onClick={exportCSV} className="gap-2 rounded-xl">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Invested"
          value={fmt(totalInvested)}
          change={`${schemeData.length} schemes`}
          changeType="neutral"
          icon={Target}
        />
        <MetricCard
          title="Current Value"
          value={fmt(currentValue)}
          change={isPositive ? `+${overallAllReturn}%` : `${overallAllReturn}%`}
          changeType={isPositive ? "positive" : "negative"}
          icon={isPositive ? TrendingUp : TrendingDown}
        />
        <MetricCard
          title="Unrealized Returns"
          value={fmt(Math.abs(totalReturns))}
          change={isPositive ? "Gain" : "Loss"}
          changeType={isPositive ? "positive" : "negative"}
          icon={Activity}
        />
        <MetricCard
          title="Portfolio XIRR"
          value={typeof overallXirr === "number" ? `${overallXirr.toFixed(1)}%` : "N/A"}
          change="Annualized Return"
          changeType={typeof overallXirr === "number" && overallXirr >= 0 ? "positive" : "neutral"}
          icon={Zap}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommonCard title="Asset Allocation" icon={PieIcon}>
          {totalPortfolioValue > 0 ? (
            <div className="flex flex-col items-center gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocationData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [fmt(v), "Value"]}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3">
                {allocationData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                    <span className="text-xs font-bold text-foreground">
                      {totalPortfolioValue > 0 ? ((item.value / totalPortfolioValue) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No portfolio data available yet.</p>
          )}
        </CommonCard>

        <CommonCard title="SIP vs Lump Sum" icon={Calendar}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">SIP</p>
                <p className="text-lg font-extrabold text-foreground mt-1">{fmt(sipInvested)}</p>
                <p className="text-xs text-muted-foreground mt-1">{sipCount} transactions</p>
              </div>
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lump Sum</p>
                <p className="text-lg font-extrabold text-foreground mt-1">{fmt(lumpSumInvested)}</p>
                <p className="text-xs text-muted-foreground mt-1">{lumpSumCount} transactions</p>
              </div>
            </div>
            {(sipInvested + lumpSumInvested) > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>SIP contribution</span>
                  <span>{((sipInvested / (sipInvested + lumpSumInvested)) * 100).toFixed(0)}%</span>
                </div>
                <Progress
                  value={(sipInvested / (sipInvested + lumpSumInvested)) * 100}
                  className="h-2"
                />
              </div>
            )}
            {(sipInvested + lumpSumInvested) === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No purchase transactions found.</p>
            )}
          </div>
        </CommonCard>
      </div>

      {monthlyData.length > 0 && (
        <CommonCard title="Monthly Investment Activity" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="label"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => v >= 100000 ? `₹${(v / 100000).toFixed(0)}L` : `₹${(v / 1000).toFixed(0)}K`}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: number) => [fmt(v), ""]}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="invested" name="Invested" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="redeemed" name="Redeemed" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CommonCard>
      )}

      <CommonCard title="Scheme-Level Analysis" icon={BarChart3}>
        {hasData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
          <div className="py-16 text-center">
            <PieIcon className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">No scheme data available</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Upload a transaction file to see your portfolio breakdown.</p>
          </div>
        )}
      </CommonCard>

      {totalNetWorth > 0 && (
        <CommonCard title="Net Worth Breakdown" icon={Target}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Mutual Funds", value: currentValue, color: "text-primary" },
              { label: "Real Estate", value: totalAssets, color: "text-emerald-500" },
              { label: "Other Assets", value: advancedInvestments, color: "text-amber-500" },
              { label: "Liabilities", value: totalLiabilities, color: "text-rose-500", negative: true },
            ].map(({ label, value, color, negative }) => (
              <div key={label} className="rounded-xl bg-muted/40 p-4 text-center space-y-1">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
                <p className={cn("text-lg font-extrabold", color)}>
                  {negative ? "-" : ""}{fmt(value)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Net Worth</span>
            <span className="text-xl font-extrabold text-foreground">{fmt(totalNetWorth)}</span>
          </div>
        </CommonCard>
      )}
    </div>
  );
};

export default memo(PortfolioAnalysis);
