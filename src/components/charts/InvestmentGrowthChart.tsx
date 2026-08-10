import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvestmentGrowthChartProps {
  performanceData: any[];
  timeFilter: "daily" | "weekly" | "monthly" | "yearly";
  setTimeFilter: (v: "daily" | "weekly" | "monthly" | "yearly") => void;
}

export const InvestmentGrowthChart = ({
  performanceData,
  timeFilter,
  setTimeFilter,
}: InvestmentGrowthChartProps) => {
  // Calculate gain/loss stats from performanceData if available
  const initialVal = performanceData.length > 0 ? performanceData[0]?.value || 0 : 0;
  const latestVal = performanceData.length > 0 ? performanceData[performanceData.length - 1]?.value || 0 : 0;
  const netGain = latestVal - initialVal;
  const percentGain = initialVal > 0 ? (netGain / initialVal) * 100 : 0;

  return (
    <Card className="glass-card border border-border/50 rounded-3xl overflow-hidden relative group">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-extrabold tracking-tight">
                Investment Growth
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time portfolio valuation trajectory
              </CardDescription>
            </div>
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border/40 shrink-0 self-start sm:self-auto">
            {(["daily", "weekly", "monthly", "yearly"] as const).map((t) => (
              <Button
                key={t}
                variant={timeFilter === t ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 px-3 text-[11px] font-bold capitalize rounded-xl transition-all",
                  timeFilter === t
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                onClick={() => setTimeFilter(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        {/* Growth Overview Stats Pill Header */}
        {performanceData.length > 0 && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Current Portfolio
              </span>
              <p className="text-xl font-heading font-black tracking-tight text-foreground">
                ₹{latestVal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="h-8 w-px bg-border/60 mx-1" />

            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border",
                  netGain >= 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                )}
              >
                {netGain >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                <span>{netGain >= 0 ? "+" : ""}{percentGain.toFixed(1)}%</span>
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                ({netGain >= 0 ? "+" : ""}₹{Math.abs(netGain).toLocaleString("en-IN", { maximumFractionDigits: 0 })})
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-2">
        {performanceData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
              <XAxis
                dataKey="label"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={25}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
                  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
                  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                  return `₹${value}`;
                }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const val = payload[0].value as number;
                    return (
                      <div className="glass-card p-3 rounded-2xl border border-border/80 shadow-2xl space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {label}
                        </p>
                        <p className="text-sm font-heading font-black text-primary">
                          ₹{val.toLocaleString("en-IN")}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fill="url(#growthGradient)"
                activeDot={{ r: 6, stroke: "hsl(var(--background))", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[260px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Activity className="h-10 w-10 opacity-20" />
            <p className="text-sm font-medium">No performance growth data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
