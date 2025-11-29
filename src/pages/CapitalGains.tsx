import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, FileText, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const shortTermGains = [
  { stock: "HDFC Bank", buyDate: "2025-02-15", sellDate: "2025-06-20", buyPrice: 1620, sellPrice: 1680, qty: 30, gain: 1800 },
  { stock: "Wipro", buyDate: "2025-03-10", sellDate: "2025-08-05", buyPrice: 450, sellPrice: 485, qty: 60, gain: 2100 },
  { stock: "Asian Paints", buyDate: "2025-01-20", sellDate: "2025-05-15", buyPrice: 3050, sellPrice: 3150, qty: 25, gain: 2500 },
];

const longTermGains = [
  { stock: "Reliance Industries", buyDate: "2023-05-10", sellDate: "2025-07-15", buyPrice: 2100, sellPrice: 2450, qty: 50, gain: 17500 },
  { stock: "Infosys", buyDate: "2023-08-20", sellDate: "2025-06-10", buyPrice: 1350, sellPrice: 1520, qty: 75, gain: 12750 },
  { stock: "TCS", buyDate: "2023-03-15", sellDate: "2025-09-05", buyPrice: 3500, sellPrice: 3850, qty: 40, gain: 14000 },
];

const CapitalGains = () => {
  const totalShortTerm = shortTermGains.reduce((sum, item) => sum + item.gain, 0);
  const totalLongTerm = longTermGains.reduce((sum, item) => sum + item.gain, 0);
  const shortTermTax = totalShortTerm * 0.15; // 15% STCG tax
  const longTermTax = totalLongTerm * 0.10; // 10% LTCG tax

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Capital Gains</h2>
          <p className="text-muted-foreground">Tax calculation and gains analysis</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Short Term Capital Gains"
            value={`₹${totalShortTerm.toLocaleString()}`}
            change="Holding < 1 year"
            changeType="neutral"
            icon={Calendar}
          />
          <MetricCard
            title="Long Term Capital Gains"
            value={`₹${totalLongTerm.toLocaleString()}`}
            change="Holding > 1 year"
            changeType="positive"
            icon={TrendingUp}
          />
          <MetricCard
            title="STCG Tax (15%)"
            value={`₹${shortTermTax.toLocaleString()}`}
            change="Short term liability"
            changeType="neutral"
            icon={FileText}
          />
          <MetricCard
            title="LTCG Tax (10%)"
            value={`₹${longTermTax.toLocaleString()}`}
            change="Long term liability"
            changeType="neutral"
            icon={DollarSign}
          />
        </div>

        <Tabs defaultValue="shortterm" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="shortterm">Short Term</TabsTrigger>
            <TabsTrigger value="longterm">Long Term</TabsTrigger>
          </TabsList>

          <TabsContent value="shortterm" className="mt-6">
            <div className="space-y-4">
              {shortTermGains.map((trade, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{trade.stock}</h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {trade.qty} shares
                          </Badge>
                          <span>{trade.buyDate} → {trade.sellDate}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Capital Gain</p>
                        <p className="text-2xl font-bold text-success">+₹{trade.gain.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Buy Price</p>
                        <p className="text-sm font-semibold">₹{trade.buyPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sell Price</p>
                        <p className="text-sm font-semibold">₹{trade.sellPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Buy</p>
                        <p className="text-sm font-semibold">₹{(trade.buyPrice * trade.qty).toLocaleString()}</p>
                      </div>
                      <div className="bg-destructive/10 p-2 rounded">
                        <p className="text-xs text-muted-foreground">Tax (15%)</p>
                        <p className="text-sm font-bold text-destructive">₹{(trade.gain * 0.15).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Total Summary */}
              <Card className="border-2 border-primary/30 bg-primary/5">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Short Term Capital Gains</p>
                      <p className="text-3xl font-bold text-success">₹{totalShortTerm.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Total Tax Liability</p>
                      <p className="text-3xl font-bold text-destructive">₹{shortTermTax.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="longterm" className="mt-6">
            <div className="space-y-4">
              {longTermGains.map((trade, index) => (
                <Card key={index} className="border-2 hover:border-success/50 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{trade.stock}</h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <Badge variant="default" className="text-xs">
                            {trade.qty} shares
                          </Badge>
                          <span>{trade.buyDate} → {trade.sellDate}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Capital Gain</p>
                        <p className="text-2xl font-bold text-success">+₹{trade.gain.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Buy Price</p>
                        <p className="text-sm font-semibold">₹{trade.buyPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sell Price</p>
                        <p className="text-sm font-semibold">₹{trade.sellPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Buy</p>
                        <p className="text-sm font-semibold">₹{(trade.buyPrice * trade.qty).toLocaleString()}</p>
                      </div>
                      <div className="bg-destructive/10 p-2 rounded">
                        <p className="text-xs text-muted-foreground">Tax (10%)</p>
                        <p className="text-sm font-bold text-destructive">₹{(trade.gain * 0.10).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Total Summary */}
              <Card className="border-2 border-success/30 bg-success/5">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Long Term Capital Gains</p>
                      <p className="text-3xl font-bold text-success">₹{totalLongTerm.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Total Tax Liability</p>
                      <p className="text-3xl font-bold text-destructive">₹{longTermTax.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CapitalGains;
