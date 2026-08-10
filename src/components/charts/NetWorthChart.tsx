import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNetWorthData } from "@/hooks/useNetWorthData";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Building, Home, Coins, Car, MapPin, CreditCard, Wallet, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (Math.abs(value) >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

export function NetWorthChart() {
  const { data, isLoading } = useNetWorthData();

  if (isLoading) {
    return (
      <Card className="col-span-full glass-card border-none p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!data) return null;

  const assets = [
    { label: "Portfolio", value: data.portfolio, icon: Wallet, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { label: "Rental Properties", value: data.rentalProperties, icon: Building, color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
    { label: "Flats", value: data.flats, icon: Home, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    { label: "Gold", value: data.gold, icon: Coins, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { label: "Cars", value: data.cars, icon: Car, color: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
    { label: "Real Estate", value: data.realEstate, icon: MapPin, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  ];

  const grossAssets = data.totalAssets;
  const netWorth = data.netWorth;
  const liabilities = data.liabilities;

  return (
    <Card className="col-span-full glass-card border border-border/50 rounded-3xl overflow-hidden relative group">
      {/* Background Subtle Watermark */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
        <Wallet className="h-44 w-44 -mr-12 -mt-12 text-foreground" />
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-extrabold tracking-tight">
                Consolidated Net Worth
              </CardTitle>
              <CardDescription className="text-xs">
                Total equity valuation across physical & liquid assets
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Hero Net Worth Card */}
        <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-primary/15 via-blue-500/5 to-indigo-500/10 border border-primary/20 shadow-inner">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Net Equity Valuation
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ArrowUpRight className="h-3 w-3" /> Consolidated
                </span>
              </div>
              <p
                className={cn(
                  "text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight",
                  netWorth >= 0 ? "text-foreground" : "text-destructive"
                )}
              >
                {formatCurrency(netWorth)}
              </p>
            </div>

            {/* Quick Gross vs Liability Summary Pills */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <div className="p-4 rounded-2xl bg-background/80 backdrop-blur-md border border-emerald-500/20 min-w-[140px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Gross Assets
                </span>
                <span className="text-lg font-heading font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(grossAssets)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-background/80 backdrop-blur-md border border-rose-500/20 min-w-[140px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Total Debt
                </span>
                <span className="text-lg font-heading font-extrabold text-rose-600 dark:text-rose-400">
                  -{formatCurrency(liabilities)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Asset Category Breakdown */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Asset Distribution Breakdown
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {assets.map((asset) => {
              const proportion = grossAssets > 0 ? (asset.value / grossAssets) * 100 : 0;
              return (
                <div
                  key={asset.label}
                  className="p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-all border border-border/40 hover:border-primary/30 group/item space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-xl shrink-0 transition-transform group-hover/item:scale-110", asset.color)}>
                      <asset.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-bold truncate text-muted-foreground">
                      {asset.label}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-heading font-extrabold text-foreground truncate">
                      {formatCurrency(asset.value)}
                    </p>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {proportion.toFixed(1)}% of assets
                    </span>
                  </div>

                  {/* Proportion bar */}
                  <div className="h-1 w-full bg-background/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/70 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(proportion, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
