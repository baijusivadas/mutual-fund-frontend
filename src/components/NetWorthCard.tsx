import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNetWorthData } from "@/hooks/useNetWorthData";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Building, Home, Coins, Car, MapPin, CreditCard, Wallet } from "lucide-react";

const formatCurrency = (value: number) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

export function NetWorthCard() {
  const { data, isLoading } = useNetWorthData();

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Net Worth Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const assets = [
    { label: "Portfolio", value: data.portfolio, icon: Wallet, color: "text-primary" },
    { label: "Rental Properties", value: data.rentalProperties, icon: Building, color: "text-chart-2" },
    { label: "Flats", value: data.flats, icon: Home, color: "text-chart-3" },
    { label: "Gold", value: data.gold, icon: Coins, color: "text-chart-4" },
    { label: "Cars", value: data.cars, icon: Car, color: "text-chart-5" },
    { label: "Real Estate", value: data.realEstate, icon: MapPin, color: "text-accent" },
  ];

  return (
    <Card className="col-span-full bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Net Worth Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main Net Worth Display */}
        <div className="flex items-center justify-center gap-4 mb-6 p-6 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Net Worth</p>
            <p className={`text-4xl font-bold ${data.netWorth >= 0 ? "text-success" : "text-destructive"}`}>
              {formatCurrency(data.netWorth)}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              {data.netWorth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className="text-xs text-muted-foreground">
                Assets: {formatCurrency(data.totalAssets)} | Liabilities: {formatCurrency(data.liabilities)}
              </span>
            </div>
          </div>
        </div>

        {/* Asset Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {assets.map((asset) => (
            <div key={asset.label} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <asset.icon className={`h-4 w-4 ${asset.color}`} />
                <span className="text-xs text-muted-foreground">{asset.label}</span>
              </div>
              <p className="text-sm font-semibold">{formatCurrency(asset.value)}</p>
            </div>
          ))}
        </div>

        {/* Liabilities */}
        <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Total Liabilities</span>
            </div>
            <p className="text-sm font-semibold text-destructive">-{formatCurrency(data.liabilities)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
