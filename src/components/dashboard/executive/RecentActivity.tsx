import { memo } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
    recentTransactions: any[];
    topPerformingFunds: any[];
}

const RecentActivityComponent = ({ recentTransactions, topPerformingFunds }: RecentActivityProps) => {
    return (
        <div className="space-y-8">
            {/* Portfolio Health Widget */}
            <div className="glass-panel rounded-[2rem] border-none bg-gradient-to-br from-primary/10 to-transparent overflow-hidden">
                <CardHeader className="pb-4 pt-8 px-8">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
                        <ShieldCheck className="h-4 w-4" />
                        Portfolio Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-4xl font-black text-white">94<span className="text-xs text-slate-500 ml-1">/100</span></p>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-black mt-1">Excellent Integrity</p>
                            </div>
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-8 w-8 rounded-xl border-2 border-[#0a0f1d] bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-500">
                                        USR
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-primary w-[94%] shadow-[0_0_15px_rgba(37,99,235,0.8)] relative">
                                <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-white/20 to-transparent" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                            Asset validation completed. Risk levels are within the executive threshold.
                        </p>
                    </div>
                </CardContent>
            </div>

            {/* Recent Activity */}
            <div className="glass-panel rounded-[2rem] border-none overflow-hidden">
                <CardHeader className="pb-6 pt-8 px-8">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-white">
                        <Zap className="h-4 w-4 text-amber-500" />
                        Live Feed
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    {recentTransactions.length > 0 ? (
                        <div className="space-y-8">
                            {recentTransactions.map((txn, index) => (
                                <div key={index} className="group cursor-pointer relative pl-8">
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-white/5" />
                                    <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-white/10 group-hover:bg-primary transition-colors shadow-[0_0_8px_rgba(37,99,235,0)] group-hover:shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                                    
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">
                                            {new Date(txn.investmentDate).toLocaleDateString("en-US", { day: "numeric", month: "short" }).toUpperCase()}
                                        </p>
                                        <span className={cn(
                                            "text-[8px] font-black px-2 py-0.5 rounded-lg tracking-widest",
                                            txn.transactionType.toLowerCase().includes("redeem") ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                                        )}>
                                            {txn.transactionType.toLowerCase().includes("redeem") ? "SETTLEMENT" : "ACQUISITION"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-300 truncate group-hover:text-white transition-colors">{txn.schemeName}</p>
                                            <p className="text-sm font-black text-white mt-1">₹{txn.value.toLocaleString("en-IN")}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 opacity-50">
                            <Activity className="h-10 w-10 mx-auto mb-4 text-slate-700" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Zero Active Feed</p>
                        </div>
                    )}
                </CardContent>
            </div>

            {/* Market Leaders */}
            <div className="glass-panel rounded-[2rem] border-none bg-gradient-to-br from-emerald-500/5 to-transparent overflow-hidden">
                <CardHeader className="pb-6 pt-8 px-8">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-emerald-500">
                        <TrendingUp className="h-4 w-4" />
                        Alpha Rankings
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    {topPerformingFunds.length > 0 ? (
                        <div className="space-y-4">
                            {topPerformingFunds.map((fund, index) => (
                                <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer border border-white/5">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                            <Activity className="h-5 w-5 text-emerald-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-300 truncate">{fund.schemeName}</p>
                                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Market Benchmark</p>
                                        </div>
                                    </div>
                                    <div className="text-right pl-4">
                                        <p className="text-sm font-black text-emerald-400">+{fund.returnPercent.toFixed(1)}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-700 text-center py-12 italic">Generating Alpha Data...</p>
                    )}
                </CardContent>
            </div>
        </div>
    );
};

export const RecentActivity = memo(RecentActivityComponent);
