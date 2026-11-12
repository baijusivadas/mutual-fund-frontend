import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkline } from "@/components/charts/Sparkline";
import { formatIndianUnits } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { AdvisorMetrics, ClientRow } from "@/types/advisor";
import {
  Briefcase,
  Wallet,
  Repeat2,
  Users,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
} from "lucide-react";

interface AdvisorKpisProps {
  metrics: AdvisorMetrics;
  clientList: ClientRow[];
}

export const AdvisorKpis = memo(({ metrics, clientList }: AdvisorKpisProps) => {
  return (
    <section id="kpis-section" className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card: AUM */}
        <Card className="group relative overflow-hidden rounded-2xl border-border/50 shadow-sm transition-shadow hover:shadow-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[.03] to-transparent" />
          <CardContent className="relative p-0">
            <div className="px-5 pt-5 pb-1">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm dark:bg-blue-500/15 dark:text-blue-400">
                  <Briefcase className="h-5 w-5" />
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm",
                    metrics.totalReturns >= 0
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
                      : "bg-rose-50 text-rose-700 ring-1 ring-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20"
                  )}
                >
                  {metrics.totalReturns >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {metrics.netInvested > 0 ? ((metrics.totalReturns / metrics.netInvested) * 100).toFixed(1) : "0.0"}%
                </span>
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Total Practice AUM</p>
              <p className="mt-1 text-[28px] font-heading font-extrabold tracking-tight text-foreground leading-none">
                {formatIndianUnits(metrics.practiceAum)}
              </p>
            </div>
            <div className="mt-1">
              <Sparkline data={metrics.aumSparkline} color="#3b82f6" height={48} />
            </div>
          </CardContent>
        </Card>

        {/* Card: Net Invested */}
        <Card className="group relative overflow-hidden rounded-2xl border-border/50 shadow-sm transition-shadow hover:shadow-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[.03] to-transparent" />
          <CardContent className="relative p-0">
            <div className="px-5 pt-5 pb-1">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 shadow-sm dark:bg-violet-500/15 dark:text-violet-400">
                  <Wallet className="h-5 w-5" />
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm",
                    metrics.netInvested >= 0
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
                      : "bg-rose-50 text-rose-700 ring-1 ring-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20"
                  )}
                >
                  {metrics.netInvested >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {metrics.netInvested >= 0 ? "Inflow" : "Outflow"}
                </span>
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Net Capital Flow</p>
              <p className="mt-1 text-[28px] font-heading font-extrabold tracking-tight text-foreground leading-none">
                {formatIndianUnits(Math.abs(metrics.netInvested))}
              </p>
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                P&L{" "}
                <span className={cn("font-bold", metrics.totalReturns >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                  {metrics.totalReturns >= 0 ? "+" : ""}{formatIndianUnits(metrics.totalReturns)}
                </span>
              </p>
            </div>
            <div className="mt-1">
              <Sparkline data={metrics.purchaseSparkline} color="#8b5cf6" height={48} />
            </div>
          </CardContent>
        </Card>

        {/* Card: SIP Book */}
        <Card className="group relative overflow-hidden rounded-2xl border-border/50 shadow-sm transition-shadow hover:shadow-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[.03] to-transparent" />
          <CardContent className="relative px-5 py-5">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-400">
                <Repeat2 className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-medium text-muted-foreground">
                {clientList.filter((c) => c.sipCount > 0).length} active clients
              </span>
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">SIP Book Transactions</p>
            <p className="mt-1 text-[28px] font-heading font-extrabold tracking-tight text-foreground leading-none">
              {metrics.totalSipCount.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">Systematic investment plan installments recorded</p>
          </CardContent>
        </Card>

        {/* Card: Client Segments */}
        <Card className="group relative overflow-hidden rounded-2xl border-border/50 shadow-sm transition-shadow hover:shadow-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[.03] to-transparent" />
          <CardContent className="relative px-5 py-5">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm dark:bg-amber-500/15 dark:text-amber-400">
                <Users className="h-5 w-5" />
              </span>
              <p className="text-[28px] font-heading font-extrabold text-foreground leading-none">{clientList.length}</p>
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Client Segments</p>
            <div className="mt-3 space-y-2">
              {([
                { label: "HNI (≥50L)", count: metrics.hniClients, color: "bg-amber-500", track: "bg-amber-100 dark:bg-amber-500/10" },
                { label: "Premium (≥10L)", count: metrics.premiumClients, color: "bg-violet-500", track: "bg-violet-100 dark:bg-violet-500/10" },
                { label: "Regular", count: metrics.regularClients, color: "bg-sky-500", track: "bg-sky-100 dark:bg-sky-500/10" },
              ] as const).map((seg) => (
                <div key={seg.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">{seg.label}</span>
                    <span className="font-bold tabular-nums text-foreground">{seg.count}</span>
                  </div>
                  <div className={cn("h-1.5 w-full overflow-hidden rounded-full", seg.track)}>
                    <div className={cn("h-full rounded-full transition-all", seg.color)} style={{ width: `${clientList.length ? (seg.count / clientList.length) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── THIS MONTH & PRACTICE VELOCITY BAR ────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/50 bg-gradient-to-r from-muted/30 via-background to-muted/30 px-5 py-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <span className="text-xs font-bold text-foreground tracking-tight">📅 This Month</span>
          <div className="h-5 w-px bg-border/50" />
          {([
            { icon: ArrowUpRight, label: "Purchases", value: metrics.monthlyPurchaseTotal, fg: "text-emerald-600 dark:text-emerald-400", iFg: "text-emerald-500" },
            { icon: ArrowDownRight, label: "Redemptions", value: metrics.monthlyRedemptionTotal, fg: "text-rose-600 dark:text-rose-400", iFg: "text-rose-500" },
            { icon: Activity, label: "Net Flow", value: metrics.monthlyPurchaseTotal - metrics.monthlyRedemptionTotal, fg: cn(metrics.monthlyPurchaseTotal - metrics.monthlyRedemptionTotal >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"), iFg: "text-blue-500" },
            { icon: Layers, label: "Schemes", value: metrics.schemeCount, fg: "text-foreground", iFg: "text-violet-500" },
          ] as const).map((item, idx) => (
            <div key={item.label} className="flex items-center gap-1.5">
              {idx > 0 && <div className="mr-2.5 h-5 w-px bg-border/50" />}
              <item.icon className={cn("h-3.5 w-3.5", item.iFg)} />
              <span className="text-muted-foreground">{item.label}:</span>
              <span className={cn("font-bold tabular-nums", item.fg)}>
                {typeof item.value === "number" && item.label !== "Schemes" ? formatIndianUnits(item.value) : item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground border-t sm:border-t-0 sm:border-l border-border/40 pt-2 sm:pt-0 sm:pl-4">
          <span>Top 1 Concentration: <strong className="text-foreground">{metrics.top1Concentration}%</strong></span>
          <span>·</span>
          <span>Avg Ticket: <strong className="text-foreground">{formatIndianUnits(metrics.avgClientAum)}</strong></span>
        </div>
      </div>
    </section>
  );
});

AdvisorKpis.displayName = "AdvisorKpis";

