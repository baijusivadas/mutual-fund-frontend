import { DashboardLayout } from "@/components/DashboardLayout";
import { SuperAdminCredentials } from "@/components/SuperAdminCredentials";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useInvestor } from "@/contexts/InvestorContext";
import { useMemo } from "react";
import { TransactionData } from "@/utils/parseTransactions";
import { calculateXIRR } from "@/lib/xirr";
import { useAuth } from "@/contexts/AuthContext";

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

const Index = () => {
  const { filteredTransactions, selectedInvestor } = useInvestor();
  const { isSuperAdmin } = useAuth();

  // Group by scheme and calculate totals
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

  const totalInvested = useMemo(() => schemeData.reduce((sum, s) => sum + s.totalInvested, 0), [schemeData]);
  const currentValue = useMemo(() => schemeData.reduce((sum, s) => sum + s.currentValue, 0), [schemeData]);
  const totalReturns = currentValue - totalInvested;
  const roi = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : "0.00";

  // Calculate XIRR
  const xirr = useMemo(() => {
    if (filteredTransactions.length === 0) return null;

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
  }, [filteredTransactions, currentValue]);

  // Performance data over last 6 months
  const performanceData = useMemo(() => {
    const monthlyData = new Map<string, number>();
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyData.set(monthKey, 0);
    }

    filteredTransactions.forEach((t) => {
      const date = new Date(t.investmentDate);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      
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

  // Portfolio composition by top schemes
  const portfolioComposition = useMemo(() => {
    const colors = ["hsl(var(--success))", "hsl(var(--primary))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
    
    const topSchemes = schemeData.slice(0, 5);
    const otherValue = schemeData.slice(5).reduce((sum, s) => sum + s.currentValue, 0);
    
    const data = topSchemes.map((s, i) => ({
      name: s.schemeName.length > 30 ? s.schemeName.substring(0, 30) + "..." : s.schemeName,
      value: s.currentValue,
      color: colors[i % colors.length],
    }));

    if (otherValue > 0) {
      data.push({
        name: "Others",
        value: otherValue,
        color: "hsl(var(--muted))",
      });
    }

    return data;
  }, [schemeData]);

  // Recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => new Date(b.investmentDate).getTime() - new Date(a.investmentDate).getTime())
      .slice(0, 5);
  }, [filteredTransactions]);

  // Top performing funds
  const topPerformingFunds = useMemo(() => {
    return schemeData
      .filter(s => s.returnPercent > 0)
      .sort((a, b) => b.returnPercent - a.returnPercent)
      .slice(0, 4);
  }, [schemeData]);

  return (
    <DashboardLayout>
      {isSuperAdmin && (
        <div className="mb-6">
          <SuperAdminCredentials />
        </div>
      )}
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Top Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {selectedInvestor === "All" ? "All Investors" : selectedInvestor}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">Portfolio Overview</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Your Investment</p>
                  <p className="text-2xl font-bold">₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Current Value</p>
                  <p className="text-2xl font-bold">₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">ROI</p>
                  <p className={`text-2xl font-bold ${parseFloat(roi) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {parseFloat(roi) >= 0 ? '+' : ''}{roi}%
                  </p>
                  {xirr && (
                    <p className="text-xs text-muted-foreground">XIRR: {xirr.toFixed(2)}%</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Investment Growth</CardTitle>
              </CardHeader>
              <CardContent>
                {performanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--success))"
                        strokeWidth={2}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No transaction data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                {portfolioComposition.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={portfolioComposition}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {portfolioComposition.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2 max-h-[100px] overflow-y-auto">
                      {portfolioComposition.map((item, index) => (
                        <div key={index} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-xs truncate">{item.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">₹{item.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No portfolio data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mutual Funds List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Holdings</CardTitle>
              <Badge variant="outline" className="text-xs">
                {schemeData.length} Schemes
              </Badge>
            </CardHeader>
            <CardContent>
              {schemeData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schemeData.slice(0, 6).map((scheme, index) => (
                    <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                      <CardContent className="p-5">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <Badge 
                                variant={scheme.schemeName.includes("Equity") ? "default" : scheme.schemeName.includes("Debt") ? "secondary" : "outline"}
                                className="mb-2"
                              >
                                {scheme.schemeName.includes("Equity") ? "Equity" : scheme.schemeName.includes("Debt") ? "Debt" : "Hybrid"}
                              </Badge>
                              <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                                {scheme.schemeName}
                              </h3>
                            </div>
                            <Badge 
                              variant={scheme.returns >= 0 ? "default" : "destructive"}
                              className="text-xs font-bold flex-shrink-0"
                            >
                              {scheme.returns >= 0 ? '+' : ''}{scheme.returnPercent.toFixed(1)}%
                            </Badge>
                          </div>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Invested Amount</p>
                              <p className="text-base font-bold">
                                ₹{(scheme.totalInvested / 1000).toFixed(1)}K
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Current Value</p>
                              <p className="text-base font-bold text-primary">
                                ₹{(scheme.currentValue / 1000).toFixed(1)}K
                              </p>
                            </div>
                          </div>

                          {/* Return Bar */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Returns</span>
                              <span className={`font-semibold ${scheme.returns >= 0 ? 'text-success' : 'text-destructive'}`}>
                                {scheme.returns >= 0 ? '+' : ''}₹{(scheme.returns / 1000).toFixed(1)}K
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  scheme.returns >= 0 ? 'bg-success' : 'bg-destructive'
                                }`}
                                style={{ 
                                  width: `${Math.min(Math.abs(scheme.returnPercent), 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No holdings data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 space-y-6 min-h-[1328px]">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((txn, index) => (
                    <div key={index} className="border-b border-dashed pb-3 last:border-0">
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(txn.investmentDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded flex items-center justify-center flex-shrink-0 ${
                          txn.transactionType.toLowerCase().includes("redeem") ? "bg-destructive/10" : "bg-success/10"
                        }`}>
                          <div className={`h-6 w-6 rounded ${
                            txn.transactionType.toLowerCase().includes("redeem") ? "bg-destructive/20" : "bg-success/20"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{txn.schemeName}</p>
                          <p className="text-xs text-muted-foreground">₹{txn.value.toLocaleString('en-IN')}</p>
                          <Badge variant={txn.transactionType.toLowerCase().includes("redeem") ? "destructive" : "default"} className="mt-1 text-xs">
                            {txn.transactionType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No recent transactions
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Funds</CardTitle>
            </CardHeader>
            <CardContent>
              {topPerformingFunds.length > 0 ? (
                <div className="space-y-3">
                  {topPerformingFunds.map((fund, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <div className="h-6 w-6 rounded bg-success/20" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fund.schemeName}</p>
                        <p className="text-xs text-success">+{fund.returnPercent.toFixed(2)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No performing funds data
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
