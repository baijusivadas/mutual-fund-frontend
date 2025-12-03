import { useMemo } from "react";
import { TransactionData } from "@/utils/parseTransactions";
import { calculateXIRR } from "@/lib/xirr";

interface SchemeData {
  schemeName: string;
  totalUnits: number;
  totalInvested: number;
  currentValue: number;
  latestNav: number;
  returns: number;
  returnPercent: number;
  transactions: TransactionData[];
}

export const usePortfolioData = (
  filteredTransactions: TransactionData[],
  isNewUser: boolean
) => {
  const schemeData: SchemeData[] = useMemo(() => {
    const schemes = new Map<string, SchemeData>();

    filteredTransactions.forEach((t) => {
      const existing = schemes.get(t.schemeName);
      const invested = t.transactionType.toLowerCase().includes("redeem") ? -t.value : t.value;
      const units = t.transactionType.toLowerCase().includes("redeem") ? -t.units : t.units;

      if (existing) {
        existing.totalUnits += units;
        existing.totalInvested += invested;
        existing.latestNav = t.nav;
        existing.transactions.push(t);
      } else {
        schemes.set(t.schemeName, {
          schemeName: t.schemeName,
          totalUnits: units,
          totalInvested: invested,
          latestNav: t.nav,
          currentValue: 0,
          returns: 0,
          returnPercent: 0,
          transactions: [t],
        });
      }
    });

    return Array.from(schemes.values())
      .filter((s) => s.totalUnits > 0)
      .map((s) => {
        s.currentValue = s.totalUnits * s.latestNav;
        s.returns = s.currentValue - s.totalInvested;
        s.returnPercent = s.totalInvested > 0 ? (s.returns / s.totalInvested) * 100 : 0;
        return s;
      })
      .sort((a, b) => b.currentValue - a.currentValue);
  }, [filteredTransactions]);

  const totalInvested = useMemo(
    () => (isNewUser ? 0 : schemeData.reduce((sum, s) => sum + s.totalInvested, 0)),
    [schemeData, isNewUser]
  );

  const currentValue = useMemo(
    () => (isNewUser ? 0 : schemeData.reduce((sum, s) => sum + s.currentValue, 0)),
    [schemeData, isNewUser]
  );

  const totalReturns = isNewUser ? 0 : currentValue - totalInvested;
  const roi = isNewUser ? "0.00" : totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : "0.00";

  const xirr = useMemo(() => {
    if (filteredTransactions.length === 0 || isNewUser) return isNewUser ? 0 : null;

    const xirrTransactions = filteredTransactions.map((t) => ({
      date: new Date(t.investmentDate),
      amount: t.transactionType.toLowerCase().includes("redeem") ? t.value : -t.value,
    }));

    if (currentValue > 0) {
      xirrTransactions.push({
        date: new Date(),
        amount: currentValue,
      });
    }

    return calculateXIRR(xirrTransactions);
  }, [filteredTransactions, currentValue, isNewUser]);

  const performanceData = useMemo(() => {
    const monthlyData = new Map<string, number>();
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString("en-US", { month: "short" });
      monthlyData.set(monthKey, 0);
    }

    filteredTransactions.forEach((t) => {
      const date = new Date(t.investmentDate);
      const monthKey = date.toLocaleDateString("en-US", { month: "short" });

      if (monthlyData.has(monthKey)) {
        const currentVal = monthlyData.get(monthKey) || 0;
        const value = t.transactionType.toLowerCase().includes("redeem") ? -t.value : t.value;
        monthlyData.set(monthKey, currentVal + value);
      }
    });

    let cumulative = 0;
    return Array.from(monthlyData.entries()).map(([month, value]) => {
      cumulative += value;
      return { month, value: cumulative };
    });
  }, [filteredTransactions]);

  const portfolioComposition = useMemo(() => {
    const colors = [
      "hsl(var(--success))",
      "hsl(var(--primary))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ];

    const topSchemes = schemeData.slice(0, 5);
    const otherValue = schemeData.slice(5).reduce((sum, s) => sum + s.currentValue, 0);

    const data = topSchemes.map((s, i) => ({
      name: s.schemeName.length > 30 ? s.schemeName.substring(0, 30) + "..." : s.schemeName,
      value: s.currentValue,
      color: colors[i % colors.length],
    }));

    if (otherValue > 0) {
      data.push({ name: "Others", value: otherValue, color: "hsl(var(--muted))" });
    }

    return data;
  }, [schemeData]);

  const recentTransactions = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => new Date(b.investmentDate).getTime() - new Date(a.investmentDate).getTime())
      .slice(0, 5);
  }, [filteredTransactions]);

  const topPerformingFunds = useMemo(() => {
    return schemeData
      .filter((s) => s.returnPercent > 0)
      .sort((a, b) => b.returnPercent - a.returnPercent)
      .slice(0, 4);
  }, [schemeData]);

  return {
    schemeData,
    totalInvested,
    currentValue,
    totalReturns,
    roi,
    xirr,
    performanceData,
    portfolioComposition,
    recentTransactions,
    topPerformingFunds,
  };
};