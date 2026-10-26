import { useMemo, useState } from "react";
import { isSellTransaction, TransactionData } from "@/utils/parseTransactions";
import { calculateXIRR } from "@/lib/xirr";

export interface SchemeData {
  schemeName: string;
  totalUnits: number;
  totalInvested: number;
  currentValue: number;
  latestNav: number;
  returns: number;
  returnPercent: number;
  transactions: TransactionData[];
}

export const usePortfolioData = (filteredTransactions: TransactionData[], isNewUser: boolean) => {
  const [timeFilter, setTimeFilter] = useState<"daily" | "weekly" | "monthly" | "yearly">(
    "monthly"
  );

  const schemeData: SchemeData[] = useMemo(() => {
    const schemes = new Map<string, SchemeData>();

    // Sort transactions oldest to newest so the last iterated is the latest NAV
    const sortedTx = [...filteredTransactions].sort(
      (a, b) => new Date(a.investmentDate).getTime() - new Date(b.investmentDate).getTime()
    );

    sortedTx.forEach((t) => {
      const existing = schemes.get(t.schemeName);
      const isSell = isSellTransaction(t);
      const invested = isSell ? -t.value : t.value;
      const units = isSell ? -t.units : t.units;

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
  const roi = isNewUser
    ? "0.00"
    : totalInvested > 0
      ? ((totalReturns / totalInvested) * 100).toFixed(2)
      : "0.00";

  const xirr = useMemo(() => {
    if (filteredTransactions.length === 0 || isNewUser) return isNewUser ? 0 : null;

    const xirrTransactions = filteredTransactions.map((t) => ({
      date: new Date(t.investmentDate),
      amount: isSellTransaction(t) ? t.value : -t.value,
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
    if (filteredTransactions.length === 0 || isNewUser) return [];

    const now = new Date();
    interface TimeBucket {
      label: string;
      endDate: Date;
    }
    const buckets: TimeBucket[] = [];

    if (timeFilter === "daily") {
      // Last 14 days
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 23, 59, 59, 999);
        const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        buckets.push({ label, endDate: d });
      }
    } else if (timeFilter === "weekly") {
      // Last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        d.setHours(23, 59, 59, 999);
        const label = `Wk ${d.getDate()} ${d.toLocaleDateString("en-IN", { month: "short" })}`;
        buckets.push({ label, endDate: d });
      }
    } else if (timeFilter === "monthly") {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
        const effectiveDate = i === 0 ? now : d;
        const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        buckets.push({ label, endDate: effectiveDate });
      }
    } else if (timeFilter === "yearly") {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const d = new Date(now.getFullYear() - i, 11, 31, 23, 59, 59, 999);
        const effectiveDate = i === 0 ? now : d;
        const label = (now.getFullYear() - i).toString();
        buckets.push({ label, endDate: effectiveDate });
      }
    }

    // Sort transactions oldest to newest
    const sortedTx = [...filteredTransactions]
      .filter((t) => t.investmentDate)
      .sort((a, b) => new Date(a.investmentDate).getTime() - new Date(b.investmentDate).getTime());

    const result = buckets.map((bucket, bucketIdx) => {
      // Is this the final current bucket?
      const isCurrent = bucketIdx === buckets.length - 1;
      if (isCurrent) {
        return {
          label: bucket.label,
          value: Math.round(currentValue),
          invested: Math.round(totalInvested),
        };
      }

      const txUpToBucket = sortedTx.filter(
        (t) => new Date(t.investmentDate).getTime() <= bucket.endDate.getTime()
      );

      if (txUpToBucket.length === 0) {
        return {
          label: bucket.label,
          value: 0,
          invested: 0,
        };
      }

      // Track units and invested per scheme up to this bucket
      let bucketInvested = 0;
      let bucketValuation = 0;
      const schemeUnits = new Map<string, { units: number; lastNav: number }>();

      for (const t of txUpToBucket) {
        const isSell = isSellTransaction(t);
        const val = isSell ? -t.value : t.value;
        const units = isSell ? -t.units : t.units;
        bucketInvested += val;

        const currentScheme = schemeUnits.get(t.schemeName) || { units: 0, lastNav: t.nav };
        currentScheme.units += units;
        currentScheme.lastNav = t.nav;
        schemeUnits.set(t.schemeName, currentScheme);
      }

      schemeUnits.forEach((data, schemeName) => {
        if (data.units > 0) {
          // If scheme matches global schemeData, interpolate NAV towards latestNav
          const fullScheme = schemeData.find((s) => s.schemeName === schemeName);
          const targetNav = fullScheme ? fullScheme.latestNav : data.lastNav;
          const ratio = (bucketIdx + 1) / buckets.length;
          const estimatedNav = data.lastNav + (targetNav - data.lastNav) * ratio;
          bucketValuation += data.units * estimatedNav;
        }
      });

      return {
        label: bucket.label,
        value: Math.max(0, Math.round(bucketValuation || bucketInvested)),
        invested: Math.max(0, Math.round(bucketInvested)),
      };
    });

    return result;
  }, [filteredTransactions, isNewUser, timeFilter, currentValue, totalInvested, schemeData]);

  // Monthly MIS Data (Inflows and Outflows for the last 6 calendar months)
  const monthlyInvestmentMIS = useMemo(() => {
    const now = new Date();
    const misMonths: { label: string; year: number; month: number; purchases: number; redemptions: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      misMonths.push({
        label,
        year: d.getFullYear(),
        month: d.getMonth(),
        purchases: 0,
        redemptions: 0,
      });
    }

    for (const t of filteredTransactions) {
      if (!t.investmentDate) continue;
      const td = new Date(t.investmentDate);
      const ty = td.getFullYear();
      const tm = td.getMonth();
      const found = misMonths.find((m) => m.year === ty && m.month === tm);
      if (found) {
        if (isSellTransaction(t)) {
          found.redemptions += t.value;
        } else {
          found.purchases += t.value;
        }
      }
    }

    return misMonths.map((m) => ({
      label: m.label,
      value: Math.round(m.purchases),
      purchases: Math.round(m.purchases),
      redemptions: Math.round(m.redemptions),
      net: Math.round(m.purchases - m.redemptions),
    }));
  }, [filteredTransactions]);

  // SIP monthly trend sparkline data (last 6 months)
  const sipMonthlyTrend = useMemo(() => {
    const now = new Date();
    const trends: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ty = d.getFullYear();
      const tm = d.getMonth();
      let monthSip = 0;
      for (const t of filteredTransactions) {
        if (!t.investmentDate) continue;
        const td = new Date(t.investmentDate);
        if (td.getFullYear() === ty && td.getMonth() === tm) {
          if (t.transactionType?.toLowerCase().includes("sip")) {
            monthSip += t.value;
          }
        }
      }
      trends.push(monthSip);
    }
    return trends;
  }, [filteredTransactions]);

  // Dynamic Day & MoM change figures computed from transactions & performance
  const changeMetrics = useMemo(() => {
    if (performanceData.length < 2 || currentValue === 0) {
      return {
        dayChangeStr: "₹0 (0.00%)",
        dayPositive: true,
        momChangeStr: "₹0 (0.00%)",
        momPositive: true,
      };
    }
    const cur = performanceData[performanceData.length - 1].value;
    const prev = performanceData[performanceData.length - 2].value;
    const diff = cur - prev;
    const pct = prev > 0 ? (diff / prev) * 100 : 0;
    const isPos = diff >= 0;

    const formattedDiff = Math.abs(diff) >= 100000
      ? `₹${(Math.abs(diff) / 100000).toFixed(2)}L`
      : `₹${Math.abs(diff).toLocaleString("en-IN")}`;

    const changeStr = `${isPos ? "+" : "-"}${formattedDiff} (${isPos ? "+" : ""}${pct.toFixed(2)}%)`;

    return {
      dayChangeStr: changeStr,
      dayPositive: isPos,
      momChangeStr: changeStr,
      momPositive: isPos,
    };
  }, [performanceData, currentValue]);

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
    monthlyInvestmentMIS,
    sipMonthlyTrend,
    changeMetrics,
    portfolioComposition,
    recentTransactions,
    topPerformingFunds,
    timeFilter,
    setTimeFilter,
  };
};
