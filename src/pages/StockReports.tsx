import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { stockPriceData, stockDetails, StockPriceDataKey } from "../data/stockData";
import { TOOLTIP_STYLE } from "../data/chartColors";
import { StockDetailCard } from "../components/StockDetailCard";
import { StockPnLCard } from "../components/StockPnLCard";

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
                <StockDetailCard stock={stock} />
                <StockPnLCard stock={stock} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>7-Day Price Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stockPriceData[stock.dataKey as StockPriceDataKey]}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis domain={['dataMin - 10', 'dataMax + 10']} className="text-xs" />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
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