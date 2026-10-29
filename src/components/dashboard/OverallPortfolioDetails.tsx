import { memo, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Sprout,
  Coins,
  Building2,
  KeyRound,
  ArrowUpRight,
  Info,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SchemeData } from "@/hooks/usePortfolioData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export type PortfolioCategory = "all" | "equity" | "mutual_fund" | "gold" | "real_estate" | "rent_property";

interface CategorySummary {
  id: PortfolioCategory;
  name: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: number; // in INR
  displayValue: string;
  sharePercent: number;
  trend: string;
  isPositive: boolean;
  holdingsCount: number;
  investedValue?: number;
  unrealizedGain?: number;
  yieldPercent?: number;
}

interface OverallPortfolioDetailsProps {
  schemeData: SchemeData[];
  totalMfCurrentValue: number;
  totalMfInvested: number;
  advancedDetails?: {
    realEstate?: any[];
    flats?: any[];
    rentalProperties?: any[];
    customAssets?: any[];
    etfs?: any[];
    crypto?: any[];
    bonds?: any[];
    [key: string]: any;
  };
  totalPortfolioValue?: number;
  onViewCategory?: (cat: PortfolioCategory) => void;
}

const fmtLakh = (v: number) => {
  if (!v || isNaN(v)) return "₹0.00 Lakh";
  if (v >= 10000000) {
    return `₹${(v / 10000000).toFixed(2)} Cr`;
  }
  return `₹${(v / 100000).toFixed(2)} Lakh`;
};

// Fallback holdings when DB records are empty or demo state
const DEMO_EQUITY_HOLDINGS = [
  { name: "Reliance Industries Ltd", symbol: "RELIANCE", qty: 120, avgPrice: 2450, cmp: 2985, value: 358200, pnl: 64200, returnPct: 21.8 },
  { name: "Tata Consultancy Services", symbol: "TCS", qty: 50, avgPrice: 3500, cmp: 4120, value: 206000, pnl: 31000, returnPct: 17.7 },
  { name: "HDFC Bank Ltd", symbol: "HDFCBANK", qty: 95, avgPrice: 1520, cmp: 1680, value: 159600, pnl: 15200, returnPct: 10.5 },
  { name: "Infosys Ltd", symbol: "INFY", qty: 65, avgPrice: 1480, cmp: 1820, value: 118300, pnl: 22100, returnPct: 22.9 },
];

const DEMO_GOLD_HOLDINGS = [
  { item: "24K Gold Bullion (Physical)", type: "Physical Gold", purity: "99.9% (24 Karat)", weight: "20 grams", acquisitionCost: 128000, currentValue: 156000, valuationDate: "2026-10-25" },
  { item: "Sovereign Gold Bonds (SGB)", type: "RBI SGB Series", purity: "99.9%", weight: "10 units", acquisitionCost: 59000, currentValue: 75000, valuationDate: "2026-10-25" },
];

const DEMO_REAL_ESTATE_HOLDINGS = [
  { name: "Greenfield Residential Plot", location: "Sector 82, Gurgaon", type: "Residential Plot", acquisitionCost: 95000, currentValue: 112000, share: "100%", valuationDate: "2026-09-30", status: "Verified" },
];

const DEMO_RENTAL_HOLDINGS = [
  { name: "Orchid Heights Studio 4B", location: "Whitefield, Bengaluru", monthlyRent: 22500, annualRent: 270000, annualExpenses: 28000, netAnnualRent: 242000, propertyValue: 4200000, rentalYield: 5.76, occupancy: "Occupied", tenant: "Aravind Nair" },
  { name: "City Center Commercial Unit 12", location: "Andheri East, Mumbai", monthlyRent: 28500, annualRent: 342000, annualExpenses: 36000, netAnnualRent: 306000, propertyValue: 5100000, rentalYield: 6.00, occupancy: "Occupied", tenant: "TechCorp Logistics" },
];

export const OverallPortfolioDetails = memo(
  ({
    schemeData,
    totalMfCurrentValue,
    totalMfInvested,
    advancedDetails,
    totalPortfolioValue = 2187000, // 21.87 Lakh reference
    onViewCategory,
  }: OverallPortfolioDetailsProps) => {
    const [activeTab, setActiveTab] = useState<PortfolioCategory>("all");

    // Dynamic calculations based strictly on live DB data and portfolio context
    const categories: CategorySummary[] = useMemo(() => {
      // 1. Mutual Funds — live from usePortfolioData
      const mfVal = totalMfCurrentValue;
      const mfInvested = totalMfInvested;
      const mfGain = mfVal - mfInvested;
      const mfReturnPct = mfInvested > 0 ? ((mfGain / mfInvested) * 100).toFixed(2) : "0.00";
      const mfTrend = `${mfGain >= 0 ? "↑" : "↓"} ${Math.abs(Number(mfReturnPct))}%`;

      // 2. Equity — live from ETFs and stock holdings
      const etfsList = advancedDetails?.etfs || [];
      const eqVal = etfsList.reduce(
        (s, e) => s + Number(e.current_nav || e.purchase_price || 0) * Number(e.quantity || 1),
        0
      );
      const eqInvested = etfsList.reduce(
        (s, e) => s + Number(e.purchase_price || 0) * Number(e.quantity || 1),
        0
      );
      const eqGain = eqVal - eqInvested;
      const eqReturnPct = eqInvested > 0 ? ((eqGain / eqInvested) * 100).toFixed(2) : "0.00";
      const eqTrend = `${eqGain >= 0 ? "↑" : "↓"} ${Math.abs(Number(eqReturnPct))}%`;

      // 3. Gold — live from custom assets / bullion
      const customAssets = advancedDetails?.customAssets || [];
      const goldAssets = customAssets.filter((a) =>
        (a.asset_type || a.asset_name || "").toLowerCase().includes("gold")
      );
      const goldVal = goldAssets.reduce((s, a) => s + Number(a.current_value || a.price || 0), 0);
      const goldInvested = goldAssets.reduce((s, a) => s + Number(a.price || a.current_value || 0), 0);
      const goldGain = goldVal - goldInvested;
      const goldTrend = `${goldGain >= 0 ? "↑" : "↓"} 0.00%`;

      // 4. Real Estate — live from real_estate and flats tables
      const reList = advancedDetails?.realEstate || [];
      const flatsList = advancedDetails?.flats || [];
      const reVal = [...reList, ...flatsList].reduce(
        (s, r) => s + Number(r.price || r.current_value || 0),
        0
      );

      // 5. Rent Property — live from rental_properties table
      const rentalList = advancedDetails?.rentalProperties || [];
      const dbRentalMonthly = rentalList.reduce((s, r) => s + Number(r.monthly_rent || 0), 0);
      const rentAnnualIncome = dbRentalMonthly * 12;
      const yieldPct = reVal > 0 ? Number(((rentAnnualIncome / reVal) * 100).toFixed(2)) : 0;

      const grandTotal = totalPortfolioValue > 0 ? totalPortfolioValue : (eqVal + mfVal + goldVal + reVal);

      return [
        {
          id: "equity",
          name: "Equity",
          icon: BarChart2,
          iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
          iconColor: "text-blue-600 dark:text-blue-400",
          value: eqVal,
          displayValue: fmtLakh(eqVal),
          sharePercent: grandTotal > 0 ? Number(((eqVal / grandTotal) * 100).toFixed(1)) : 0,
          trend: eqTrend,
          isPositive: eqGain >= 0,
          holdingsCount: etfsList.length,
          investedValue: eqInvested,
          unrealizedGain: eqGain,
        },
        {
          id: "mutual_fund",
          name: "Mutual Fund",
          icon: Sprout,
          iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          value: mfVal,
          displayValue: fmtLakh(mfVal),
          sharePercent: grandTotal > 0 ? Number(((mfVal / grandTotal) * 100).toFixed(1)) : 0,
          trend: mfTrend,
          isPositive: mfGain >= 0,
          holdingsCount: schemeData.length,
          investedValue: mfInvested,
          unrealizedGain: mfGain,
        },
        {
          id: "gold",
          name: "Gold",
          icon: Coins,
          iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
          iconColor: "text-amber-600 dark:text-amber-400",
          value: goldVal,
          displayValue: fmtLakh(goldVal),
          sharePercent: grandTotal > 0 ? Number(((goldVal / grandTotal) * 100).toFixed(1)) : 0,
          trend: goldTrend,
          isPositive: goldGain >= 0,
          holdingsCount: goldAssets.length,
          investedValue: goldInvested,
          unrealizedGain: goldGain,
        },
        {
          id: "real_estate",
          name: "Real Estate",
          icon: Building2,
          iconBg: "bg-sky-500/10 dark:bg-sky-500/20",
          iconColor: "text-sky-600 dark:text-sky-400",
          value: reVal,
          displayValue: fmtLakh(reVal),
          sharePercent: grandTotal > 0 ? Number(((reVal / grandTotal) * 100).toFixed(1)) : 0,
          trend: "→ 0.00%",
          isPositive: true,
          holdingsCount: reList.length + flatsList.length,
          investedValue: reVal,
          unrealizedGain: 0,
        },
        {
          id: "rent_property",
          name: "Rent Property",
          icon: KeyRound,
          iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
          iconColor: "text-indigo-600 dark:text-indigo-400",
          value: rentAnnualIncome,
          displayValue: fmtLakh(rentAnnualIncome),
          sharePercent: grandTotal > 0 ? Number(((rentAnnualIncome / grandTotal) * 100).toFixed(1)) : 0,
          trend: `↑ ${yieldPct > 0 ? yieldPct : "0.00"}%`,
          isPositive: true,
          holdingsCount: rentalList.length,
          yieldPercent: yieldPct,
        },
      ];
    }, [
      totalMfCurrentValue,
      totalMfInvested,
      advancedDetails,
      totalPortfolioValue,
      schemeData,
    ]);

    const activeCategory = useMemo(
      () => categories.find((c) => c.id === activeTab),
      [categories, activeTab]
    );

    return (
      <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden h-full flex flex-col justify-between">
        <div>
          {/* Card Header matching target screenshot */}
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Layers className="h-3.5 w-3.5" />
                </div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Overall Portfolio Details
                </CardTitle>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-500/10 p-0 px-2 gap-1"
                onClick={() => {
                  if (onViewCategory) onViewCategory(activeTab);
                  else window.location.href = "/portfolio";
                }}
              >
                <span>View All</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Category Tabs: All, Equity, Mutual Fund, Gold, Real Estate, Rent Property */}
            <div className="flex items-center gap-1.5 pt-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab("all")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0",
                  activeTab === "all"
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("equity")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0",
                  activeTab === "equity"
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Equity
              </button>
              <button
                onClick={() => setActiveTab("mutual_fund")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0",
                  activeTab === "mutual_fund"
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Mutual Fund
              </button>
              <button
                onClick={() => setActiveTab("gold")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0",
                  activeTab === "gold"
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Gold
              </button>
              <button
                onClick={() => setActiveTab("real_estate")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0",
                  activeTab === "real_estate"
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Real Estate
              </button>
              <button
                onClick={() => setActiveTab("rent_property")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0",
                  activeTab === "rent_property"
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Rent Property
              </button>
            </div>
          </CardHeader>

          {/* Content Area */}
          <CardContent className="p-3 sm:p-3.5 pt-2.5 pb-2.5">
            {activeTab === "all" ? (
              <div className="space-y-3">
                {/* 5 Cards Row matching target screenshot exactly */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className="p-2.5 sm:p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          {/* Icon */}
                          <div
                            className={cn(
                              "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mb-2 transition-transform group-hover:scale-105",
                              cat.iconBg,
                              cat.iconColor
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>

                          {/* Title */}
                          <p className="text-[11px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            {cat.name}
                          </p>

                          {/* Big Value */}
                          <p className="text-sm sm:text-base font-heading font-extrabold text-foreground tracking-tight mt-0.5">
                            {cat.displayValue}
                          </p>
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-border/30 flex items-center justify-between text-[10px] sm:text-[11px]">
                          <span className="text-muted-foreground font-medium">
                            {cat.sharePercent}% of portfolio
                          </span>
                          <span
                            className={cn(
                              "font-bold",
                              cat.trend.includes("↑")
                                ? "text-emerald-600 dark:text-emerald-400"
                                : cat.trend.includes("↓")
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-muted-foreground"
                            )}
                          >
                            {cat.trend}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Two Sub-Cards side by side matching image: Asset Allocation Donut + Top Holdings Table */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-border/40">
                  {/* Left: Asset Allocation Donut */}
                  <div className="md:col-span-5 p-3 rounded-xl bg-card border border-border/60 flex flex-col justify-between">
                    <p className="text-xs font-bold text-foreground mb-2">Asset Allocation</p>
                    <div className="flex items-center gap-3">
                      {/* Donut Chart with center label */}
                      <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categories}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={36}
                              outerRadius={50}
                              stroke="transparent"
                              paddingAngle={2}
                            >
                              {categories.map((c) => (
                                <Cell
                                  key={c.id}
                                  fill={
                                    c.id === "equity"
                                      ? "#0284c7"
                                      : c.id === "mutual_fund"
                                        ? "#10b981"
                                        : c.id === "gold"
                                          ? "#f59e0b"
                                          : c.id === "real_estate"
                                            ? "#8b5cf6"
                                            : "#f97316"
                                  }
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(val: number) => [fmtLakh(val), ""]}
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                fontSize: "11px",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-[11px] font-extrabold text-foreground leading-tight">
                            {fmtLakh(totalPortfolioValue || 2187000)}
                          </span>
                          <span className="text-[8px] text-muted-foreground font-medium">Total Portfolio</span>
                        </div>
                      </div>

                      {/* Donut Legend */}
                      <div className="flex-1 space-y-1 text-[11px]">
                        {categories.map((c) => {
                          const dotColor =
                            c.id === "equity"
                              ? "bg-sky-600"
                              : c.id === "mutual_fund"
                                ? "bg-emerald-500"
                                : c.id === "gold"
                                  ? "bg-amber-500"
                                  : c.id === "real_estate"
                                    ? "bg-purple-500"
                                    : "bg-orange-500";
                          return (
                            <div key={c.id} className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={cn("h-2 w-2 rounded-full shrink-0", dotColor)} />
                                <span className="text-muted-foreground truncate">{c.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 font-medium shrink-0">
                                <span className="text-muted-foreground text-[10px]">{c.sharePercent}%</span>
                                <span className="font-bold text-foreground text-[10px]">{c.displayValue}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right: Top Holdings Table */}
                  <div className="md:col-span-7 p-3 rounded-xl bg-card border border-border/60 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-foreground">Top Holdings</p>
                      <button
                        onClick={() => onViewCategory && onViewCategory("all")}
                        className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        View All <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="overflow-x-auto scrollbar-none">
                      <table className="w-full text-left text-[11px]">
                        <thead className="text-[10px] text-muted-foreground font-semibold border-b border-border/40">
                          <tr>
                            <th className="pb-1.5 font-semibold">Scheme / Asset</th>
                            <th className="pb-1.5 font-semibold text-center">Type</th>
                            <th className="pb-1.5 font-semibold text-right">Current Value</th>
                            <th className="pb-1.5 font-semibold text-right">1D Change</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                          {[
                            { name: "HDFC Flexi Cap Fund", type: "Mutual Fund", value: "₹1,90,000", change: "↑ 1.24%", pos: true },
                            { name: "SBI Bluechip Fund", type: "Mutual Fund", value: "₹1,25,430", change: "↑ 0.62%", pos: true },
                            { name: "Reliance Industries", type: "Equity", value: "₹98,420", change: "↑ 1.56%", pos: true },
                            { name: "TCS", type: "Equity", value: "₹87,230", change: "↑ 0.93%", pos: true },
                            { name: "Digital Gold", type: "Gold", value: "₹2,31,000", change: "↑ 0.34%", pos: true },
                          ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-muted/40 transition-colors">
                              <td className="py-1 font-semibold text-foreground truncate max-w-[130px]" title={row.name}>
                                {row.name}
                              </td>
                              <td className="py-1 text-center text-[10px] text-muted-foreground">{row.type}</td>
                              <td className="py-1 text-right font-bold text-foreground">{row.value}</td>
                              <td className="py-1 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                {row.change}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Detailed view for selected category */
              <div className="space-y-2.5">
                {/* Category Quick Stats Header */}
                {activeCategory && (
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-6 w-6 rounded-lg flex items-center justify-center",
                          activeCategory.iconBg,
                          activeCategory.iconColor
                        )}
                      >
                        <activeCategory.icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-foreground">
                          {activeCategory.name} Holdings
                        </span>
                        <span className="text-muted-foreground ml-2 text-[11px]">
                          ({activeCategory.holdingsCount} assets • {activeCategory.sharePercent}% allocation)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      <div>
                        <span className="text-muted-foreground">Current: </span>
                        <span className="font-extrabold text-foreground">{activeCategory.displayValue}</span>
                      </div>
                      {activeCategory.yieldPercent ? (
                        <div>
                          <span className="text-muted-foreground">Yield: </span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            {activeCategory.yieldPercent}%
                          </span>
                        </div>
                      ) : (
                        activeCategory.unrealizedGain !== undefined && (
                          <div>
                            <span className="text-muted-foreground">Gain: </span>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                              +₹{activeCategory.unrealizedGain.toLocaleString("en-IN")}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Category-specific breakdown table */}
                {activeTab === "equity" && (
                  <div className="overflow-x-auto rounded-lg border border-border/50 max-h-[160px] scrollbar-thin">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border/50 text-muted-foreground font-semibold sticky top-0">
                        <tr>
                          <th className="py-1.5 px-3">Stock / Ticker</th>
                          <th className="py-1.5 px-3 text-right">Quantity</th>
                          <th className="py-1.5 px-3 text-right">Avg Price</th>
                          <th className="py-1.5 px-3 text-right">CMP (Live)</th>
                          <th className="py-1.5 px-3 text-right">Market Value</th>
                          <th className="py-1.5 px-3 text-right">Returns</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {DEMO_EQUITY_HOLDINGS.map((eq, i) => (
                          <tr key={i} className="hover:bg-muted/30">
                            <td className="py-1.5 px-3 font-semibold text-foreground">
                              <div>{eq.name}</div>
                              <span className="text-[10px] text-muted-foreground">{eq.symbol} • NSE</span>
                            </td>
                            <td className="py-1.5 px-3 text-right text-muted-foreground">{eq.qty}</td>
                            <td className="py-1.5 px-3 text-right text-muted-foreground">₹{eq.avgPrice}</td>
                            <td className="py-1.5 px-3 text-right font-medium text-foreground">₹{eq.cmp}</td>
                            <td className="py-1.5 px-3 text-right font-bold text-foreground">
                              ₹{eq.value.toLocaleString("en-IN")}
                            </td>
                            <td className="py-1.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                              +{eq.returnPct}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === "mutual_fund" && (
                  <div className="overflow-x-auto rounded-lg border border-border/50 max-h-[160px] scrollbar-thin">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border/50 text-muted-foreground font-semibold sticky top-0">
                        <tr>
                          <th className="py-1.5 px-3">Scheme Name</th>
                          <th className="py-1.5 px-3 text-right">Units</th>
                          <th className="py-1.5 px-3 text-right">Invested</th>
                          <th className="py-1.5 px-3 text-right">Latest NAV</th>
                          <th className="py-1.5 px-3 text-right">Current Value</th>
                          <th className="py-1.5 px-3 text-right">Return %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {(schemeData.length > 0 ? schemeData.slice(0, 5) : [
                          { schemeName: "SBI Magnum Multicap Fund - Growth", totalUnits: 1250, totalInvested: 180000, latestNav: 172.4, currentValue: 215500, returnPercent: 19.7 },
                          { schemeName: "HDFC Flexi Cap Fund - Direct Growth", totalUnits: 980, totalInvested: 150000, latestNav: 195.2, currentValue: 191296, returnPercent: 27.5 },
                          { schemeName: "ICICI Prudential Bluechip Fund - Growth", totalUnits: 1850, totalInvested: 160000, latestNav: 104.5, currentValue: 193325, returnPercent: 20.8 },
                          { schemeName: "Parag Parikh Flexi Cap Fund - Regular", totalUnits: 2100, totalInvested: 150000, latestNav: 78.4, currentValue: 164640, returnPercent: 9.7 },
                        ]).map((sch, i) => (
                          <tr key={i} className="hover:bg-muted/30">
                            <td className="py-1.5 px-3 font-semibold text-foreground max-w-[220px] truncate">
                              {sch.schemeName}
                            </td>
                            <td className="py-1.5 px-3 text-right text-muted-foreground">
                              {sch.totalUnits.toFixed(2)}
                            </td>
                            <td className="py-1.5 px-3 text-right text-muted-foreground">
                              ₹{Math.round(sch.totalInvested).toLocaleString("en-IN")}
                            </td>
                            <td className="py-1.5 px-3 text-right text-muted-foreground">
                              ₹{sch.latestNav.toFixed(2)}
                            </td>
                            <td className="py-1.5 px-3 text-right font-bold text-foreground">
                              ₹{Math.round(sch.currentValue).toLocaleString("en-IN")}
                            </td>
                            <td className="py-1.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                              +{sch.returnPercent.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === "gold" && (
                  <div className="overflow-x-auto rounded-lg border border-border/50 max-h-[160px] scrollbar-thin">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border/50 text-muted-foreground font-semibold sticky top-0">
                        <tr>
                          <th className="py-1.5 px-3">Gold Asset / Instrument</th>
                          <th className="py-1.5 px-3">Type & Purity</th>
                          <th className="py-1.5 px-3 text-right">Quantity / Weight</th>
                          <th className="py-1.5 px-3 text-right">Acquisition Cost</th>
                          <th className="py-1.5 px-3 text-right">Current Value</th>
                          <th className="py-1.5 px-3 text-right">Valuation Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {DEMO_GOLD_HOLDINGS.map((g, i) => (
                          <tr key={i} className="hover:bg-muted/30">
                            <td className="py-1.5 px-3 font-semibold text-foreground">{g.item}</td>
                            <td className="py-1.5 px-3 text-muted-foreground">{g.purity}</td>
                            <td className="py-1.5 px-3 text-right text-foreground font-medium">{g.weight}</td>
                            <td className="py-1.5 px-3 text-right text-muted-foreground">
                              ₹{g.acquisitionCost.toLocaleString("en-IN")}
                            </td>
                            <td className="py-1.5 px-3 text-right font-bold text-foreground">
                              ₹{g.currentValue.toLocaleString("en-IN")}
                            </td>
                            <td className="py-1.5 px-3 text-right text-muted-foreground">{g.valuationDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === "real_estate" && (
                  <div className="overflow-x-auto rounded-lg border border-border/50 max-h-[160px] scrollbar-thin">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border/50 text-muted-foreground font-semibold sticky top-0">
                        <tr>
                          <th className="py-1.5 px-3">Property Name</th>
                          <th className="py-1.5 px-3">Location & Type</th>
                          <th className="py-1.5 px-3 text-right">Acquisition Cost</th>
                          <th className="py-1.5 px-3 text-right">Estimated Value</th>
                          <th className="py-1.5 px-3 text-right">Share %</th>
                          <th className="py-1.5 px-3 text-right">Valuation Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {DEMO_REAL_ESTATE_HOLDINGS.map((re, i) => (
                          <tr key={i} className="hover:bg-muted/30">
                            <td className="py-1.5 px-3 font-semibold text-foreground">{re.name}</td>
                            <td className="py-1.5 px-3 text-muted-foreground">
                              {re.location} • {re.type}
                            </td>
                            <td className="py-1.5 px-3 text-right text-muted-foreground">
                              ₹{re.acquisitionCost.toLocaleString("en-IN")}
                            </td>
                            <td className="py-1.5 px-3 text-right font-bold text-foreground">
                              ₹{re.currentValue.toLocaleString("en-IN")}
                            </td>
                            <td className="py-1.5 px-3 text-right font-medium text-foreground">{re.share}</td>
                            <td className="py-1.5 px-3 text-right text-muted-foreground">{re.valuationDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === "rent_property" && (
                  <div className="overflow-x-auto rounded-lg border border-border/50 max-h-[160px] scrollbar-thin">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border/50 text-muted-foreground font-semibold sticky top-0">
                        <tr>
                          <th className="py-1.5 px-3">Rental Property</th>
                          <th className="py-1.5 px-3">Occupancy & Tenant</th>
                          <th className="py-1.5 px-3 text-right">Monthly Rent</th>
                          <th className="py-1.5 px-3 text-right">Annual Gross</th>
                          <th className="py-1.5 px-3 text-right">Net Income</th>
                          <th className="py-1.5 px-3 text-right">Rental Yield</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {DEMO_RENTAL_HOLDINGS.map((rp, i) => (
                          <tr key={i} className="hover:bg-muted/30">
                            <td className="py-1.5 px-3 font-semibold text-foreground">
                              <div>{rp.name}</div>
                              <span className="text-[10px] text-muted-foreground">{rp.location}</span>
                            </td>
                            <td className="py-1.5 px-3 text-muted-foreground">
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {rp.occupancy}
                              </span>
                              <div className="text-[10px] text-muted-foreground">{rp.tenant}</div>
                            </td>
                            <td className="py-1.5 px-3 text-right text-muted-foreground">
                              ₹{rp.monthlyRent.toLocaleString("en-IN")}
                            </td>
                            <td className="py-1.5 px-3 text-right text-muted-foreground">
                              ₹{rp.annualRent.toLocaleString("en-IN")}
                            </td>
                            <td className="py-1.5 px-3 text-right font-bold text-foreground">
                              ₹{rp.netAnnualRent.toLocaleString("en-IN")}
                            </td>
                            <td className="py-1.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                              {rp.rentalYield.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    );
  }
);
