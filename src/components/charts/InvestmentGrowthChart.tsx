import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { chartTooltipStyle } from "@/components/charts/ChartCard";

interface InvestmentGrowthChartProps {
    performanceData: any[];
    timeFilter: "daily" | "weekly" | "monthly" | "yearly";
    setTimeFilter: (v: "daily" | "weekly" | "monthly" | "yearly") => void;
}

export const InvestmentGrowthChart = ({ performanceData, timeFilter, setTimeFilter }: InvestmentGrowthChartProps) => {
    return (
        <Card className="col-span-full xl:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle>Investment Growth</CardTitle>
                    <CardDescription>Track portfolio appreciation over time</CardDescription>
                </div>
                <div className="flex gap-1 bg-muted/50 p-1 rounded-md">
                    {["daily", "weekly", "monthly", "yearly"].map((t) => (
                        <Button
                            key={t}
                            variant={timeFilter === t ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 text-xs capitalize"
                            onClick={() => setTimeFilter(t as any)}
                        >
                            {t}
                        </Button>
                    ))}
                </div>
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
                            <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} minTickGap={30} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={chartTooltipStyle} formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`} />
                            <Area type="monotone" dataKey="value" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">No transaction data available</div>
                )}
            </CardContent>
        </Card>
    );
};
