import { Card, CardContent } from "@/components/ui/card";

interface DashboardMetricsProps {
    selectedInvestor: string;
    totalInvested: number;
    currentValue: number;
    roi: string;
    xirr: number | null;
}

export const DashboardMetrics = ({
    selectedInvestor,
    totalInvested,
    currentValue,
    roi,
    xirr,
}: DashboardMetricsProps) => {
    return (
        <div className="grid grid-cols-4 gap-4">
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                            {selectedInvestor === "All" ? "All Investors" : selectedInvestor}
                        </p>
                        <p className="text-sm font-medium text-muted-foreground">Portfolio Overview</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Your Investment</p>
                        <p className="text-2xl font-bold">₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Current Value</p>
                        <p className="text-2xl font-bold">₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">ROI</p>
                        <p className={`text-2xl font-bold ${parseFloat(roi) >= 0 ? "text-success" : "text-destructive"}`}>
                            {parseFloat(roi) >= 0 ? "+" : ""}{roi}%
                        </p>
                        {xirr !== null && <p className="text-xs text-muted-foreground">XIRR: {xirr.toFixed(2)}%</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
