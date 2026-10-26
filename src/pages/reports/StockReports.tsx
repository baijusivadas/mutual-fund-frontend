import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { stockPriceData, stockDetails, StockPriceDataKey } from "@/data/stockData";
import { StockDetailCard } from "@/components/dashboard/investments/StockDetailCard";
import { StockPnLCard } from "@/components/dashboard/investments/StockPnLCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Activity } from "lucide-react";

const StockReports = () => {
  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Stock Reports"
        description="Comprehensive real-time analysis, technical price movements, and position performance"
      />
      <div className="space-y-6">
        <Tabs defaultValue="reliance" className="w-full">
          <TabsList className="grid w-full max-w-xl grid-cols-3 bg-muted/60 p-1 rounded-xl border border-border/50">
            <TabsTrigger value="reliance" className="rounded-lg text-xs font-bold">Reliance</TabsTrigger>
            <TabsTrigger value="hdfc" className="rounded-lg text-xs font-bold">HDFC Bank</TabsTrigger>
            <TabsTrigger value="infosys" className="rounded-lg text-xs font-bold">Infosys</TabsTrigger>
          </TabsList>

          {stockDetails.map((stock) => (
            <TabsContent key={stock.dataKey} value={stock.dataKey} className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <StockDetailCard stock={stock} />
                <StockPnLCard stock={stock} />
              </div>

              <Card className="rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl shadow-sm overflow-hidden">
                <CardHeader className="pb-2 pt-5 px-6">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    7-Day Price Movement Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-6">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart
                      data={stockPriceData[stock.dataKey as StockPriceDataKey]}
                      margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis
                        domain={["dataMin - 10", "dataMax + 10"]}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                        formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Price"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        dot={{ fill: "#3b82f6", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default memo(StockReports);
