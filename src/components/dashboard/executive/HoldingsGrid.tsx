import { memo } from "react";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Layers, ChevronRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface HoldingsGridProps {
    schemeData: any[];
}

const HoldingsGridComponent = ({ schemeData }: HoldingsGridProps) => {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                        <Layers className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Asset Allocation</h2>
                        <h1 className="text-xl font-black text-white tracking-tight uppercase">Active <span className="text-primary">Holdings</span></h1>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 shadow-xl">
                    <Activity className="h-3 w-3 text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{schemeData.length} LIVE SCHEMES</span>
                </div>
            </div>

            {schemeData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {schemeData.slice(0, 6).map((scheme, index) => (
                        <div key={index} className="glass-panel rounded-[2rem] border-none group cursor-pointer overflow-hidden relative transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-all duration-500 pointer-events-none">
                                <TrendingUp className="h-32 w-32 -mr-8 -mt-8" />
                            </div>
                            
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <Badge
                                                className={cn(
                                                    "mb-4 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border-none shadow-sm",
                                                    scheme.schemeName.includes("Equity") ? "bg-blue-500/10 text-blue-400" : 
                                                    scheme.schemeName.includes("Debt") ? "bg-amber-500/10 text-amber-500" : 
                                                    "bg-slate-500/10 text-slate-400"
                                                )}
                                            >
                                                {scheme.schemeName.includes("Equity") ? "Equity Fund" : scheme.schemeName.includes("Debt") ? "Debt Fund" : "Hybrid Assets"}
                                            </Badge>
                                            <h3 className="text-sm font-black text-white leading-relaxed line-clamp-2 group-hover:text-primary transition-colors pr-8">
                                                {scheme.schemeName}
                                            </h3>
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl",
                                            scheme.returns >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                        )}>
                                            {scheme.returns >= 0 ? "+" : ""}{scheme.returnPercent.toFixed(1)}%
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-px bg-white/5 rounded-[1.5rem] border border-white/5 overflow-hidden shadow-inner">
                                        <div className="bg-[#0a0f1d]/50 p-6 flex flex-col gap-1">
                                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Invested Capital</p>
                                            <p className="text-xl font-black text-slate-300">₹{(scheme.totalInvested / 1000).toFixed(1)}K</p>
                                        </div>
                                        <div className="bg-[#0a0f1d]/50 p-6 flex flex-col gap-1 border-l border-white/5">
                                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Current Valuation</p>
                                            <p className="text-xl font-black text-white">₹{(scheme.currentValue / 1000).toFixed(1)}K</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Unrealized PnL</span>
                                            <span className={cn(
                                                "text-[11px] font-black tracking-widest",
                                                scheme.returns >= 0 ? "text-emerald-400" : "text-rose-400"
                                            )}>
                                                {scheme.returns >= 0 ? "+" : ""}₹{(scheme.returns / 1000).toFixed(1)}K
                                            </span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000 ease-out",
                                                    scheme.returns >= 0 ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                                                )}
                                                style={{ width: `${Math.min(Math.abs(scheme.returnPercent) * 2, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-end pt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:text-white">
                                            Execution Details <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center glass-panel rounded-[2.5rem] border-dashed border-white/10 border-2">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center mx-auto mb-6">
                        <Layers className="h-8 w-8 text-slate-700" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">No active entities discovered in portfolio</p>
                </div>
            )}
        </div>
    );
};

export const HoldingsGrid = memo(HoldingsGridComponent);
