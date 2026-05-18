import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    TrendingUp, 
    ArrowUpRight, 
    ArrowDownRight, 
    Activity, 
    Zap, 
    ShieldCheck, 
    Download, 
    RefreshCcw, 
    PlusCircle,
    Target,
    Compass
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
    recentTransactions: any[];
    topPerformingFunds: any[];
}

const RecentActivityComponent = ({ recentTransactions, topPerformingFunds }: RecentActivityProps) => {
    return (
        <div className="space-y-6">
            {/* Quick Actions - NEW */}
            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="glass-card border-none hover:bg-primary/10 hover:text-primary transition-all h-auto py-4 flex-col gap-2 rounded-3xl">
                    <PlusCircle className="h-5 w-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">New Order</span>
                </Button>
                <Button variant="outline" className="glass-card border-none hover:bg-success/10 hover:text-success transition-all h-auto py-4 flex-col gap-2 rounded-3xl">
                    <Download className="h-5 w-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Reports</span>
                </Button>
            </div>

            {/* Portfolio Strategy Widget - NEW */}
            <Card className="glass-card border-none bg-gradient-to-br from-indigo-500/10 to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Compass className="h-12 w-12" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Target className="h-4 w-4 text-indigo-500" />
                        Strategy Stance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Aggressive</span>
                        <span className="text-xs font-bold text-primary uppercase">Balanced</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full relative">
                        <div className="absolute top-1/2 left-[65%] -translate-y-1/2 h-4 w-4 rounded-full bg-primary border-4 border-background shadow-lg shadow-primary/50" />
                        <div className="h-full bg-gradient-to-r from-amber-500 via-primary to-emerald-500 w-full opacity-30 rounded-full" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed font-medium">
                        Your current allocation is leaning towards <span className="text-primary font-bold">Growth</span>. Market sentiment suggests holding for the long term.
                    </p>
                </CardContent>
            </Card>

            {/* Portfolio Health Widget */}
            <Card className="glass-card border-none bg-gradient-to-br from-primary/10 to-transparent">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Portfolio Health
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-2xl font-black">94<span className="text-xs text-muted-foreground ml-1">/100</span></p>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Excellent</p>
                            </div>
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-6 w-6 rounded-full border-2 border-background bg-muted" />
                                ))}
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[94%] shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-card border-none">
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {recentTransactions.length > 0 ? (
                        <div className="space-y-5">
                            {recentTransactions.map((txn, index) => (
                                <div key={index} className="group cursor-pointer">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                            {new Date(txn.investmentDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                                        </p>
                                        <span className={cn(
                                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                            txn.transactionType.toLowerCase().includes("redeem") ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                                        )}>
                                            {txn.transactionType.toLowerCase().includes("redeem") ? "SELL" : "BUY"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                                            txn.transactionType.toLowerCase().includes("redeem") ? "border-destructive/20 bg-destructive/5" : "border-success/20 bg-success/5"
                                        )}>
                                            {txn.transactionType.toLowerCase().includes("redeem") ? <ArrowDownRight className="h-4 w-4 text-destructive" /> : <ArrowUpRight className="h-4 w-4 text-success" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{txn.schemeName}</p>
                                            <p className="text-[11px] text-muted-foreground font-medium">₹{txn.value.toLocaleString("en-IN")}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 opacity-50">
                            <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-xs font-bold uppercase tracking-widest">No activity</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Market Leaders */}
            <Card className="glass-card border-none bg-gradient-to-br from-success/5 to-transparent">
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        Top Performers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {topPerformingFunds.length > 0 ? (
                        <div className="space-y-4">
                            {topPerformingFunds.map((fund, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer border border-transparent hover:border-border/50">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                                            <Activity className="h-4 w-4 text-success" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold truncate">{fund.schemeName}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">Market Leader</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-success">+{fund.returnPercent.toFixed(1)}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center py-8 opacity-50">Evaluating...</p>
                    )}
                </CardContent>
                <div className="p-4 border-t border-border/50 bg-muted/20 text-center">
                   <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-[0.2em] w-full gap-2">
                       Sync Market Data <RefreshCcw className="h-3 w-3" />
                   </Button>
                </div>
            </Card>
        </div>
    );
};

export const RecentActivity = memo(RecentActivityComponent);
