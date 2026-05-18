import { Card, CardContent } from "@/components/ui/card";
import { useNetWorthData } from "@/hooks/useNetWorthData";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Building, Home, Coins, Car, MapPin, CreditCard, Wallet, LayoutGrid } from "lucide-react";
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
      <div className="glass-panel rounded-[2.5rem] p-8 space-y-8 animate-pulse">
        <div className="h-40 bg-white/5 rounded-[2rem]" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const assets = [
    { label: "Portfolio", value: data.portfolio, icon: Wallet, color: "text-blue-400" },
    { label: "Rental Prop", value: data.rentalProperties, icon: Building, color: "text-indigo-400" },
    { label: "Flats", value: data.flats, icon: Home, color: "text-violet-400" },
    { label: "Gold", value: data.gold, icon: Coins, color: "text-amber-400" },
    { label: "Vehicles", value: data.cars, icon: Car, color: "text-slate-400" },
    { label: "Real Estate", value: data.realEstate, icon: MapPin, color: "text-emerald-400" },
  ];

  return (
    <div className="glass-panel rounded-[2.5rem] border-none overflow-hidden relative group animate-in">
      <div className="absolute top-0 right-0 p-12 opacity-5 transition-opacity group-hover:opacity-10 pointer-events-none">
        <LayoutGrid className="h-48 w-48 -mr-12 -mt-12" />
      </div>
      
      <CardContent className="p-8 sm:p-10">
        {/* Main Hub Display */}
        <div className="flex flex-col items-center justify-center gap-4 mb-10 p-12 rounded-[2rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group/hub">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-radial-gradient from-primary/10 to-transparent blur-3xl pointer-events-none" />
          
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] relative z-10">Total Equity Value</p>
          <div className="relative z-10 flex flex-col items-center">
            <p className={cn(
                "text-7xl font-black tracking-tighter text-white drop-shadow-2xl transition-transform duration-500 group-hover/hub:scale-105",
                data.netWorth < 0 && "text-rose-500"
            )}>
                {formatCurrency(data.netWorth)}
            </p>
            <div className="flex items-center gap-4 mt-6">
                <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl",
                data.netWorth >= 0 ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10" : "bg-rose-500/10 text-rose-500 shadow-rose-500/10"
                )}>
                {data.netWorth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {data.netWorth >= 0 ? "+4.2%" : "-1.5%"} <span className="opacity-50">VARIANCE</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Live Market Status
                </div>
            </div>
          </div>
        </div>

        {/* Asset Breakdown Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {assets.map((asset) => (
            <div key={asset.label} className="group/item flex flex-col items-center text-center p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all">
              <div className={cn(
                  "w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center mb-4 shadow-xl transition-all group-hover/item:border-primary/50 group-hover/item:scale-110",
                  asset.color
              )}>
                <asset.icon className="h-4 w-4" />
              </div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{asset.label}</p>
              <p className="text-xs font-black text-white">{formatCurrency(asset.value)}</p>
            </div>
          ))}
        </div>

        {/* Balance Summary Bar */}
        <div className="mt-10 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-10">
                <div className="flex flex-col gap-1">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Gross Capital</p>
                    <p className="text-lg font-black text-emerald-500">{formatCurrency(data.totalAssets)}</p>
                </div>
                <div className="w-px h-8 bg-white/5 hidden md:block" />
                <div className="flex flex-col gap-1">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Total Liability</p>
                    <p className="text-lg font-black text-rose-500">-{formatCurrency(data.liabilities)}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0f1d] bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-500">
                            {i}
                        </div>
                    ))}
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">3 Active Entities Connected</p>
            </div>
        </div>
      </CardContent>
    </div>
  );
}
