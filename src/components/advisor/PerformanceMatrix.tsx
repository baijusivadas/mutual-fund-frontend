import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIndianUnits } from "@/utils/format";
import { isSellTransaction, type TransactionData } from "@/utils/parseTransactions";
import { cn } from "@/lib/utils";
import type { SchemePerformance } from "@/types/advisor";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface RecentTxItem extends TransactionData {
  clientName: string;
}

interface PerformanceMatrixProps {
  topFunds: SchemePerformance[];
  bottomFunds: SchemePerformance[];
  recentTxs: RecentTxItem[];
}

export const PerformanceMatrix = memo(({ topFunds, bottomFunds, recentTxs }: PerformanceMatrixProps) => {
  const navigate = useNavigate();

  return (
    <section id="performers-section" className="grid gap-4 xl:grid-cols-12 pt-2">
      {/* Top Performers */}
      <Card className="rounded-2xl border-border/50 shadow-sm xl:col-span-4">
        <CardHeader className="flex-row items-center justify-between px-5 py-4">
          <CardTitle className="flex items-center gap-2.5 text-[15px] font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </span>
            Top Practice Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/30 px-0 pb-2 pt-0">
          {topFunds.length > 0 ? (
            topFunds.map((fund, i) => (
              <div key={fund.schemeName} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/20">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[11px] font-extrabold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  #{i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-foreground">{fund.schemeName}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {fund.clientCount} client{fund.clientCount !== 1 ? "s" : ""} · {formatIndianUnits(fund.totalValue)}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold tabular-nums text-emerald-700 ring-1 ring-emerald-200/40 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                  +{fund.returnsPercent.toFixed(1)}%
                </span>
              </div>
            ))
          ) : (
            <p className="px-5 py-10 text-center text-xs text-muted-foreground">No performance data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Needs Attention */}
      <Card className="rounded-2xl border-border/50 shadow-sm xl:col-span-4">
        <CardHeader className="px-5 py-4">
          <CardTitle className="flex items-center gap-2.5 text-[15px] font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              <TrendingDown className="h-4 w-4" />
            </span>
            Schemes for Review
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/30 px-0 pb-2 pt-0">
          {bottomFunds.length > 0 ? (
            bottomFunds.map((fund) => (
              <div key={fund.schemeName} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/20">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-foreground">{fund.schemeName}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {fund.clientCount} client{fund.clientCount !== 1 ? "s" : ""} · {formatIndianUnits(fund.totalValue)}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold tabular-nums text-rose-700 ring-1 ring-rose-200/40 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20">
                  {fund.returnsPercent.toFixed(1)}%
                </span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </span>
              <p className="text-[12px] font-medium text-muted-foreground">All practice funds are performing well!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="rounded-2xl border-border/50 shadow-sm xl:col-span-4">
        <CardHeader className="flex-row items-center justify-between px-5 py-4">
          <CardTitle className="flex items-center gap-2.5 text-[15px] font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Zap className="h-4 w-4" />
            </span>
            Live Trade & SIP Stream
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/transactions")}
            className="h-auto gap-1 p-0 text-[10px] font-semibold text-primary hover:bg-transparent"
          >
            View all <ArrowUpRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="divide-y divide-border/30 px-0 pb-2 pt-0">
          {recentTxs.length > 0 ? (
            recentTxs.slice(0, 5).map((tx, idx) => {
              const sell = isSellTransaction(tx);
              return (
                <div key={`${tx.clientName}-${idx}`} className="flex items-start gap-3 px-5 py-2.5 transition-colors hover:bg-muted/20">
                  <span
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      sell ? "bg-rose-50 text-rose-500 dark:bg-rose-500/10" : "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10"
                    )}
                  >
                    {sell ? <ArrowDownRight className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-[12px] font-semibold text-foreground">{tx.clientName || "Unknown"}</p>
                      <p className={cn("shrink-0 text-[12px] font-bold tabular-nums", sell ? "text-rose-600 dark:text-rose-400" : "text-foreground")}>
                        {sell ? "−" : "+"}{formatIndianUnits(tx.value)}
                      </p>
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{tx.schemeName || tx.transactionType}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="px-5 py-10 text-center text-xs text-muted-foreground">No recent transactions</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
});

PerformanceMatrix.displayName = "PerformanceMatrix";

