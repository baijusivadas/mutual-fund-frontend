import { memo, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useInvestor } from "@/contexts/InvestorContext";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { CommonCard } from "@/components/shared/CommonCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { ChartInsight } from "@/components/charts/ChartInsight";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FundItem {
  name: string;
  units: number;
  nav: number;
  value: number;
  invested: number;
  returns: number;
  returnPercent: number;
  portfolioShare: number;
}

const formatCurrency = (value: number) => {
  const absoluteValue = Math.abs(value);
  const formatted =
    absoluteValue >= 10000000
      ? `₹${(absoluteValue / 10000000).toFixed(2)} Cr`
      : absoluteValue >= 100000
        ? `₹${(absoluteValue / 100000).toFixed(2)} L`
        : `₹${absoluteValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  return value < 0 ? `-${formatted}` : formatted;
};

const PortfolioFundCard = memo(({ fund }: { fund: FundItem }) => {
  const isPositive = fund.returns >= 0;

  return (
    <CommonCard
      noHeader
      className="rounded-xl border border-border/70 bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-sm group"
      contentClassName="p-5"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
              {fund.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {fund.units.toLocaleString("en-IN", { maximumFractionDigits: 2 })} units • NAV ₹{fund.nav.toFixed(2)}
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
            {isPositive ? "+" : ""}
            {fund.returnPercent.toFixed(1)}%
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 border-t border-border/40 pt-3">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Invested</p>
            <p className="text-base font-heading font-extrabold text-foreground mt-0.5">
              {formatCurrency(fund.invested)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Current Value</p>
            <p className="text-base font-heading font-extrabold text-primary mt-0.5">
              {formatCurrency(fund.value)}
            </p>
          </div>
        </div>

        {/* Returns & Progress Bar */}
        <div className="space-y-2 border-t border-border/40 pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Value vs. Net Invested</span>
            <span
              className={cn(
                "font-bold",
                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {formatCurrency(fund.returns)}
            </span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full bg-primary transition-all duration-500"
              )}
              style={{ width: `${Math.min(fund.portfolioShare, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-right text-muted-foreground">
            {fund.portfolioShare.toFixed(1)}% of portfolio
          </p>
        </div>
      </div>
    </CommonCard>
  );
});
PortfolioFundCard.displayName = "PortfolioFundCard";

const Portfolio = () => {
  const { filteredTransactions, selectedInvestor, isNewUser } = useInvestor();
  const { schemeData, totalInvested, currentValue, totalReturns, roi } =
    usePortfolioData(filteredTransactions, isNewUser);
  const mutualFunds = useMemo(
    () =>
      schemeData.map((scheme) => ({
        name: scheme.schemeName,
        units: scheme.totalUnits,
        nav: scheme.latestNav,
        value: scheme.currentValue,
        invested: scheme.totalInvested,
        returns: scheme.returns,
        returnPercent: scheme.returnPercent,
        portfolioShare: currentValue > 0 ? (scheme.currentValue / currentValue) * 100 : 0,
      })),
    [schemeData, currentValue]
  );
  const positiveHoldings = mutualFunds.filter((fund) => fund.returns > 0).length;
  const topHolding = mutualFunds[0];
  const portfolioInsight = topHolding
    ? `${topHolding.name} is your largest holding at ${topHolding.portfolioShare.toFixed(1)}% of mutual fund value. ${positiveHoldings} of ${mutualFunds.length} holdings are above net invested amount.`
    : "No active mutual fund holdings are available for this investor.";
  const isPositiveReturns = totalReturns >= 0;

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Portfolio"
        description={`${selectedInvestor === "all" ? "All Investors" : selectedInvestor} — Complete Investment Portfolio`}
      />

      {/* Summary Metric Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          title="Total Portfolio Value"
          value={formatCurrency(currentValue)}
          change={`${mutualFunds.length} Active Schemes`}
          changeType="neutral"
          icon={Wallet}
        />
        <DashboardMetricCard
          title="Total Invested"
          value={formatCurrency(totalInvested)}
          change="Net Capital Deployed"
          changeType="neutral"
          icon={Layers}
        />
        <DashboardMetricCard
          title="Value vs. Net Invested"
          value={formatCurrency(totalReturns)}
          change={`${isPositiveReturns ? "+" : ""}${Number(roi).toFixed(2)}% vs. net invested`}
          changeType={isPositiveReturns ? "positive" : "negative"}
          icon={isPositiveReturns ? TrendingUp : TrendingDown}
        />
        <DashboardMetricCard
          title="Active Holdings"
          value={mutualFunds.length}
          change={`${positiveHoldings} above net invested`}
          changeType="neutral"
          icon={PieChart}
        />
      </div>

      <ChartInsight>{portfolioInsight}</ChartInsight>

      <div className="space-y-6">
        <Tabs defaultValue="mutualfunds" className="w-full">
          <div className="flex items-center justify-between pb-2">
            <TabsList className="grid w-full max-w-xs grid-cols-1 bg-muted/60 p-1 rounded-xl border border-border/50">
              <TabsTrigger value="mutualfunds" className="rounded-lg text-xs font-bold">
                Mutual Funds Holdings ({mutualFunds.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="mutualfunds" className="mt-4">
            {mutualFunds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mutualFunds.map((fund) => (
                  <PortfolioFundCard key={fund.name} fund={fund} />
                ))}
              </div>
            ) : (
              <CommonCard noHeader className="py-12 border-dashed">
                <div className="text-center space-y-2">
                  <p className="text-base font-bold text-foreground">No mutual fund holdings found</p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    No active positions found for the selected investor. Upload transactions to view your live portfolio.
                  </p>
                </div>
              </CommonCard>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default memo(Portfolio);
