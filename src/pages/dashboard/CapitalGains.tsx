import { memo, useMemo } from "react";
import { MetricCard } from "@/components/shared/MetricCard";
import { TrendingUp, Calendar, FileText, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { shortTermGains, longTermGains, TAX_RATES, calculateTotals } from "@/data/capitalGainsData";
import { TradeCard } from "@/components/dashboard/investments/TradeCard";
import { TotalSummaryCard } from "@/components/dashboard/metrics/TotalSummaryCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { ChartInsight } from "@/components/charts/ChartInsight";
import { formatCurrency } from "@/utils/format";

const CapitalGains = () => {
  const { totalShortTerm, totalLongTerm, shortTermTax, longTermTax, totalTaxLiability } = useMemo(() => {
    const st = calculateTotals(shortTermGains);
    const lt = calculateTotals(longTermGains);
    const stTax = Math.round(st * TAX_RATES.shortTerm);
    const ltTax = Math.round(lt * TAX_RATES.longTerm);
    return {
      totalShortTerm: st,
      totalLongTerm: lt,
      shortTermTax: stTax,
      longTermTax: ltTax,
      totalTaxLiability: stTax + ltTax,
    };
  }, []);

  const stcgRateLabel = `${(TAX_RATES.shortTerm * 100).toFixed(0)}%`;
  const ltcgRateLabel = `${(TAX_RATES.longTerm * 100).toFixed(1)}%`;

  const insightText = `Estimated combined capital gains tax liability is ${formatCurrency(totalTaxLiability)} (${formatCurrency(shortTermTax)} STCG at ${stcgRateLabel} + ${formatCurrency(longTermTax)} LTCG at ${ltcgRateLabel}). Consult your tax advisor for official filing.`;

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Capital Gains"
        description="Comprehensive tax liability estimation and realized gains breakdown"
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Short Term Capital Gains"
          value={formatCurrency(totalShortTerm)}
          change="Holding < 1 year"
          changeType="neutral"
          icon={Calendar}
        />
        <MetricCard
          title="Long Term Capital Gains"
          value={formatCurrency(totalLongTerm)}
          change="Holding > 1 year"
          changeType="positive"
          icon={TrendingUp}
        />
        <MetricCard
          title={`STCG Tax (${stcgRateLabel})`}
          value={formatCurrency(shortTermTax)}
          change="Short Term Liability"
          changeType="neutral"
          icon={FileText}
        />
        <MetricCard
          title={`LTCG Tax (${ltcgRateLabel})`}
          value={formatCurrency(longTermTax)}
          change="Long Term Liability"
          changeType="neutral"
          icon={DollarSign}
        />
      </div>

      <ChartInsight>{insightText}</ChartInsight>

      <div className="space-y-6">
        <Tabs defaultValue="shortterm" className="w-full">
          <TabsList className="grid w-full max-w-sm grid-cols-2 bg-muted/60 p-1 rounded-xl border border-border/50">
            <TabsTrigger value="shortterm" className="rounded-lg text-xs font-bold">
              Short Term ({shortTermGains.length})
            </TabsTrigger>
            <TabsTrigger value="longterm" className="rounded-lg text-xs font-bold">
              Long Term ({longTermGains.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shortterm" className="mt-4 space-y-4">
            {shortTermGains.map((trade, index) => (
              <TradeCard
                key={`${trade.stock}-${index}`}
                trade={trade}
                taxRate={TAX_RATES.shortTerm}
                variant="shortTerm"
              />
            ))}
            <TotalSummaryCard
              totalGains={totalShortTerm}
              totalTax={shortTermTax}
              variant="shortTerm"
              gainsLabel="Total Short Term Capital Gains"
            />
          </TabsContent>

          <TabsContent value="longterm" className="mt-4 space-y-4">
            {longTermGains.map((trade, index) => (
              <TradeCard
                key={`${trade.stock}-${index}`}
                trade={trade}
                taxRate={TAX_RATES.longTerm}
                variant="longTerm"
              />
            ))}
            <TotalSummaryCard
              totalGains={totalLongTerm}
              totalTax={longTermTax}
              variant="longTerm"
              gainsLabel="Total Long Term Capital Gains"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default memo(CapitalGains);
