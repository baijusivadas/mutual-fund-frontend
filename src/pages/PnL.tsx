import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const monthlyPnL = [
  { month: "Jan", realized: 15000, unrealized: 8000 },
  { month: "Feb", realized: 22000, unrealized: 12000 },
  { month: "Mar", realized: -5000, unrealized: -3000 },
  { month: "Apr", realized: 35000, unrealized: 18000 },
  { month: "May", realized: 28000, unrealized: 15000 },
  { month: "Jun", realized: 42000, unrealized: 22000 },
];

const sectorPnL = [
  { sector: "Banking", value: 85000, color: "hsl(var(--chart-1))" },
  { sector: "IT", value: 65000, color: "hsl(var(--chart-2))" },
  { sector: "Energy", value: 45000, color: "hsl(var(--chart-3))" },
  { sector: "Auto", value: 35000, color: "hsl(var(--chart-4))" },
];

const stockPnL = [
  { stock: "Reliance Industries", invested: 587500, current: 612500, pnl: 25000, pnlPercent: 4.26 },
  { stock: "HDFC Bank", invested: 291600, current: 302400, pnl: 10800, pnlPercent: 3.70 },
  { stock: "ICICI Bank", invested: 170000, current: 184000, pnl: 14000, pnlPercent: 8.24 },
  { stock: "TCS", invested: 300000, current: 308000, pnl: 8000, pnlPercent: 2.67 },
  { stock: "Infosys", invested: 222000, current: 228000, pnl: 6000, pnlPercent: 2.70 },
];

const PnL = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profit & Loss Report</h2>
          <p className="text-muted-foreground">Comprehensive P&L analysis</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Realized P&L"
            value="₹1,37,000"
            change="Booked profits"
            changeType="positive"
            icon={DollarSign}
          />
          <MetricCard
            title="Total Unrealized P&L"
            value="₹72,000"
            change="Current holdings"
            changeType="positive"
            icon={TrendingUp}
          />
          <MetricCard
            title="Overall Return"
            value="21.9%"
            change="Since inception"
            changeType="positive"
            icon={Percent}
          />
          <MetricCard
            title="Best Performer"
            value="ICICI Bank"
            change="+8.24%"
            changeType="positive"
            icon={TrendingUp}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Monthly P&L Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyPnL}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="realized" fill="hsl(var(--primary))" name="Realized P&L" />
                  <Bar dataKey="unrealized" fill="hsl(var(--accent))" name="Unrealized P&L" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Sector-wise P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sectorPnL}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ sector, percent }) => `${sector} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sectorPnL.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Stock-wise P&L</span>
              <Badge variant="outline" className="text-xs">{stockPnL.length} Stocks</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stockPnL.map((stock, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <h3 className="text-base font-bold">{stock.stock}</h3>
                        <Badge 
                          variant={stock.pnl >= 0 ? "default" : "destructive"}
                          className="text-xs font-bold"
                        >
                          {stock.pnl >= 0 ? '+' : ''}{stock.pnlPercent.toFixed(2)}%
                        </Badge>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4 border-t pt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Invested</p>
                          <p className="text-base font-bold">₹{(stock.invested / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Current Value</p>
                          <p className="text-base font-bold text-primary">₹{(stock.current / 1000).toFixed(0)}K</p>
                        </div>
                      </div>

                      {/* P&L Section */}
                      <div className={`p-3 rounded-lg ${stock.pnl >= 0 ? 'bg-success/10' : 'bg-destructive/10'} border-t pt-3`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Total P&L</span>
                          <span className={`text-lg font-bold ${stock.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {stock.pnl >= 0 ? '+' : ''}₹{stock.pnl.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PnL;
