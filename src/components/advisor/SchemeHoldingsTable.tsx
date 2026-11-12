import { memo, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatIndianUnits } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { SchemePerformance } from "@/types/advisor";
import { ChartNoAxesCombined, Search } from "lucide-react";

interface SchemeHoldingsTableProps {
  funds: SchemePerformance[];
}

export const SchemeHoldingsTable = memo(({ funds }: SchemeHoldingsTableProps) => {
  const [fundSearch, setFundSearch] = useState("");
  const [fundSort, setFundSort] = useState<"value" | "returns" | "clients">("value");

  const fundsList = useMemo(() => {
    let filtered = funds;
    if (fundSearch.trim()) {
      const q = fundSearch.trim().toLowerCase();
      filtered = filtered.filter((f) => f.schemeName.toLowerCase().includes(q) || f.amc.toLowerCase().includes(q));
    }
    return filtered.slice().sort((a, b) => {
      switch (fundSort) {
        case "value":
          return b.totalValue - a.totalValue;
        case "returns":
          return b.returnsPercent - a.returnsPercent;
        case "clients":
          return b.clientCount - a.clientCount;
        default:
          return 0;
      }
    });
  }, [funds, fundSearch, fundSort]);

  const totalVal = useMemo(() => fundsList.reduce((s, f) => s + f.totalValue, 0), [fundsList]);

  const TYPE_BADGE: Record<string, string> = {
    equity: "border-blue-200/50 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-500/10 dark:text-blue-400",
    debt: "border-violet-200/50 bg-violet-50 text-violet-700 dark:border-violet-800/50 dark:bg-violet-500/10 dark:text-violet-400",
    hybrid: "border-emerald-200/50 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-500/10 dark:text-emerald-400",
  };

  return (
    <section id="funds-section" className="pt-2">
      <Card className="overflow-hidden rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2.5 text-[15px] font-bold tracking-tight">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ChartNoAxesCombined className="h-4 w-4" />
                </span>
                Fund-wise Analysis
              </CardTitle>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {fundsList.length} active scheme{fundsList.length !== 1 ? "s" : ""} · Total: {formatIndianUnits(totalVal)}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-0.5 rounded-xl border border-border/50 bg-muted/25 p-0.5">
                {(["value", "returns", "clients"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFundSort(s)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-[10px] font-semibold capitalize transition-all",
                      fundSort === s
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border/30"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="relative w-52">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search scheme..."
                  value={fundSearch}
                  onChange={(e) => setFundSearch(e.target.value)}
                  className="h-8 rounded-xl pl-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[12px]">
              <thead className="border-t border-b border-border/40 bg-muted/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Scheme</th>
                  <th className="px-3 py-3 text-center">Type</th>
                  <th className="px-3 py-3 text-right">Current Value</th>
                  <th className="px-3 py-3 text-right">Invested</th>
                  <th className="px-3 py-3 text-right">Returns %</th>
                  <th className="px-3 py-3 text-center">Clients</th>
                  <th className="px-5 py-3 text-right">% of AUM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {fundsList.length > 0 ? (
                  fundsList.map((f) => (
                    <tr key={f.schemeName} className="transition-colors hover:bg-muted/15">
                      <td className="max-w-[340px] px-5 py-3">
                        <p className="truncate text-[12px] font-semibold text-foreground">{f.schemeName}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground flex items-center gap-1.5">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                          {f.amc}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={cn("inline-block rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase", TYPE_BADGE[f.type] || "")}>
                          {f.type}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-bold tabular-nums">{formatIndianUnits(f.totalValue)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{formatIndianUnits(f.totalInvested)}</td>
                      <td
                        className={cn(
                          "px-3 py-3 text-right font-bold tabular-nums",
                          f.returnsPercent >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {f.returnsPercent >= 0 ? "+" : ""}
                        {f.returnsPercent.toFixed(2)}%
                      </td>
                      <td className="px-3 py-3 text-center tabular-nums">{f.clientCount}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                        {totalVal > 0 ? ((f.totalValue / totalVal) * 100).toFixed(1) : "0.0"}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-sm text-muted-foreground">
                      No schemes match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
});

SchemeHoldingsTable.displayName = "SchemeHoldingsTable";

