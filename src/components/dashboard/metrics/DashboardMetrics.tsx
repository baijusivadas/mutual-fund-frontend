import { MetricCard } from "@/components/shared/MetricCard";
import { Wallet, TrendingUp, TrendingDown, Activity, DollarSign, PieChart } from "lucide-react";

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
    const isPositive = parseFloat(roi) >= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
                title="Portfolio Source"
                value={selectedInvestor === "all" ? "All Investors" : selectedInvestor}
                change="Managed Portfolio"
                icon={PieChart}
            />

            <MetricCard
                title="Invested Capital"
                value={`₹${totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                change="Total Principal"
                icon={Wallet}
            />

            <MetricCard
                title="Current Value"
                value={`₹${currentValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                change={currentValue > totalInvested ? "Gaining Value" : "Market Value"}
                changeType={currentValue >= totalInvested ? "positive" : "negative"}
                icon={Activity}
            />

            <MetricCard
                title="Total Returns (ROI)"
                value={`${isPositive ? "+" : ""}${roi}%`}
                change={xirr !== null ? `XIRR: ${xirr.toFixed(2)}%` : "Annualized Returns"}
                changeType={isPositive ? "positive" : "negative"}
                icon={isPositive ? TrendingUp : TrendingDown}
            />
        </div>
    );
};
