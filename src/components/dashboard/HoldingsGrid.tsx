import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HoldingsGridProps {
    schemeData: any[]; // Ideally type this properly
}

export const HoldingsGrid = ({ schemeData }: HoldingsGridProps) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Holdings</CardTitle>
                <Badge variant="outline" className="text-xs">{schemeData.length} Schemes</Badge>
            </CardHeader>
            <CardContent>
                {schemeData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {schemeData.slice(0, 6).map((scheme, index) => (
                            <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                                <CardContent className="p-5">
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <Badge
                                                    variant={scheme.schemeName.includes("Equity") ? "default" : scheme.schemeName.includes("Debt") ? "secondary" : "outline"}
                                                    className="mb-2"
                                                >
                                                    {scheme.schemeName.includes("Equity") ? "Equity" : scheme.schemeName.includes("Debt") ? "Debt" : "Hybrid"}
                                                </Badge>
                                                <h3 className="text-sm font-semibold leading-tight line-clamp-2">{scheme.schemeName}</h3>
                                            </div>
                                            <Badge variant={scheme.returns >= 0 ? "default" : "destructive"} className="text-xs font-bold flex-shrink-0">
                                                {scheme.returns >= 0 ? "+" : ""}{scheme.returnPercent.toFixed(1)}%
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Invested Amount</p>
                                                <p className="text-base font-bold">₹{(scheme.totalInvested / 1000).toFixed(1)}K</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Current Value</p>
                                                <p className="text-base font-bold text-primary">₹{(scheme.currentValue / 1000).toFixed(1)}K</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Returns</span>
                                                <span className={`font-semibold ${scheme.returns >= 0 ? "text-success" : "text-destructive"}`}>
                                                    {scheme.returns >= 0 ? "+" : ""}₹{(scheme.returns / 1000).toFixed(1)}K
                                                </span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${scheme.returns >= 0 ? "bg-success" : "bg-destructive"}`}
                                                    style={{ width: `${Math.min(Math.abs(scheme.returnPercent), 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">No holdings data available</div>
                )}
            </CardContent>
        </Card>
    );
};
