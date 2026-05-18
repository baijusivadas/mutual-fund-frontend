import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNetWorthData } from "@/hooks/useNetWorthData";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Building, Home, Coins, Car, MapPin, CreditCard, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

export function NetWorthChart() {
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
    { label: "Rental Properties", value: data.rentalProperties, icon: Building, color: "text-blue-500" },
    { label: "Flats", value: data.flats, icon: Home, color: "text-indigo-500" },
    { label: "Gold", value: data.gold, icon: Coins, color: "text-amber-500" },
    { label: "Cars", value: data.cars, icon: Car, color: "text-slate-500" },
    { label: "Real Estate", value: data.realEstate, icon: MapPin, color: "text-emerald-500" },
  ];

  return (
    <Card className="col-span-full glass-card border-none overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10">
        <Wallet className="h-32 w-32 -mr-8 -mt-8" />
      </div>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <Wallet className="h-4 w-4 text-primary" />
          Consolidated Net Worth
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main Net Worth Display */}
        <div className="flex flex-col items-center justify-center gap-2 mb-8 p-10 rounded-[2rem] bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">Total Equity</p>
          <p className={`text-6xl font-black tracking-tighter ${data.netWorth >= 0 ? "text-foreground" : "text-destructive"}`}>
            {formatCurrency(data.netWorth)}
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
              data.netWorth >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}>
              {data.netWorth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {data.netWorth >= 0 ? "+4.2%" : "-1.5%"}
            </div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Market Value
            </span>
          </div>
        </div>

        {/* Asset Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {assets.map((asset) => (
            <div key={asset.label} className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-border/50 group/item">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("p-1.5 rounded-lg bg-background border shadow-sm group-hover/item:scale-110 transition-transform")}>
                  <asset.icon className={cn("h-3 w-3", asset.color)} />
                </div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{asset.label}</span>
              </div>
              <p className="text-sm font-black">{formatCurrency(asset.value)}</p>
            </div>
          ))}
        </div>

        {/* Total Assets & Liabilities Summary */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
           <div className="flex-1 p-4 rounded-2xl bg-success/5 border border-success/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <span className="text-xs font-bold text-muted-foreground">Gross Assets</span>
              </div>
              <p className="text-sm font-black text-success">{formatCurrency(data.totalAssets)}</p>
           </div>
           <div className="flex-1 p-4 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-destructive" />
                </div>
                <span className="text-xs font-bold text-muted-foreground">Total Liabilities</span>
              </div>
              <p className="text-sm font-black text-destructive">-{formatCurrency(data.liabilities)}</p>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
