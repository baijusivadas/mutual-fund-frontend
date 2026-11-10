import { useState, memo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdvisorDashboard } from "./AdvisorDashboard";
import { InvestorDashboard } from "./InvestorDashboard";

/**
 * Main BrickWealth Dashboard Controller.
 * Switches cleanly between Advisor Practice Dashboard and Investor Client Dashboard
 * depending on user role and active view preference.
 */
export const Index = memo(() => {
  const { isAdvisor } = useAuth();
  const [viewMode, setViewMode] = useState<"advisor" | "investor">(
    isAdvisor ? "advisor" : "investor"
  );

  const isAdvisorView = isAdvisor && viewMode === "advisor";

  return (
    <div key={isAdvisorView ? "view-advisor" : "view-investor"} className="w-full">
      {isAdvisorView ? (
        <AdvisorDashboard
          key="advisor-dashboard-root"
          onSwitchToInvestorView={() => setViewMode("investor")}
        />
      ) : (
        <InvestorDashboard
          key="investor-dashboard-root"
          onSwitchToAdvisorView={isAdvisor ? () => setViewMode("advisor") : undefined}
        />
      )}
    </div>
  );
});

Index.displayName = "Index";

export default Index;
