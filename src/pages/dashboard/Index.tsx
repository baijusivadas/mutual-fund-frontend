import { memo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { InvestorDashboard } from "./InvestorDashboard";

/** Redirect advisors to their dedicated dashboard; investors use the client dashboard. */
export const Index = memo(() => {
  const { isAdvisor } = useAuth();

  if (isAdvisor) return <Navigate to="/advisor" replace />;
  return <InvestorDashboard />;
});

Index.displayName = "Index";

export default Index;
