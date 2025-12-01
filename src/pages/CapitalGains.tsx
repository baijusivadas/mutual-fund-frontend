import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { TrendingUp, Calendar, FileText, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { shortTermGains, longTermGains, TAX_RATES, calculateTotals } from "../data/capitalGainsData";
import { TradeCard } from "../components/TradeCard";
import { TotalSummaryCard } from "../components/TotalSummaryCard";

const CapitalGains = () => {
  const totalShortTerm = calculateTotals(shortTermGains);
  const totalLongTerm = calculateTotals(longTermGains);
  const shortTermTax = totalShortTerm * TAX_RATES.shortTerm;
  const longTermTax = totalLongTerm * TAX_RATES.longTerm;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Capital Gains</h2>
          <p className="text-muted-foreground">Tax calculation and gains analysis</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Short Term Capital Gains"
            value={`₹${totalShortTerm.toLocaleString()}`}
            change="Holding < 1 year"
            changeType="neutral"
            icon={Calendar}
          />
          <MetricCard
            title="Long Term Capital Gains"
            value={`₹${totalLongTerm.toLocaleString()}`}
            change="Holding > 1 year"
            changeType="positive"
            icon={TrendingUp}
          />
          <MetricCard
            title="STCG Tax (15%)"
            value={`₹${shortTermTax.toLocaleString()}`}
            change="Short term liability"
            changeType="neutral"
            icon={FileText}
          />
          <MetricCard
            title="LTCG Tax (10%)"
            value={`₹${longTermTax.toLocaleString()}`}
            change="Long term liability"
            changeType="neutral"
            icon={DollarSign}
          />
        </div>

        <Tabs defaultValue="shortterm" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="shortterm">Short Term</TabsTrigger>
            <TabsTrigger value="longterm">Long Term</TabsTrigger>
          </TabsList>

          <TabsContent value="shortterm" className="mt-6">
            <div className="space-y-4">
              {shortTermGains.map((trade, index) => (
                <TradeCard key={index} trade={trade} taxRate={TAX_RATES.shortTerm} variant="shortTerm" />
              ))}
              <TotalSummaryCard
                totalGains={totalShortTerm}
                totalTax={shortTermTax}
                variant="shortTerm"
                gainsLabel="Total Short Term Capital Gains"
              />
            </div>
          </TabsContent>

          <TabsContent value="longterm" className="mt-6">
            <div className="space-y-4">
              {longTermGains.map((trade, index) => (
                <TradeCard key={index} trade={trade} taxRate={TAX_RATES.longTerm} variant="longTerm" />
              ))}
              <TotalSummaryCard
                totalGains={totalLongTerm}
                totalTax={longTermTax}
                variant="longTerm"
                gainsLabel="Total Long Term Capital Gains"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CapitalGains;