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
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SchemeData } from "@/hooks/usePortfolioData";
import type { AdvancedPortfolioData } from "@/hooks/useAdvancedPortfolio";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export type PortfolioCategory = "all" | "equity" | "mutual_fund" | "gold" | "real_estate" | "rent_property";

interface CategorySummary {
  id: PortfolioCategory;
  name: string;
  icon: LucideIcon;
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
  advancedDetails?: AdvancedPortfolioData["details"];
  onViewCategory?: (cat: PortfolioCategory) => void;
}

const fmtLakh = (v: number) => {
  if (!v || isNaN(v)) return "₹0.00 Lakh";
  if (v >= 10000000) {
    return `₹${(v / 10000000).toFixed(2)} Cr`;
  }
  return `₹${(v / 100000).toFixed(2)} Lakh`;
};

const recordText = (record: Record<string, string | number | null | undefined>, ...keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
};

const recordNumber = (record: Record<string, string | number | null | undefined>, ...keys: string[]) => {
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value) && record[key] !== null && record[key] !== undefined && record[key] !== "") {
      return value;
    }
  }
  return 0;
};

export const OverallPortfolioDetails = memo(
  ({
    schemeData,
    totalMfCurrentValue,
    totalMfInvested,
    advancedDetails,
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
        recordText(a, "asset_type", "asset_name").toLowerCase().includes("gold")
      );
      const goldVal = goldAssets.reduce((s, a) => s + recordNumber(a, "current_value", "price"), 0);
      const goldInvested = goldAssets.reduce((s, a) => s + recordNumber(a, "purchase_price", "price"), 0);
      const goldGain = goldVal - goldInvested;
      const goldReturnPct = goldInvested > 0 ? ((goldGain / goldInvested) * 100).toFixed(2) : "0.00";
      const goldTrend = goldInvested > 0 ? `${goldGain >= 0 ? "↑" : "↓"} ${Math.abs(Number(goldReturnPct))}%` : "—";

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

      const grandTotal = eqVal + mfVal + goldVal + reVal + rentAnnualIncome;

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
          trend: "—",
          isPositive: false,
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
          trend: "—",
          isPositive: false,
          holdingsCount: rentalList.length,
        },
      ];
    }, [
      totalMfCurrentValue,
      totalMfInvested,
      advancedDetails,
      schemeData,
    ]);

    const activeCategory = useMemo(
      () => categories.find((c) => c.id === activeTab),
      [categories, activeTab]
    );

    // Dynamic Top Holdings derived from active user portfolio
    const topHoldingsList = useMemo(() => {
      const list: { name: string; type: string; value: string; change: string; pos?: boolean }[] = [];

      // Top Mutual Fund Schemes
      schemeData.slice(0, 4).forEach((s) => {
        list.push({
          name: s.schemeName,
          type: "Mutual Fund",
          value: `₹${Math.round(s.currentValue).toLocaleString("en-IN")}`,
          change: `${s.returns >= 0 ? "↑" : "↓"} ${Math.abs(s.returnPercent).toFixed(2)}%`,
          pos: s.returns >= 0,
        });
      });

      // Equities / ETFs
      const etfs = advancedDetails?.etfs || [];
      etfs.slice(0, 2).forEach((e) => {
        const val = recordNumber(e, "current_nav", "purchase_price") * recordNumber(e, "quantity");
        list.push({
          name: recordText(e, "symbol", "asset_name") || "Equity",
          type: "Equity",
          value: `₹${Math.round(val).toLocaleString("en-IN")}`,
          change: "—",
        });
      });

      // Gold
      const customAssets = advancedDetails?.customAssets || [];
      const gold = customAssets.find((asset) =>
        recordText(asset, "asset_type", "asset_name").toLowerCase().includes("gold")
      );
      if (gold) {
        list.push({
          name: recordText(gold, "asset_name") || "Gold",
          type: "Gold",
          value: `₹${Math.round(recordNumber(gold, "current_value", "price")).toLocaleString("en-IN")}`,
          change: "—",
        });
      }

      return list;
    }, [schemeData, advancedDetails]);

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
                            {fmtLakh(categories.reduce((sum, category) => sum + category.value, 0))}
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
                          {topHoldingsList.length > 0 ? (
                            topHoldingsList.map((row, idx) => (
                              <tr key={idx} className="hover:bg-muted/40 transition-colors">
                                <td className="py-1 font-semibold text-foreground truncate max-w-[130px]" title={row.name}>
                                  {row.name}
                                </td>
                                <td className="py-1 text-center text-[10px] text-muted-foreground">{row.type}</td>
                                <td className="py-1 text-right font-bold text-foreground">{row.value}</td>
                                <td className={cn("py-1 text-right font-bold", row.pos === undefined
                                  ? "text-muted-foreground"
                                  : row.pos
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-rose-600 dark:text-rose-400")}>
                                  {row.change}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-3 text-center text-[10px] text-muted-foreground">
                                No holdings recorded in active portfolio
                              </td>
                            </tr>
                          )}
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
                        {(advancedDetails?.etfs || []).map((equity, index) => {
                          const quantity = recordNumber(equity, "quantity");
                          const averagePrice = recordNumber(equity, "purchase_price");
                          const currentPrice = recordNumber(equity, "current_nav") || averagePrice;
                          const currentValue = currentPrice * quantity;
                          const investedValue = averagePrice * quantity;
                          const returnPct =
                            investedValue > 0 ? ((currentValue - investedValue) / investedValue) * 100 : null;
                          return (
                            <tr key={String(equity.id ?? index)} className="hover:bg-muted/30">
                              <td className="py-1.5 px-3 font-semibold text-foreground">
                                <div>{recordText(equity, "asset_name", "symbol") || "Unnamed asset"}</div>
                                <span className="text-[10px] text-muted-foreground">
                                  {recordText(equity, "symbol")}
                                </span>
                              </td>
                              <td className="py-1.5 px-3 text-right text-muted-foreground">{quantity}</td>
                              <td className="py-1.5 px-3 text-right text-muted-foreground">
                                ₹{averagePrice.toLocaleString("en-IN")}
                              </td>
                              <td className="py-1.5 px-3 text-right font-medium text-foreground">
                                ₹{currentPrice.toLocaleString("en-IN")}
                              </td>
                              <td className="py-1.5 px-3 text-right font-bold text-foreground">
                                ₹{currentValue.toLocaleString("en-IN")}
                              </td>
                              <td className="py-1.5 px-3 text-right font-bold text-muted-foreground">
                                {returnPct === null ? "—" : `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(2)}%`}
                              </td>
                            </tr>
                          );
                        })}
                        {advancedDetails?.etfs?.length === 0 && (
                          <tr><td colSpan={6} className="py-3 text-center text-muted-foreground">No equity holdings recorded.</td></tr>
                        )}
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
                        {schemeData.slice(0, 5).map((sch, i) => (
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
                            <td className={cn("py-1.5 px-3 text-right font-bold", sch.returnPercent >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                              {sch.returnPercent >= 0 ? "+" : ""}{sch.returnPercent.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                        {schemeData.length === 0 && (
                          <tr><td colSpan={6} className="py-3 text-center text-muted-foreground">No mutual fund holdings recorded.</td></tr>
                        )}
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
                        {(advancedDetails?.customAssets || [])
                          .filter((asset) => recordText(asset, "asset_type", "asset_name").toLowerCase().includes("gold"))
                          .map((gold, index) => (
                            <tr key={String(gold.id ?? index)} className="hover:bg-muted/30">
                              <td className="py-1.5 px-3 font-semibold text-foreground">{recordText(gold, "asset_name") || "Unnamed asset"}</td>
                              <td className="py-1.5 px-3 text-muted-foreground">{recordText(gold, "asset_type") || "—"}</td>
                              <td className="py-1.5 px-3 text-right text-foreground font-medium">
                                {recordText(gold, "quantity", "weight") || recordNumber(gold, "quantity", "weight") || "—"}
                              </td>
                              <td className="py-1.5 px-3 text-right text-muted-foreground">₹{recordNumber(gold, "purchase_price", "price").toLocaleString("en-IN")}</td>
                              <td className="py-1.5 px-3 text-right font-bold text-foreground">₹{recordNumber(gold, "current_value", "price").toLocaleString("en-IN")}</td>
                              <td className="py-1.5 px-3 text-right text-muted-foreground">{recordText(gold, "updated_at", "purchase_date") || "—"}</td>
                            </tr>
                          ))}
                        {!(advancedDetails?.customAssets || []).some((asset) =>
                          recordText(asset, "asset_type", "asset_name").toLowerCase().includes("gold")
                        ) && (
                          <tr><td colSpan={6} className="py-3 text-center text-muted-foreground">No gold holdings recorded.</td></tr>
                        )}
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
                          <th className="py-1.5 px-3 text-right">Recorded Value</th>
                          <th className="py-1.5 px-3 text-right">Area</th>
                          <th className="py-1.5 px-3 text-right">Status</th>
                          <th className="py-1.5 px-3 text-right">Updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {[...(advancedDetails?.realEstate || []), ...(advancedDetails?.flats || [])].map((property, index) => (
                          <tr key={String(property.id ?? index)} className="hover:bg-muted/30">
                            <td className="py-1.5 px-3 font-semibold text-foreground">
                              {recordText(property, "property_name", "flat_name") || "Unnamed property"}
                            </td>
                            <td className="py-1.5 px-3 text-muted-foreground">
                              {recordText(property, "location", "property_type") || "—"}
                            </td>
                            <td className="py-1.5 px-3 text-right font-bold text-foreground">
                              ₹{recordNumber(property, "price").toLocaleString("en-IN")}
                            </td>
                            <td className="py-1.5 px-3 text-right text-muted-foreground">
                              {recordNumber(property, "area").toLocaleString("en-IN")}
                            </td>
                            <td className="py-1.5 px-3 text-right font-medium text-foreground">
                              {recordText(property, "status") || "—"}
                            </td>
                            <td className="py-1.5 px-3 text-right text-muted-foreground">
                              {recordText(property, "updated_at", "created_at") || "—"}
                            </td>
                          </tr>
                        ))}
                        {(advancedDetails?.realEstate?.length || 0) + (advancedDetails?.flats?.length || 0) === 0 && (
                          <tr><td colSpan={6} className="py-3 text-center text-muted-foreground">No real estate holdings recorded.</td></tr>
                        )}
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
                          <th className="py-1.5 px-3 text-right">Annual Rent</th>
                          <th className="py-1.5 px-3 text-right">Lease End</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {(advancedDetails?.rentalProperties || []).map((rental, index) => (
                          <tr key={String(rental.id ?? index)} className="hover:bg-muted/30">
                            <td className="py-1.5 px-3 font-semibold text-foreground">
                              <div>{recordText(rental, "property_name") || "Unnamed property"}</div>
                              <span className="text-[10px] text-muted-foreground">{recordText(rental, "location")}</span>
                            </td>
                            <td className="py-1.5 px-3 text-muted-foreground">
                              <span className="font-semibold">{recordText(rental, "status") || "—"}</span>
                              <div className="text-[10px] text-muted-foreground">{recordText(rental, "tenant_name") || "No tenant listed"}</div>
                            </td>
                            <td className="py-1.5 px-3 text-right text-muted-foreground">
                              ₹{recordNumber(rental, "monthly_rent").toLocaleString("en-IN")}
                            </td>
                            <td className="py-1.5 px-3 text-right text-muted-foreground">
                              ₹{(recordNumber(rental, "monthly_rent") * 12).toLocaleString("en-IN")}
                            </td>
                            <td className="py-1.5 px-3 text-right font-bold text-foreground">
                              {recordText(rental, "lease_end_date") || "—"}
                            </td>
                          </tr>
                        ))}
                        {(advancedDetails?.rentalProperties || []).length === 0 && (
                          <tr><td colSpan={5} className="py-3 text-center text-muted-foreground">No rental properties recorded.</td></tr>
                        )}
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
