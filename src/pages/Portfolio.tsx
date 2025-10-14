import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const equityHoldings = [
  { name: "Reliance Industries", qty: 250, avgPrice: 2350, currentPrice: 2450, value: 612500, pnl: 25000, pnlPercent: 4.26 },
  { name: "HDFC Bank", qty: 180, avgPrice: 1620, currentPrice: 1680, value: 302400, pnl: 10800, pnlPercent: 3.70 },
  { name: "Infosys", qty: 150, avgPrice: 1480, currentPrice: 1520, value: 228000, pnl: 6000, pnlPercent: 2.70 },
  { name: "ICICI Bank", qty: 200, avgPrice: 850, currentPrice: 920, value: 184000, pnl: 14000, pnlPercent: 8.24 },
  { name: "TCS", qty: 80, avgPrice: 3750, currentPrice: 3850, value: 308000, pnl: 8000, pnlPercent: 2.67 },
];

const mutualFunds = [
  { name: "HDFC Flexi Cap Fund", units: 1250, nav: 89.50, value: 111875, invested: 105000, returns: 6875, returnPercent: 6.55 },
  { name: "SBI Small Cap Fund", units: 980, nav: 105.20, value: 103096, invested: 98000, returns: 5096, returnPercent: 5.20 },
  { name: "ICICI Bluechip Fund", units: 1500, nav: 76.80, value: 115200, invested: 112500, returns: 2700, returnPercent: 2.40 },
];

const derivatives = [
  { name: "NIFTY 24500 CE", qty: 50, buyPrice: 125, ltp: 148, value: 7400, pnl: 1150, expiry: "26-Dec-2025" },
  { name: "BANKNIFTY 52000 PE", qty: 25, buyPrice: 280, ltp: 245, value: 6125, pnl: -875, expiry: "19-Dec-2025" },
];

const Portfolio = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
          <p className="text-muted-foreground">Your complete investment portfolio</p>
        </div>

        <Tabs defaultValue="equity" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="equity">Equity</TabsTrigger>
            <TabsTrigger value="mutualfunds">Mutual Funds</TabsTrigger>
            <TabsTrigger value="derivatives">Derivatives</TabsTrigger>
          </TabsList>

          <TabsContent value="equity" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equityHoldings.map((stock, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-bold">{stock.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {stock.qty} shares • Avg ₹{stock.avgPrice.toLocaleString()}
                          </p>
                        </div>
                        <Badge 
                          variant={stock.pnl >= 0 ? "default" : "destructive"}
                          className="text-xs font-bold"
                        >
                          {stock.pnl >= 0 ? '+' : ''}{stock.pnlPercent.toFixed(1)}%
                        </Badge>
                      </div>

                      {/* Current Value */}
                      <div className="flex items-baseline gap-2 border-t pt-3">
                        <span className="text-2xl font-bold">₹{stock.currentPrice.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">LTP</span>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3 border-t pt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Value</p>
                          <p className="text-sm font-bold">₹{(stock.value / 1000).toFixed(1)}K</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total P&L</p>
                          <p className={`text-sm font-bold ${stock.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {stock.pnl >= 0 ? '+' : ''}₹{(stock.pnl / 1000).toFixed(1)}K
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Returns</span>
                          <span className={stock.pnl >= 0 ? 'text-success' : 'text-destructive'}>
                            {stock.pnl >= 0 ? '+' : ''}₹{stock.pnl.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${stock.pnl >= 0 ? 'bg-success' : 'bg-destructive'}`}
                            style={{ width: `${Math.min(Math.abs(stock.pnlPercent) * 10, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mutualfunds" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mutualFunds.map((fund, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold line-clamp-2">{fund.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {fund.units.toLocaleString()} units • NAV ₹{fund.nav}
                          </p>
                        </div>
                        <Badge 
                          variant={fund.returns >= 0 ? "default" : "destructive"}
                          className="text-xs font-bold flex-shrink-0"
                        >
                          {fund.returns >= 0 ? '+' : ''}{fund.returnPercent.toFixed(1)}%
                        </Badge>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-3 border-t pt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Invested</p>
                          <p className="text-base font-bold">₹{(fund.invested / 1000).toFixed(1)}K</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Current Value</p>
                          <p className="text-base font-bold text-primary">₹{(fund.value / 1000).toFixed(1)}K</p>
                        </div>
                      </div>

                      {/* Returns */}
                      <div className="space-y-1.5 border-t pt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Total Returns</span>
                          <span className={`font-semibold ${fund.returns >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {fund.returns >= 0 ? '+' : ''}₹{(fund.returns / 1000).toFixed(1)}K
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${fund.returns >= 0 ? 'bg-success' : 'bg-destructive'}`}
                            style={{ width: `${Math.min(Math.abs(fund.returnPercent), 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="derivatives" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {derivatives.map((contract, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold">{contract.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {contract.expiry}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {contract.qty} lots • Buy ₹{contract.buyPrice}
                          </p>
                        </div>
                        <Badge 
                          variant={contract.pnl >= 0 ? "default" : "destructive"}
                          className="text-xs font-bold"
                        >
                          {contract.pnl >= 0 ? '+' : ''}₹{contract.pnl.toLocaleString()}
                        </Badge>
                      </div>

                      {/* Current Price */}
                      <div className="flex items-baseline gap-2 border-t pt-3">
                        <span className="text-2xl font-bold">₹{contract.ltp}</span>
                        <span className="text-sm text-muted-foreground">LTP</span>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-3 border-t pt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Buy Price</p>
                          <p className="text-sm font-semibold">₹{contract.buyPrice}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Current Value</p>
                          <p className="text-sm font-semibold">₹{contract.value.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* P&L Indicator */}
                      <div className="flex items-center justify-between border-t pt-3">
                        <span className="text-xs text-muted-foreground">P&L</span>
                        <span className={`text-base font-bold ${contract.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {contract.pnl >= 0 ? '+' : ''}₹{contract.pnl.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
