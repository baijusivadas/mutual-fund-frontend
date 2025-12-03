import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useInvestor } from "@/contexts/InvestorContext";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { chartTooltipStyle } from "@/components/charts/ChartCard";
import { TrendingUp } from "lucide-react";

const Index = () => {
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
                  <p className="text-2xl font-bold">₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Current Value</p>
                  <p className="text-2xl font-bold">₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">ROI</p>
                  <p className={`text-2xl font-bold ${parseFloat(roi) >= 0 ? "text-success" : "text-destructive"}`}>
                    {parseFloat(roi) >= 0 ? "+" : ""}{roi}%
                  </p>
                  {xirr !== null && <p className="text-xs text-muted-foreground">XIRR: {xirr.toFixed(2)}%</p>}
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
                          <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={chartTooltipStyle} formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`} />
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">No transaction data available</div>
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
                        <Pie data={portfolioComposition} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {portfolioComposition.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2 max-h-[100px] overflow-y-auto">
                      {portfolioComposition.map((item, index) => (
                        <div key={index} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-xs truncate">{item.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">₹{item.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">No portfolio data available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Holdings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Holdings</CardTitle>
              <Badge variant="outline" className="text-xs">{schemeData.length} Schemes</Badge>
            </CardHeader>
            <CardContent>
              {schemeData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schemeData.slice(0, 6).map((scheme, index) => (
                    <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                      <CardContent className="p-5">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <Badge
                                variant={scheme.schemeName.includes("Equity") ? "default" : scheme.schemeName.includes("Debt") ? "secondary" : "outline"}
                                className="mb-2"
                              >
                                {scheme.schemeName.includes("Equity") ? "Equity" : scheme.schemeName.includes("Debt") ? "Debt" : "Hybrid"}
                              </Badge>
                              <h3 className="text-sm font-semibold leading-tight line-clamp-2">{scheme.schemeName}</h3>
                            </div>
                            <Badge variant={scheme.returns >= 0 ? "default" : "destructive"} className="text-xs font-bold flex-shrink-0">
                              {scheme.returns >= 0 ? "+" : ""}{scheme.returnPercent.toFixed(1)}%
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Invested Amount</p>
                              <p className="text-base font-bold">₹{(scheme.totalInvested / 1000).toFixed(1)}K</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Current Value</p>
                              <p className="text-base font-bold text-primary">₹{(scheme.currentValue / 1000).toFixed(1)}K</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Returns</span>
                              <span className={`font-semibold ${scheme.returns >= 0 ? "text-success" : "text-destructive"}`}>
                                {scheme.returns >= 0 ? "+" : ""}₹{(scheme.returns / 1000).toFixed(1)}K
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${scheme.returns >= 0 ? "bg-success" : "bg-destructive"}`}
                                style={{ width: `${Math.min(Math.abs(scheme.returnPercent), 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">No holdings data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
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
                        {new Date(txn.investmentDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded flex items-center justify-center flex-shrink-0 ${txn.transactionType.toLowerCase().includes("redeem") ? "bg-destructive/10" : "bg-success/10"}`}>
                          <div className={`h-6 w-6 rounded ${txn.transactionType.toLowerCase().includes("redeem") ? "bg-destructive/20" : "bg-success/20"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{txn.schemeName}</p>
                          <p className="text-xs text-muted-foreground">₹{txn.value.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              {topPerformingFunds.length > 0 ? (
                <div className="space-y-4">
                  {topPerformingFunds.map((fund, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-success/10 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-5 w-5 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fund.schemeName}</p>
                        <p className="text-xs text-success font-semibold">+{fund.returnPercent.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No top performers yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;