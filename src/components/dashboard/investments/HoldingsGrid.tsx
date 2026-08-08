import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Layers, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HoldingsGridProps {
    schemeData: any[];
}

const HoldingsGridComponent = ({ schemeData }: HoldingsGridProps) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Layers className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight">Active Holdings</h2>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Portfolio Breakdown</p>
                    </div>
                </div>
                <Badge variant="secondary" className="px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest bg-muted/50 border-none">
                    {schemeData.length} active schemes
                </Badge>
            </div>

            {schemeData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {schemeData.slice(0, 6).map((scheme, index) => (
                        <Card key={index} className="glass-card border-none hover-lift group cursor-pointer overflow-hidden relative">
                            <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                <TrendingUp className="h-20 w-20" />
                            </div>
                            <CardContent className="p-6">
                                <div className="space-y-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <Badge
                                                className={cn(
                                                    "mb-3 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border-none",
                                                    scheme.schemeName.includes("Equity") ? "bg-primary/10 text-primary" : 
                                                    scheme.schemeName.includes("Debt") ? "bg-amber-500/10 text-amber-600" : 
                                                    "bg-slate-500/10 text-slate-600"
                                                )}
                                            >
                                                {scheme.schemeName.includes("Equity") ? "Equity Fund" : scheme.schemeName.includes("Debt") ? "Debt Fund" : "Hybrid Assets"}
                                            </Badge>
                                            <h3 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{scheme.schemeName}</h3>
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black",
                                            scheme.returns >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                                        )}>
                                            {scheme.returns >= 0 ? "+" : ""}{scheme.returnPercent.toFixed(1)}%
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-muted/20 border border-border/50">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Invested</p>
                                            <p className="text-lg font-black">₹{(scheme.totalInvested / 1000).toFixed(1)}K</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current</p>
                                            <p className="text-lg font-black text-primary">₹{(scheme.currentValue / 1000).toFixed(1)}K</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-tighter">
                                            <span className="text-muted-foreground">Total Unrealized PnL</span>
                                            <span className={scheme.returns >= 0 ? "text-success" : "text-destructive"}>
                                                {scheme.returns >= 0 ? "+" : ""}₹{(scheme.returns / 1000).toFixed(1)}K
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000 ease-out",
                                                    scheme.returns >= 0 ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                                )}
                                                style={{ width: `${Math.min(Math.abs(scheme.returnPercent) * 2, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-center pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest">
                                            View Details <ChevronRight className="h-3 w-3" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center glass-card rounded-[2rem] border-dashed">
                    <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">No active holdings discovered</p>
                </div>
            )}
        </div>
    );
};

export const HoldingsGrid = memo(HoldingsGridComponent);
