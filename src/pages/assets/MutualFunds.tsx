import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/shared/MetricCard";
import { TrendingUp, Wallet, PieChart, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { TransactionData } from "@/utils/parseTransactions";
import { calculateXIRR } from "@/lib/xirr";
import { useInvestor } from "@/contexts/InvestorContext";
import { CommonCard } from "@/components/shared/CommonCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { CommonTable, ColumnConfig } from "@/components/shared/CommonTable";

interface SchemeHolding {
  id: string;
  schemeName: string;
  totalUnits: number;
  totalInvested: number;
  latestNav: number;
  transactions: TransactionData[];
}

const MutualFunds = () => {
  const { filteredTransactions, isNewUser } = useInvestor();

  // Calculate XIRR for the selected investor (zero for new users)
  const xirr = useMemo(() => {
    if (filteredTransactions.length === 0 || isNewUser) return isNewUser ? 0 : null;

    const xirrTransactions = filteredTransactions.map((t) => ({
      date: new Date(t.investmentDate),
      amount: t.transactionType.toLowerCase().includes("redeem") 
        ? t.value 
        : -t.value,
    }));

    // Add current value as final transaction
    const currentValue = filteredTransactions
      .filter((t) => !t.transactionType.toLowerCase().includes("redeem"))
      .reduce((sum, t) => sum + (t.units * t.nav), 0);

    if (currentValue > 0) {
      xirrTransactions.push({
        date: new Date(),
        amount: currentValue,
      });
    }

    return calculateXIRR(xirrTransactions);
  }, [filteredTransactions, isNewUser]);

  // Group by scheme and calculate totals
  const schemeData = useMemo(() => {
    const schemes = new Map<string, SchemeHolding>();

    // Sort transactions oldest to newest so the last iterated is the latest NAV
    const sortedTx = [...filteredTransactions].sort(
      (a, b) => new Date(a.investmentDate).getTime() - new Date(b.investmentDate).getTime()
    );

    sortedTx.forEach((t) => {
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
          id: t.schemeName, // Use scheme name as ID for CommonTable
          schemeName: t.schemeName,
          totalUnits: units,
          totalInvested: invested,
          latestNav: t.nav,
          transactions: [t],
        });
      }
    });

    return Array.from(schemes.values()).filter((s) => s.totalUnits > 0);
  }, [filteredTransactions]);

  // For new users, show zero PnL values
  const totalInvested = isNewUser ? 0 : schemeData.reduce((sum, s) => sum + s.totalInvested, 0);
  const totalValue = isNewUser ? 0 : schemeData.reduce((sum, s) => sum + (s.totalUnits * s.latestNav), 0);
  const totalReturns = isNewUser ? 0 : totalValue - totalInvested;
  const overallReturn = isNewUser ? "0.00" : (totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : "0.00");

  // Performance data over time (last 12 months)
  const performanceData = useMemo(() => {
    const monthlyData = new Map<string, number>();
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyData.set(monthKey, 0);
    }

    filteredTransactions.forEach((t) => {
      const date = new Date(t.investmentDate);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (monthlyData.has(monthKey)) {
        const currentValue = monthlyData.get(monthKey) || 0;
        const value = t.transactionType.toLowerCase().includes("redeem") ? -t.value : t.value;
        monthlyData.set(monthKey, currentValue + value);
      }
    });

    let cumulative = 0;
    return Array.from(monthlyData.entries()).map(([month, value]) => {
      cumulative += value;
      return { month, value: cumulative };
    });
  }, [filteredTransactions]);

  const columns: ColumnConfig<SchemeHolding>[] = [
    { key: "schemeName", label: "Scheme Name", sortable: true, className: "font-medium max-w-md" },
    { 
      key: "totalUnits", 
      label: "Units", 
      sortable: true, 
      className: "text-right",
      render: (item) => item.totalUnits.toLocaleString('en-IN', { maximumFractionDigits: 2 })
    },
    { 
      key: "latestNav", 
      label: "NAV", 
      sortable: true, 
      className: "text-right font-medium",
      render: (item) => `₹${item.latestNav.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
    },
    { 
      key: "totalInvested", 
      label: "Invested", 
      sortable: true, 
      className: "text-right",
      render: (item) => `₹${item.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    },
    { 
      key: "currentValue", 
      label: "Current Value", 
      sortable: true, 
      className: "text-right font-medium",
      render: (item) => `₹${(item.totalUnits * item.latestNav).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    },
    { 
      key: "returns", 
      label: "Returns", 
      sortable: true, 
      className: "text-right",
      render: (item) => {
        const returns = (item.totalUnits * item.latestNav) - item.totalInvested;
        return (
          <div className={`text-sm font-medium ${returns >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {returns >= 0 ? '+' : ''}₹{returns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        );
      }
    },
    { 
      key: "returnPercent", 
      label: "Returns %", 
      sortable: true, 
      className: "text-right",
      render: (item) => {
        const returns = (item.totalUnits * item.latestNav) - item.totalInvested;
        const returnPercent = item.totalInvested > 0 ? ((returns / item.totalInvested) * 100) : 0;
        return (
          <Badge variant={returns >= 0 ? "default" : "destructive"}>
            {returns >= 0 ? '+' : ''}{returnPercent.toFixed(2)}%
          </Badge>
        );
      }
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title="Mutual Funds" 
        description="Interactive portfolio with XIRR calculations" 
      />

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Investment"
            value={`₹${totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            change={`Across ${schemeData.length} schemes`}
            changeType="neutral"
            icon={Wallet}
          />
          <MetricCard
            title="Current Value"
            value={`₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            change={`${totalReturns >= 0 ? '+' : ''}${overallReturn}% returns`}
            changeType={totalReturns >= 0 ? "positive" : "negative"}
            icon={TrendingUp}
          />
          <MetricCard
            title="Total Returns"
            value={`₹${totalReturns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            change="Absolute gain"
            changeType={totalReturns >= 0 ? "positive" : "negative"}
            icon={PieChart}
          />
          <MetricCard
            title="XIRR"
            value={xirr ? `${xirr.toFixed(2)}%` : "N/A"}
            change="Annualized return"
            changeType={xirr && xirr > 0 ? "positive" : "neutral"}
            icon={Calendar}
          />
        </div>

        <CommonCard title="Portfolio Performance">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CommonCard>

        <CommonCard title="Scheme Holdings">
          <CommonTable<SchemeHolding>
            data={schemeData}
            columns={columns}
            searchPlaceholder="Search schemes..."
            searchKeys={["schemeName"]}
            emptyMessage="No scheme holdings found"
          />
        </CommonCard>
      </div>
    </DashboardLayout>
  );
};

export default MutualFunds;
