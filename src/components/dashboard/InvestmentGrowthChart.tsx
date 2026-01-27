import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { chartTooltipStyle } from "@/components/charts/ChartCard";

interface InvestmentGrowthChartProps {
    performanceData: any[]; // Ideally type this properly based on usePortfolioData
}

export const InvestmentGrowthChart = ({ performanceData }: InvestmentGrowthChartProps) => {
    return (
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
    );
};
