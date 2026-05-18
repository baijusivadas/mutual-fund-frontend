import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, ShieldAlert, Target, Calculator, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdvancedDashboardWidgets({ netWorth, totalInvestments }: { netWorth: number; totalInvestments: number }) {

    // Simple risk heuristic
    const riskScore = totalInvestments > (netWorth * 0.7) ? "High" : (totalInvestments > (netWorth * 0.4) ? "Moderate" : "Low");

    // Tax estimation logic
    const estimatedTax = totalInvestments * 0.125; // Example 12.5% LTCG assumption on total investments

    const widgets = [
        {
            title: "AI Portfolio Insights",
            description: "Personalized financial guidance",
            icon: BrainCircuit,
            color: "text-indigo-500",
            bg: "bg-indigo-500/5",
            border: "border-indigo-500/20",
            content: (
                <ul className="space-y-3">
                    {[
                        "Portfolio skewed towards fixed assets. Consider equity diversification.",
                        "Tech sector ETFs showing strong growth potential for Q3.",
                        "Debt-to-asset ratio is healthy (below 30%)."
                    ].map((text, i) => (
                        <li key={i} className="flex gap-3 text-sm text-muted-foreground group">
                            <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-indigo-500/50 group-hover:text-indigo-500 transition-colors" />
                            <span>{text}</span>
                        </li>
                    ))}
                </ul>
            )
        },
        {
            title: "Risk Analysis",
            description: "Portfolio exposure tracking",
            icon: ShieldAlert,
            color: "text-amber-500",
            bg: "bg-amber-500/5",
            border: "border-amber-500/20",
            content: (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                        <span className="text-sm font-semibold">Current Risk Profile</span>
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold",
                            riskScore === 'High' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                        )}>
                            {riskScore} Risk
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Calculated via volatile investment ratio vs overall net worth. Current concentration suggests a {riskScore.toLowerCase()} volatility profile.
                    </p>
                </div>
            )
        },
        {
            title: "Financial Goals",
            description: "Tracking your milestones",
            icon: Target,
            color: "text-cyan-500",
            bg: "bg-cyan-500/5",
            border: "border-cyan-500/20",
            content: (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Retirement Corpus</span>
                            <span className="font-bold text-cyan-600 dark:text-cyan-400">₹5Cr Target</span>
                        </div>
                        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden p-0.5">
                            <div
                                className="h-full bg-cyan-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                style={{ width: `${Math.min((totalInvestments / 50000000) * 100, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            <span>Progress</span>
                            <span>{((totalInvestments / 50000000) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Tax Estimator",
            description: "Potential LTCG liability",
            icon: Calculator,
            color: "text-emerald-500",
            bg: "bg-emerald-500/5",
            border: "border-emerald-500/20",
            content: (
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                        <span className="text-sm font-medium">Estimated Tax</span>
                        <span className="font-bold text-destructive">₹{estimatedTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                        *Rough proxy calculation at 12.5% LTCG. Final liability depends on holding period.
                    </p>
                </div>
            )
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {widgets.map((w, i) => (
                <Card key={i} className={cn("glass-card border-none hover-lift overflow-hidden group", w.bg)}>
                    <CardHeader className="pb-4 relative">
                        <div className={cn("absolute top-4 right-4 p-2 rounded-lg bg-background/50 border shadow-sm group-hover:scale-110 transition-transform")}>
                            <w.icon className={cn("h-5 w-5", w.color)} />
                        </div>
                        <CardTitle className="text-lg font-bold">{w.title}</CardTitle>
                        <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-70">{w.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {w.content}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
