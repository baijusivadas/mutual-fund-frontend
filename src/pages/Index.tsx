import { DashboardLayout } from "@/components/DashboardLayout";
import { useInvestor } from "@/contexts/InvestorContext";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { NetWorthCard } from "@/components/NetWorthCard";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { InvestmentGrowthChart } from "@/components/dashboard/InvestmentGrowthChart";
import { PortfolioDistributionChart } from "@/components/dashboard/PortfolioDistributionChart";
import { HoldingsGrid } from "@/components/dashboard/HoldingsGrid";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

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
  } = usePortfolioData(filteredTransactions, isNewUser);

  return (
    <DashboardLayout>
      <div className="flex gap-6">
        <div className="flex-1 space-y-6">
          {/* Net Worth Overview - SuperAdmin Only */}
          {isSuperAdmin && <NetWorthCard />}

          {/* Top Metrics */}
          <DashboardMetrics
            selectedInvestor={selectedInvestor}
            totalInvested={totalInvested}
            currentValue={currentValue}
            roi={roi}
            xirr={xirr}
          />

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            <InvestmentGrowthChart performanceData={performanceData} />
            <PortfolioDistributionChart portfolioComposition={portfolioComposition} />
          </div>

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
