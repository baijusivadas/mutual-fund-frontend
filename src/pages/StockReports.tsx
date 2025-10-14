import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const stockData = {
  reliance: [
    { date: "01 Oct", price: 2420 },
    { date: "02 Oct", price: 2435 },
    { date: "03 Oct", price: 2428 },
    { date: "04 Oct", price: 2445 },
    { date: "05 Oct", price: 2440 },
    { date: "06 Oct", price: 2455 },
    { date: "07 Oct", price: 2450 },
  ],
  hdfc: [
    { date: "01 Oct", price: 1665 },
    { date: "02 Oct", price: 1670 },
    { date: "03 Oct", price: 1668 },
    { date: "04 Oct", price: 1675 },
    { date: "05 Oct", price: 1678 },
    { date: "06 Oct", price: 1682 },
    { date: "07 Oct", price: 1680 },
  ],
  infosys: [
    { date: "01 Oct", price: 1505 },
    { date: "02 Oct", price: 1512 },
    { date: "03 Oct", price: 1508 },
    { date: "04 Oct", price: 1518 },
    { date: "05 Oct", price: 1515 },
    { date: "06 Oct", price: 1522 },
    { date: "07 Oct", price: 1520 },
  ],
};

const stockDetails = [
  {
    name: "Reliance Industries",
    symbol: "RELIANCE",
    sector: "Energy",
    holdings: 250,
    avgPrice: 2350,
    currentPrice: 2450,
    dayChange: "+0.82%",
    weekHigh: 2465,
    weekLow: 2410,
    dataKey: "reliance",
  },
  {
    name: "HDFC Bank",
    symbol: "HDFCBANK",
    sector: "Banking",
    holdings: 180,
    avgPrice: 1620,
    currentPrice: 1680,
    dayChange: "+1.20%",
    weekHigh: 1690,
    weekLow: 1655,
    dataKey: "hdfc",
  },
  {
    name: "Infosys",
    symbol: "INFY",
    sector: "IT",
    holdings: 150,
    avgPrice: 1480,
    currentPrice: 1520,
    dayChange: "-0.26%",
    weekHigh: 1535,
    weekLow: 1502,
    dataKey: "infosys",
  },
];

const StockReports = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Stock Reports</h2>
          <p className="text-muted-foreground">Detailed analysis of individual stocks</p>
        </div>

        <Tabs defaultValue="reliance" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="reliance">Reliance</TabsTrigger>
            <TabsTrigger value="hdfc">HDFC Bank</TabsTrigger>
            <TabsTrigger value="infosys">Infosys</TabsTrigger>
          </TabsList>

          {stockDetails.map((stock) => (
            <TabsContent key={stock.dataKey} value={stock.dataKey} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{stock.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{stock.symbol} • {stock.sector}</p>
                      </div>
                      <Badge 
                        variant={stock.dayChange.startsWith("+") ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {stock.dayChange}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-b pb-4">
                      <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                      <p className="text-3xl font-bold">₹{stock.currentPrice.toLocaleString()}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Holdings</p>
                        <p className="font-bold">{stock.holdings}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Price</p>
                        <p className="font-bold">₹{stock.avgPrice}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Invested</p>
                        <p className="font-bold">₹{((stock.holdings * stock.avgPrice) / 1000).toFixed(0)}K</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t pt-3">
                      <div className="p-3 rounded-lg bg-success/10">
                        <p className="text-xs text-muted-foreground">Week High</p>
                        <p className="text-sm font-bold text-success">₹{stock.weekHigh}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-destructive/10">
                        <p className="text-xs text-muted-foreground">Week Low</p>
                        <p className="text-sm font-bold text-destructive">₹{stock.weekLow}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>P&L Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current Value</span>
                        <span className="text-lg font-bold">₹{(stock.holdings * stock.currentPrice).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Investment</span>
                        <span className="text-lg font-semibold">₹{(stock.holdings * stock.avgPrice).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="border-t-2 pt-4 space-y-3">
                      <div className="p-4 rounded-lg bg-success/10 border-2 border-success/20">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Total P&L</span>
                          <span className="text-2xl font-bold text-success">
                            +₹{(stock.holdings * (stock.currentPrice - stock.avgPrice)).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Return Percentage</span>
                          <Badge variant="default" className="text-sm">
                            +{(((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100).toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>7-Day Price Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stockData[stock.dataKey as keyof typeof stockData]}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis domain={['dataMin - 10', 'dataMax + 10']} className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StockReports;
