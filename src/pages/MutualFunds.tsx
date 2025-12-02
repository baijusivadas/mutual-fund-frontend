import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { TrendingUp, Wallet, PieChart, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { TransactionData } from "@/utils/parseTransactions";
import { calculateXIRR } from "@/lib/xirr";
import { useInvestor } from "@/contexts/InvestorContext";

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
    const schemes = new Map<string, {
      schemeName: string;
      totalUnits: number;
      totalInvested: number;
      latestNav: number;
      transactions: TransactionData[];
    }>();

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mutual Funds</h2>
          <p className="text-muted-foreground">Interactive portfolio with XIRR calculations</p>
        </div>

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

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheme Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="pb-3 text-left font-medium">Scheme Name</th>
                    <th className="pb-3 text-right font-medium">Units</th>
                    <th className="pb-3 text-right font-medium">NAV</th>
                    <th className="pb-3 text-right font-medium">Invested</th>
                    <th className="pb-3 text-right font-medium">Current Value</th>
                    <th className="pb-3 text-right font-medium">Returns</th>
                    <th className="pb-3 text-right font-medium">Returns %</th>
                  </tr>
                </thead>
                <tbody>
                  {schemeData.map((scheme, index) => {
                    const currentValue = isNewUser ? 0 : scheme.totalUnits * scheme.latestNav;
                    const returns = isNewUser ? 0 : currentValue - scheme.totalInvested;
                    const returnPercent = isNewUser ? 0 : (scheme.totalInvested > 0 
                      ? ((returns / scheme.totalInvested) * 100) 
                      : 0);

                    return (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-4 text-sm font-medium max-w-md">
                          {scheme.schemeName}
                        </td>
                        <td className="py-4 text-right text-sm">
                          {scheme.totalUnits.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 text-right text-sm font-medium">
                          ₹{scheme.latestNav.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 text-right text-sm">
                          ₹{scheme.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-4 text-right text-sm font-medium">
                          ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-4 text-right">
                          <div className={`text-sm font-medium ${returns >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {returns >= 0 ? '+' : ''}₹{returns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <Badge variant={returns >= 0 ? "default" : "destructive"}>
                            {returns >= 0 ? '+' : ''}{returnPercent.toFixed(2)}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MutualFunds;