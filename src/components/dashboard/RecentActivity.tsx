import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface RecentActivityProps {
    recentTransactions: any[];
    topPerformingFunds: any[];
}

export const RecentActivity = ({ recentTransactions, topPerformingFunds }: RecentActivityProps) => {
    return (
        <div className="w-80 space-y-6 min-h-[1328px]">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentTransactions.length > 0 ? (
                        <div className="space-y-4">
                            {recentTransactions.map((txn, index) => (
                                <div key={index} className="border-b border-dashed pb-3 last:border-0">
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {new Date(txn.investmentDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                    <div className="flex items-start gap-3">
                                        <div className={`h-10 w-10 rounded flex items-center justify-center flex-shrink-0 ${txn.transactionType.toLowerCase().includes("redeem") ? "bg-destructive/10" : "bg-success/10"}`}>
                                            <div className={`h-6 w-6 rounded ${txn.transactionType.toLowerCase().includes("redeem") ? "bg-destructive/20" : "bg-success/20"}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{txn.schemeName}</p>
                                            <p className="text-xs text-muted-foreground">₹{txn.value.toLocaleString("en-IN")}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                    {topPerformingFunds.length > 0 ? (
                        <div className="space-y-4">
                            {topPerformingFunds.map((fund, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded bg-success/10 flex items-center justify-center flex-shrink-0">
                                        <TrendingUp className="h-5 w-5 text-success" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{fund.schemeName}</p>
                                        <p className="text-xs text-success font-semibold">+{fund.returnPercent.toFixed(1)}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No top performers yet</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
