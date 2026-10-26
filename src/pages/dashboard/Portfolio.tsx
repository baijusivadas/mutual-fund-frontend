import { memo, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useInvestor } from "@/contexts/InvestorContext";
import { TransactionData } from "@/utils/parseTransactions";
import { CommonCard } from "@/components/shared/CommonCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { Wallet, TrendingUp, PieChart, Layers, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FundItem {
  name: string;
  units: number;
  nav: number;
  value: number;
  invested: number;
  returns: number;
  returnPercent: number;
}

const PortfolioFundCard = memo(({ fund }: { fund: FundItem }) => {
  const isPositive = fund.returns >= 0;

  return (
    <CommonCard
      noHeader
      className="rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl hover:border-primary/40 transition-all duration-300 hover:shadow-lg group"
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
              ₹{(fund.invested / 1000).toFixed(1)}K
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Current Value</p>
            <p className="text-base font-heading font-extrabold text-primary mt-0.5">
              ₹{(fund.value / 1000).toFixed(1)}K
            </p>
          </div>
        </div>

        {/* Returns & Progress Bar */}
        <div className="space-y-2 border-t border-border/40 pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Total Gain / Loss</span>
            <span
              className={cn(
                "font-bold",
                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {isPositive ? "+" : ""}₹{(fund.returns / 1000).toFixed(1)}K
            </span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isPositive ? "bg-emerald-500" : "bg-rose-500"
              )}
              style={{ width: `${Math.min(Math.abs(fund.returnPercent), 100)}%` }}
            />
          </div>
        </div>
      </div>
    </CommonCard>
  );
});
PortfolioFundCard.displayName = "PortfolioFundCard";

const Portfolio = () => {
  const { filteredTransactions, selectedInvestor } = useInvestor();

  // Group by scheme and calculate totals using useMemo
  const { mutualFunds, totalInvested, totalValue, totalReturns, overallReturnPercent } = useMemo(() => {
    const schemes = new Map<
      string,
      {
        name: string;
        units: number;
        invested: number;
        nav: number;
        transactions: TransactionData[];
      }
    >();

    // Sort transactions oldest to newest so the last iterated is the latest NAV
    const sortedTx = [...filteredTransactions].sort(
      (a, b) => new Date(a.investmentDate).getTime() - new Date(b.investmentDate).getTime()
    );

    sortedTx.forEach((t) => {
      const existing = schemes.get(t.schemeName);
      const invested = t.isSell ? -t.value : t.value;
      const units = t.isSell ? -t.units : t.units;

      if (existing) {
        existing.units += units;
        existing.invested += invested;
        existing.nav = t.nav;
        existing.transactions.push(t);
      } else {
        schemes.set(t.schemeName, {
          name: t.schemeName,
          units: units,
          invested: invested,
          nav: t.nav,
          transactions: [t],
        });
      }
    });

    const funds = Array.from(schemes.values())
      .filter((s) => s.units > 0.01) // Filter out negligible units
      .map((s) => {
        const val = s.units * s.nav;
        const rets = val - s.invested;
        const retPct = s.invested > 0 ? (rets / s.invested) * 100 : 0;

        return {
          name: s.name,
          units: s.units,
          nav: s.nav,
          value: val,
          invested: s.invested,
          returns: rets,
          returnPercent: retPct,
        };
      })
      .sort((a, b) => b.value - a.value);

    let totInv = 0;
    let totVal = 0;
    for (const f of funds) {
      totInv += f.invested;
      totVal += f.value;
    }
    const totRet = totVal - totInv;
    const overallPct = totInv > 0 ? (totRet / totInv) * 100 : 0;

    return {
      mutualFunds: funds,
      totalInvested: totInv,
      totalValue: totVal,
      totalReturns: totRet,
      overallReturnPercent: overallPct,
    };
  }, [filteredTransactions]);

  const isPositiveReturns = totalReturns >= 0;

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Portfolio"
        description={`${selectedInvestor === "all" ? "All Investors" : selectedInvestor} — Complete Investment Portfolio`}
      />

      {/* Summary Metric Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Portfolio Value"
          value={`₹${(totalValue / 100000).toFixed(2)} Lakh`}
          change={`${mutualFunds.length} Active Schemes`}
          changeType="neutral"
          icon={Wallet}
        />
        <MetricCard
          title="Total Invested"
          value={`₹${(totalInvested / 100000).toFixed(2)} Lakh`}
          change="Net Capital Deployed"
          changeType="neutral"
          icon={Layers}
        />
        <MetricCard
          title="Total Returns"
          value={`₹${Math.abs(totalReturns / 1000).toFixed(1)}K`}
          change={`${isPositiveReturns ? "+" : ""}${overallReturnPercent.toFixed(2)}% ROI`}
          changeType={isPositiveReturns ? "positive" : "negative"}
          icon={TrendingUp}
        />
        <MetricCard
          title="Active Holdings"
          value={mutualFunds.length.toString()}
          change="Diversified Assets"
          changeType="neutral"
          icon={PieChart}
        />
      </div>

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
