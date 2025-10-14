import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const futuresPositions = [
  {
    contract: "NIFTY 25 DEC FUT",
    qty: 50,
    buyPrice: 24385,
    ltp: 24520,
    lotSize: 50,
    value: 1226000,
    pnl: 6750,
    margin: 125000,
    expiry: "26-Dec-2025",
    type: "Long",
  },
  {
    contract: "BANKNIFTY 25 DEC FUT",
    qty: 25,
    buyPrice: 51850,
    ltp: 52100,
    lotSize: 25,
    value: 1302500,
    pnl: 6250,
    margin: 95000,
    expiry: "26-Dec-2025",
    type: "Long",
  },
  {
    contract: "RELIANCE 26 DEC FUT",
    qty: 250,
    buyPrice: 2440,
    ltp: 2450,
    lotSize: 250,
    value: 612500,
    pnl: 2500,
    margin: 55000,
    expiry: "26-Dec-2025",
    type: "Long",
  },
];

const optionsPositions = [
  {
    contract: "NIFTY 24500 CE",
    qty: 50,
    buyPrice: 125,
    ltp: 148,
    lotSize: 50,
    value: 7400,
    pnl: 1150,
    premium: 6250,
    expiry: "26-Dec-2025",
    type: "Call",
    strike: 24500,
  },
  {
    contract: "NIFTY 24300 PE",
    qty: 50,
    buyPrice: 95,
    ltp: 72,
    lotSize: 50,
    value: 3600,
    pnl: -1150,
    premium: 4750,
    expiry: "26-Dec-2025",
    type: "Put",
    strike: 24300,
  },
  {
    contract: "BANKNIFTY 52000 PE",
    qty: 25,
    buyPrice: 280,
    ltp: 245,
    lotSize: 25,
    value: 6125,
    pnl: -875,
    premium: 7000,
    expiry: "19-Dec-2025",
    type: "Put",
    strike: 52000,
  },
  {
    contract: "BANKNIFTY 53000 CE",
    qty: 25,
    buyPrice: 185,
    ltp: 220,
    lotSize: 25,
    value: 5500,
    pnl: 875,
    premium: 4625,
    expiry: "19-Dec-2025",
    type: "Call",
    strike: 53000,
  },
];

const Derivatives = () => {
  const totalFuturesPnL = futuresPositions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalFuturesMargin = futuresPositions.reduce((sum, pos) => sum + pos.margin, 0);
  const totalOptionsPnL = optionsPositions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalPremiumPaid = optionsPositions.reduce((sum, pos) => sum + pos.premium, 0);
  const totalPositionValue = futuresPositions.reduce((sum, pos) => sum + pos.value, 0) + 
                             optionsPositions.reduce((sum, pos) => sum + pos.value, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Derivatives Trading</h2>
          <p className="text-muted-foreground">Futures & Options positions and analysis</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Position Value"
            value={`₹${(totalPositionValue / 100000).toFixed(2)}L`}
            change="Combined F&O"
            changeType="neutral"
            icon={Activity}
          />
          <MetricCard
            title="Futures P&L"
            value={`₹${totalFuturesPnL.toLocaleString()}`}
            change={`${((totalFuturesPnL / totalFuturesMargin) * 100).toFixed(2)}% return`}
            changeType={totalFuturesPnL >= 0 ? "positive" : "negative"}
            icon={totalFuturesPnL >= 0 ? TrendingUp : TrendingDown}
          />
          <MetricCard
            title="Options P&L"
            value={`₹${totalOptionsPnL.toLocaleString()}`}
            change={`Premium: ₹${totalPremiumPaid.toLocaleString()}`}
            changeType={totalOptionsPnL >= 0 ? "positive" : "negative"}
            icon={totalOptionsPnL >= 0 ? TrendingUp : TrendingDown}
          />
          <MetricCard
            title="Total Margin Used"
            value={`₹${(totalFuturesMargin / 100000).toFixed(2)}L`}
            change="Futures margin"
            changeType="neutral"
            icon={AlertCircle}
          />
        </div>

        <Tabs defaultValue="futures" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="futures">Futures</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <TabsContent value="futures" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {futuresPositions.map((position, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold">{position.contract}</h3>
                            <Badge variant="default" className="text-xs">
                              {position.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {position.expiry}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {position.qty} lots
                            </span>
                          </div>
                        </div>
                        <Badge 
                          variant={position.pnl >= 0 ? "default" : "destructive"}
                          className="text-xs font-bold"
                        >
                          {position.pnl >= 0 ? '+' : ''}₹{position.pnl.toLocaleString()}
                        </Badge>
                      </div>

                      {/* Price Info */}
                      <div className="border-t pt-3">
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-2xl font-bold">₹{position.ltp.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground">LTP</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Buy Price</p>
                            <p className="font-semibold">₹{position.buyPrice.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Value</p>
                            <p className="font-semibold">₹{(position.value / 100000).toFixed(2)}L</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Margin</p>
                            <p className="font-semibold">₹{(position.margin / 1000).toFixed(0)}K</p>
                          </div>
                        </div>
                      </div>

                      {/* P&L Bar */}
                      <div className={`p-3 rounded-lg ${position.pnl >= 0 ? 'bg-success/10' : 'bg-destructive/10'} border-t`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Position P&L</span>
                          <span className={`text-base font-bold ${position.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {position.pnl >= 0 ? '+' : ''}₹{position.pnl.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="options" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {optionsPositions.map((position, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold">{position.contract}</h3>
                            <Badge 
                              variant={position.type === "Call" ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {position.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              Strike: ₹{position.strike.toLocaleString()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {position.expiry}
                            </Badge>
                          </div>
                        </div>
                        <Badge 
                          variant={position.pnl >= 0 ? "default" : "destructive"}
                          className="text-xs font-bold"
                        >
                          {position.pnl >= 0 ? '+' : ''}₹{position.pnl}
                        </Badge>
                      </div>

                      {/* Price Info */}
                      <div className="border-t pt-3">
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-2xl font-bold">₹{position.ltp}</span>
                          <span className="text-sm text-muted-foreground">LTP</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Buy Price</p>
                            <p className="font-semibold">₹{position.buyPrice}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Premium Paid</p>
                            <p className="font-semibold">₹{position.premium.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Quantity</p>
                            <p className="font-semibold">{position.qty} lots</p>
                          </div>
                        </div>
                      </div>

                      {/* P&L Section */}
                      <div className={`p-3 rounded-lg ${position.pnl >= 0 ? 'bg-success/10' : 'bg-destructive/10'} border-t`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Current Value</p>
                            <p className="font-semibold">₹{position.value.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">P&L</p>
                            <p className={`text-base font-bold ${position.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                              {position.pnl >= 0 ? '+' : ''}₹{position.pnl}
                            </p>
                          </div>
                        </div>
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

export default Derivatives;
