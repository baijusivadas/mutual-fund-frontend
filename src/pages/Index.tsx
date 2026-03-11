import { DashboardLayout } from "@/components/DashboardLayout";
import { useInvestor } from "@/contexts/InvestorContext";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { NetWorthChart } from "@/components/charts/NetWorthChart";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardMetrics } from "@/components/dashboard/metrics/DashboardMetrics";
import { useAdvancedPortfolio } from "@/hooks/useAdvancedPortfolio";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Landmark, PiggyBank, Banknote } from "lucide-react";
import { InvestmentGrowthChart } from "@/components/charts/InvestmentGrowthChart";
import { AssetAllocationChart } from "@/components/charts/AssetAllocationChart";
import { HoldingsGrid } from "@/components/dashboard/investments/HoldingsGrid";
import { RecentActivity } from "@/components/dashboard/investments/RecentActivity";
import { AdvancedDashboardWidgets } from "@/components/dashboard/AdvancedDashboardWidgets";

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
  // Approximation for current value until individual tracked returns are built
  const grandTotalCurrentValue = currentValue + advancedInvestments;
  const netWorth = grandTotalCurrentValue + totalAssets - totalLiabilities;

  const formatCurrency = (val: number) => `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <DashboardLayout>
      <div className="flex gap-6">
        <div className="flex-1 space-y-6">
          {/* Net Worth Overview - SuperAdmin Only */}
          {isSuperAdmin && <NetWorthChart />}

          {/* Grand Totals Overview */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-primary/80">Total Net Worth</p>
                </div>
                <p className="text-3xl font-bold text-primary">{formatCurrency(netWorth)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Landmark className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Total Investments</p>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(grandTotalCurrentValue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(totalAssets)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Banknote className="h-4 w-4 text-destructive/80" />
                  <p className="text-sm font-medium text-destructive/80">Total Liabilities</p>
                </div>
                <p className="text-3xl font-bold text-destructive">-{formatCurrency(totalLiabilities)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Metrics (Market Portfolio) */}
          <DashboardMetrics
            selectedInvestor={selectedInvestor}
            totalInvested={totalInvested}
            currentValue={currentValue}
            roi={roi}
            xirr={xirr}
          />

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            <InvestmentGrowthChart
              performanceData={performanceData}
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
            />
            <AssetAllocationChart portfolioComposition={portfolioComposition} />
          </div>

          {/* Advanced Features */}
          <AdvancedDashboardWidgets netWorth={netWorth} totalInvestments={grandTotalInvestments} />

          {/* Holdings */}
          <HoldingsGrid schemeData={schemeData} />
        </div>

        {/* Sidebar */}
        <RecentActivity
          recentTransactions={recentTransactions}
          topPerformingFunds={topPerformingFunds}
        />
      </div>
    </DashboardLayout>
  );
};

export default Index;
