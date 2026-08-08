import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useInvestor } from "@/contexts/InvestorContext";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { NetWorthChart } from "@/components/charts/NetWorthChart";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardMetrics } from "@/components/dashboard/metrics/DashboardMetrics";
import { useAdvancedPortfolio } from "@/hooks/useAdvancedPortfolio";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Landmark, PiggyBank, Banknote, SearchX } from "lucide-react";
import { InvestmentGrowthChart } from "@/components/charts/InvestmentGrowthChart";
import { AssetAllocationChart } from "@/components/charts/AssetAllocationChart";
import { HoldingsGrid } from "@/components/dashboard/investments/HoldingsGrid";
import { RecentActivity } from "@/components/dashboard/investments/RecentActivity";
import { AdvancedDashboardWidgets } from "@/components/dashboard/AdvancedDashboardWidgets";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";

const Index = () => {
  const { isSuperAdmin } = useAuth();
  const { filteredTransactions, selectedInvestor, isNewUser } = useInvestor();
  const {
    schemeData,
    totalInvested,
    currentValue,
    roi,
    xirr,
    performanceData,
    portfolioComposition,
    recentTransactions,
    topPerformingFunds,
    timeFilter,
    setTimeFilter,
  } = usePortfolioData(filteredTransactions, isNewUser);

  const { totalLiabilities, totalAssets, totalInvestments: advancedInvestments } = useAdvancedPortfolio();

  const grandTotalInvestments = totalInvested + advancedInvestments;
  const grandTotalCurrentValue = currentValue + advancedInvestments;
  const netWorth = grandTotalCurrentValue + totalAssets - totalLiabilities;

  const formatCurrency = (val: number) => `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const hasNoData = schemeData.length === 0 && totalAssets === 0 && totalLiabilities === 0;

  return (
    <DashboardLayout>
      <PageHeader 
        title="Dashboard Overview" 
        description={`Welcome back! Here's a summary of your ${selectedInvestor === "all" ? "total" : selectedInvestor + "'s"} portfolio.`}
      />
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-[3] space-y-8 min-w-0">
          {/* Net Worth Overview - SuperAdmin Only */}
          {isSuperAdmin && (
            <div className="animate-in" style={{ animationDelay: '0.1s' }}>
              <NetWorthChart />
            </div>
          )}

          {/* Grand Totals Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 animate-in" style={{ animationDelay: '0.2s' }}>
            <MetricCard
              title="Total Net Worth"
              value={formatCurrency(netWorth)}
              change="Consolidated Equity"
              icon={Wallet}
              className="text-primary"
            />
            <MetricCard
              title="Total Investments"
              value={formatCurrency(grandTotalCurrentValue)}
              change="Market Portfolio"
              icon={Landmark}
            />
            <MetricCard
              title="Total Assets"
              value={formatCurrency(totalAssets)}
              change="Physical & Digital"
              icon={PiggyBank}
            />
            <MetricCard
              title="Total Liabilities"
              value={formatCurrency(totalLiabilities)}
              change="Outstanding Debt"
              changeType="negative"
              icon={Banknote}
              className="text-destructive"
            />
          </div>

          {hasNoData ? (
            <Card className="glass-card border-dashed border-2 bg-transparent py-16 animate-in" style={{ animationDelay: '0.3s' }}>
              <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <SearchX className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">No Portfolio Data Found</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Upload your investment transactions or add assets in the administration panel to see your financial analytics.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Top Metrics (Market Portfolio) */}
              <div className="animate-in" style={{ animationDelay: '0.3s' }}>
                <DashboardMetrics
                  selectedInvestor={selectedInvestor}
                  totalInvested={totalInvested}
                  currentValue={currentValue}
                  roi={roi}
                  xirr={xirr}
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in" style={{ animationDelay: '0.4s' }}>
                <div className="glass-card rounded-[2rem] p-2">
                  <InvestmentGrowthChart
                    performanceData={performanceData}
                    timeFilter={timeFilter}
                    setTimeFilter={setTimeFilter}
                  />
                </div>
                <div className="glass-card rounded-[2rem] p-2">
                  <AssetAllocationChart portfolioComposition={portfolioComposition} />
                </div>
              </div>

              {/* Advanced Features */}
              <div className="animate-in" style={{ animationDelay: '0.5s' }}>
                <AdvancedDashboardWidgets netWorth={netWorth} totalInvestments={grandTotalInvestments} />
              </div>

              {/* Holdings */}
              <div className="animate-in" style={{ animationDelay: '0.6s' }}>
                <HoldingsGrid schemeData={schemeData} />
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex-1 min-w-[320px] max-w-md animate-in" style={{ animationDelay: '0.7s' }}>
          <div className="sticky top-28 space-y-8">
            <RecentActivity
              recentTransactions={recentTransactions}
              topPerformingFunds={topPerformingFunds}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
