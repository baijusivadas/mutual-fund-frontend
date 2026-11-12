import { memo, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIndianUnits, formatCompactCurrency } from "@/utils/format";
import { GlassTooltip } from "@/components/charts/GlassTooltip";
import { cn } from "@/lib/utils";
import type { AdvisorMetrics } from "@/types/advisor";
import {
  AreaChart,
  Area,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface CashflowSectionProps {
  metrics: AdvisorMetrics;
}

export const CashflowSection = memo(({ metrics }: CashflowSectionProps) => {
  const [cashflowMode, setCashflowMode] = useState<"dual" | "net">("dual");
  const [allocDimension, setAllocDimension] = useState<"asset" | "marketCap" | "amc">("asset");

  /* ═══ Multi-Dimensional Donut data ══════════════════════════ */
  const donutData = useMemo(() => {
    const tot = metrics.practiceAum || 1;
    if (allocDimension === "asset") {
      const assetTot = metrics.totalEquity + metrics.totalDebt + metrics.totalHybrid || tot;
      return [
        { name: "Equity", value: metrics.totalEquity, color: "#3b82f6", pct: Math.round((metrics.totalEquity / assetTot) * 100) },
        { name: "Debt", value: metrics.totalDebt, color: "#8b5cf6", pct: Math.round((metrics.totalDebt / assetTot) * 100) },
        { name: "Hybrid", value: metrics.totalHybrid, color: "#10b981", pct: Math.round((metrics.totalHybrid / assetTot) * 100) },
      ].filter((d) => d.value > 0);
    }
    if (allocDimension === "marketCap") {
      return metrics.marketCapBreakdown
        .map((m) => ({
          name: m.category,
          value: m.totalValue,
          color: m.color,
          pct: m.pct,
        }))
        .filter((d) => d.value > 0);
    }
    // "amc" dimension: Top 4 AMCs + Grouped Others
    const top4 = metrics.amcBreakdown.slice(0, 4);
    const others = metrics.amcBreakdown.slice(4);
    const othersVal = others.reduce((s, a) => s + a.totalValue, 0);
    const list = top4.map((a) => ({
      name: a.amc,
      value: a.totalValue,
      color: a.color,
      pct: a.pct,
    }));
    if (othersVal > 0) {
      list.push({
        name: "Other AMCs",
        value: othersVal,
        color: "#94a3b8",
        pct: Math.round((othersVal / tot) * 100),
      });
    }
    return list.filter((d) => d.value > 0);
  }, [allocDimension, metrics]);

  return (
    <section id="cashflow-section" className="grid gap-4 xl:grid-cols-12 pt-2">
      {/* Purchase vs Redemption — Upgraded Multi-Mode Card */}
      <Card className="rounded-2xl border-border/50 shadow-sm xl:col-span-8">
        <CardHeader className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2.5 text-[15px] font-bold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BarChart3 className="h-4 w-4" />
              </span>
              Purchase vs Redemption Cashflow
            </CardTitle>
            <p className="mt-1 text-[11px] text-muted-foreground">Monthly capital inflow & outflow breakdown · last 6 months</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Summary Metric Pills */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-border/40 bg-muted/20 px-2.5 py-1 text-[10px] font-semibold">
              <span className="text-muted-foreground">In: <strong className="text-emerald-600 dark:text-emerald-400">+{formatCompactCurrency(metrics.totalInflow6M)}</strong></span>
              <span className="text-border">|</span>
              <span className="text-muted-foreground">Out: <strong className="text-rose-600 dark:text-rose-400">−{formatCompactCurrency(metrics.totalOutflow6M)}</strong></span>
              <span className="text-border">|</span>
              <span className="text-muted-foreground">Net: <strong className={cn(metrics.netCashflow6M >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400")}>{metrics.netCashflow6M >= 0 ? "+" : ""}{formatCompactCurrency(metrics.netCashflow6M)}</strong></span>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-0.5 rounded-xl border border-border/50 bg-muted/30 p-0.5">
              <button
                onClick={() => setCashflowMode("dual")}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-all",
                  cashflowMode === "dual"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Dual Flow
              </button>
              <button
                onClick={() => setCashflowMode("net")}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-all",
                  cashflowMode === "net"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Net Trend
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-1 sm:px-5">
          {cashflowMode === "dual" ? (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={metrics.monthlyFlows} margin={{ top: 8, right: 12, left: -8, bottom: 0 }} barGap={4} barCategoryGap="24%">
                <defs>
                  <linearGradient id="purchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fda4af" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.25)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} dy={6} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={formatCompactCurrency} width={56} />
                <Tooltip content={<GlassTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.2)", radius: 6 }} />
                <Bar dataKey="purchases" name="Purchases" fill="url(#purchGrad)" radius={[4, 4, 0, 0]} maxBarSize={15} />
                <Bar dataKey="redemptions" name="Redemptions" fill="url(#redGrad)" radius={[4, 4, 0, 0]} maxBarSize={15} />
                <Line type="monotone" dataKey="netFlow" name="Net Flow" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3.5, fill: "#2563eb", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={metrics.monthlyFlows} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="netFlowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.25)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} dy={6} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={formatCompactCurrency} width={56} />
                <Tooltip content={<GlassTooltip />} cursor={{ stroke: "#2563eb", strokeDasharray: "3 3" }} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="netFlow" name="Net Flow" stroke="#2563eb" strokeWidth={2.5} fill="url(#netFlowGrad)" dot={{ r: 3.5, fill: "#2563eb" }} activeDot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* Legend & Summary Row */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between border-t border-border/30 pt-2 text-[11px]">
            <div className="flex items-center gap-4">
              {cashflowMode === "dual" ? (
                <>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-400 shadow-sm" /> <span className="text-muted-foreground">Purchases</span></span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-rose-400 shadow-sm" /> <span className="text-muted-foreground">Redemptions</span></span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-sm border-t-2 border-blue-600" /> <span className="text-muted-foreground">Net Flow</span></span>
                </>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-blue-600 shadow-sm" />
                  <span className="text-muted-foreground">Net Capital Expansion Trajectory</span>
                </span>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Flow Retention: <strong className="text-foreground">{metrics.flowRetentionRate}%</strong> of gross purchases
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Allocation Donut — Interactive Multi-Dimensional */}
      <Card className="rounded-2xl border-border/50 shadow-sm xl:col-span-4">
        <CardHeader className="flex flex-col gap-2.5 px-5 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2.5 text-[15px] font-bold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <PieChartIcon className="h-4 w-4" />
              </span>
              Asset Allocation
            </CardTitle>
          </div>
          <div className="flex items-center justify-between gap-1">
            <p className="text-[11px] text-muted-foreground truncate">
              {allocDimension === "asset" && "Equity, Debt & Hybrid mix"}
              {allocDimension === "marketCap" && "Market capitalization exposure"}
              {allocDimension === "amc" && "Exposure across top fund houses"}
            </p>
            <div className="flex items-center gap-0.5 rounded-xl border border-border/50 bg-muted/30 p-0.5 shrink-0">
              <button
                onClick={() => setAllocDimension("asset")}
                className={cn(
                  "rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-all",
                  allocDimension === "asset"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Asset
              </button>
              <button
                onClick={() => setAllocDimension("marketCap")}
                className={cn(
                  "rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-all",
                  allocDimension === "marketCap"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Cap
              </button>
              <button
                onClick={() => setAllocDimension("amc")}
                className={cn(
                  "rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-all",
                  allocDimension === "amc"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                AMCs
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {donutData.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="relative">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                      label={false}
                    >
                      {donutData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} className="drop-shadow-sm" />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-border/60 bg-card/95 px-4 py-3 shadow-glass backdrop-blur-md">
                            <div className="flex items-center gap-2">
                              <span className="h-3 w-3 rounded-sm shadow-sm" style={{ backgroundColor: d.color }} />
                              <span className="text-[12px] font-bold text-foreground">{d.name}</span>
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground">{formatIndianUnits(d.value)} · {d.pct}%</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Total AUM</span>
                  <span className="text-[14px] font-heading font-bold text-foreground">{formatIndianUnits(metrics.practiceAum)}</span>
                </div>
              </div>
              {/* Rich breakdown */}
              <div className="mt-3.5 w-full space-y-2 max-h-[190px] overflow-y-auto pr-0.5">
                {donutData.map((d) => (
                  <div key={d.name} className="rounded-xl bg-muted/25 px-3 py-2 ring-1 ring-border/20 transition-colors hover:bg-muted/40">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-sm shadow-sm shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="flex-1 truncate text-[11px] font-semibold text-foreground">{d.name}</span>
                      <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-foreground ring-1 ring-border/20">{d.pct}%</span>
                      <span className="text-[11px] font-medium tabular-nums text-muted-foreground">{formatIndianUnits(d.value)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(2, d.pct))}%`, backgroundColor: d.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <PieChartIcon className="h-8 w-8 text-muted-foreground/30" />
              <p className="mt-3 text-xs text-muted-foreground">No allocation data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
});

CashflowSection.displayName = "CashflowSection";

