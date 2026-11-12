export interface ClientRiskProfile {
  label: "Aggressive" | "Moderate" | "Conservative";
  color: string;
  desc: string;
}

export type ClientTier = "HNI" | "Premium" | "Regular";

export interface ClientRow {
  id: string;
  name: string;
  schemesCount: number;
  unvaluedSchemesCount: number;
  transactionCount: number;
  netInvested: number;
  currentValue: number;
  returns: number;
  returnsPercent: number | null;
  latestActivity: string | null;
  sipCount: number;
  equityPct: number;
  debtPct: number;
  hybridPct: number;
  tier: ClientTier;
  riskProfile: ClientRiskProfile;
  isDormant: boolean;
}

export interface AdvisorySignal {
  id: string;
  type: "rebalance" | "tax_harvest" | "dormancy" | "sip_potential";
  category: "Risk & Allocation" | "Tax Optimization" | "Client Engagement" | "Wealth Velocity";
  severity: "high" | "medium" | "info";
  clientName: string;
  title: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  actionText: string;
}

export interface AmcShare {
  amc: string;
  totalValue: number;
  pct: number;
  clientCount: number;
  schemeCount: number;
  color: string;
}

export interface CapShare {
  category: string;
  totalValue: number;
  pct: number;
  color: string;
  description: string;
}

export interface MonthlyFlow {
  label: string;
  purchases: number;
  redemptions: number;
  netFlow: number;
  transactions: number;
}

export interface SchemePerformance {
  schemeName: string;
  totalValue: number;
  totalInvested: number;
  returnsPercent: number;
  clientCount: number;
  type: "equity" | "debt" | "hybrid";
  amc: string;
}

export interface AdvisorMetrics {
  practiceAum: number;
  netInvested: number;
  totalReturns: number;
  totalSipCount: number;
  hniClients: number;
  premiumClients: number;
  regularClients: number;
  monthlyFlows: MonthlyFlow[];
  totalInflow6M: number;
  totalOutflow6M: number;
  netCashflow6M: number;
  flowRetentionRate: number;
  aumSparkline: number[];
  purchaseSparkline: number[];
  lastActivity: string | null;
  monthlyPurchaseTotal: number;
  monthlyRedemptionTotal: number;
  allFunds: SchemePerformance[];
  topFunds: SchemePerformance[];
  bottomFunds: SchemePerformance[];
  totalEquity: number;
  totalDebt: number;
  totalHybrid: number;
  schemeCount: number;
  unassignedCount: number;
  amcBreakdown: AmcShare[];
  marketCapBreakdown: CapShare[];
  advisorySignals: AdvisorySignal[];
  top1Concentration: number;
  top3Concentration: number;
  avgClientAum: number;
}

