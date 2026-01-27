import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface PortfolioDistributionChartProps {
    portfolioComposition: any[]; // Ideally type this properly
}

export const PortfolioDistributionChart = ({ portfolioComposition }: PortfolioDistributionChartProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
                {portfolioComposition.length > 0 ? (
                    <>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={portfolioComposition} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {portfolioComposition.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2 max-h-[100px] overflow-y-auto">
                            {portfolioComposition.map((item, index) => (
                                <div key={index} className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs truncate">{item.name}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">₹{item.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">No portfolio data available</div>
                )}
            </CardContent>
        </Card>
    );
};
