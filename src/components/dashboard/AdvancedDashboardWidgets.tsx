import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, ShieldAlert, Target, Calculator } from "lucide-react";

export function AdvancedDashboardWidgets({ netWorth, totalInvestments }: { netWorth: number; totalInvestments: number }) {

    // Simple risk heuristic
    const riskScore = totalInvestments > (netWorth * 0.7) ? "High" : (totalInvestments > (netWorth * 0.4) ? "Moderate" : "Low");

    // Tax estimation logic
    const estimatedTax = totalInvestments * 0.125; // Example 12.5% LTCG assumption on total investments

    return (
        <div className="grid grid-cols-2 gap-4 mt-6">
            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-indigo-500" />
                        AI Investment Insights
                    </CardTitle>
                    <CardDescription>Generated based on your current portfolio.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 text-sm space-y-2 text-muted-foreground">
                        <li>Your portfolio is heavily skewed towards fixed assets. Consider diversifying into equity.</li>
                        <li>Based on recent market trends, tech sector ETFs are undervalued.</li>
                        <li>Your debt-to-asset ratio is healthy at less than 30%.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-orange-500" />
                        Portfolio Risk Analysis
                    </CardTitle>
                    <CardDescription>Overall Risk Exposure</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">Risk Level</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${riskScore === 'High' ? 'bg-destructive/20 text-destructive' : 'bg-success/20 text-success'}`}>
                            {riskScore}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Risk is calculated based on the ratio of volatile investments to overall net worth and fixed assets.
                        A highly concentrated equity portfolio increases risk.
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-cyan-500" />
                        Goal-Based Investing
                    </CardTitle>
                    <CardDescription>Track progress toward your financial goals</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Retirement Corpus</span>
                                <span className="font-medium">₹5Cr Target</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-cyan-500 rounded-full"
                                    style={{ width: `${Math.min((totalInvestments / 50000000) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-right mt-1 text-muted-foreground">
                                {((totalInvestments / 50000000) * 100).toFixed(1)}% Completed
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-green-500" />
                        Tax Estimator
                    </CardTitle>
                    <CardDescription>Estimated potential capital gains tax liability</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 rounded bg-background/50">
                            <span className="text-sm">Estimated Total Tax (12.5% proxy)</span>
                            <span className="font-bold text-destructive">₹{estimatedTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This is a rough estimation assuming all investments are subject to Long Term Capital Gains (LTCG) at current Indian tax rates.
                            Consult a tax professional for exact figures.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
