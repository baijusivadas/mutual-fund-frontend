import { memo, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatIndianUnits, formatRelativeDate } from "@/utils/format";
import { TIER_STYLE } from "@/utils/schemeUtils";
import { cn } from "@/lib/utils";
import type { ClientRow } from "@/types/advisor";
import {
  Users,
  Search,
  Eye,
  ChevronRight,
  Copy,
  Check,
  SortAsc,
  SortDesc,
} from "lucide-react";

interface ClientBookTableProps {
  clientList: ClientRow[];
  onSelectClient: (name: string) => void;
}

export const ClientBookTable = memo(({ clientList, onSelectClient }: ClientBookTableProps) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"currentValue" | "returns" | "name" | "latestActivity">("currentValue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [tierFilter, setTierFilter] = useState<"all" | "HNI" | "Premium" | "Regular" | "Dormant">("all");
  const [copiedClientId, setCopiedClientId] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const handleCopyClientBrief = useCallback((c: ClientRow) => {
    const brief = `📋 Client Summary: ${c.name}
• Practice Status: ${c.isDormant ? "Dormant (>6mo)" : "Active"}
• Tier: ${c.tier} | Risk Profile: ${c.riskProfile.label} (${c.equityPct}% Equity)
• Current Portfolio: ${formatIndianUnits(c.currentValue)} (Invested: ${formatIndianUnits(c.netInvested)})
• Total Gain/Loss: ${c.returns >= 0 ? "+" : ""}${formatIndianUnits(c.returns)} (${c.returnsPercent?.toFixed(1) || 0}%)
• Holdings: ${c.schemesCount} schemes | Systematic Plans: ${c.sipCount} active SIPs
• Last Activity: ${formatRelativeDate(c.latestActivity)}`;

    navigator.clipboard.writeText(brief);
    setCopiedClientId(c.id);
    toast({
      title: "Client briefing copied",
      description: `Summary for ${c.name} copied to clipboard for WhatsApp/Email review.`,
    });
    setTimeout(() => setCopiedClientId(null), 2000);
  }, [toast]);

  const filteredClients = useMemo(() => {
    let list = clientList;
    if (tierFilter === "Dormant") list = list.filter((c) => c.isDormant);
    else if (tierFilter !== "all") list = list.filter((c) => c.tier === tierFilter);
    if (search.trim()) list = list.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()));
    return list.slice().sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "currentValue":
          cmp = a.currentValue - b.currentValue;
          break;
        case "returns":
          cmp = (a.returnsPercent ?? -Infinity) - (b.returnsPercent ?? -Infinity);
          break;
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "latestActivity":
          cmp = (a.latestActivity ? new Date(a.latestActivity).getTime() : 0) - (b.latestActivity ? new Date(b.latestActivity).getTime() : 0);
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [clientList, tierFilter, search, sortKey, sortDir]);

  return (
    <section id="clients-section" className="pt-2">
      <Card className="overflow-hidden rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2.5 text-[15px] font-bold tracking-tight">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-4 w-4" />
                </span>
                Client Book Directory
              </CardTitle>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {filteredClients.length} of {clientList.length} clients
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-0.5 rounded-xl border border-border/50 bg-muted/25 p-0.5">
                {(["all", "HNI", "Premium", "Regular", "Dormant"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTierFilter(t)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-[10px] font-semibold transition-all cursor-pointer",
                      tierFilter === t
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border/30"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t === "all" ? "All" : t}
                  </button>
                ))}
              </div>
              <div className="relative w-52">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 rounded-xl pl-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-[12px]">
              <thead className="border-t border-b border-border/40 bg-muted/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-3 py-3 text-center">Tier</th>
                  <th className="px-3 py-3 text-center">Risk Profile</th>
                  <th className="cursor-pointer px-3 py-3 text-right" onClick={() => toggleSort("currentValue")}>
                    <span className="inline-flex items-center gap-1">
                      Current Value{" "}
                      {sortKey === "currentValue" && (sortDir === "desc" ? <SortDesc className="h-3 w-3" /> : <SortAsc className="h-3 w-3" />)}
                    </span>
                  </th>
                  <th className="px-3 py-3 text-right">Net Invested</th>
                  <th className="cursor-pointer px-3 py-3 text-right" onClick={() => toggleSort("returns")}>
                    <span className="inline-flex items-center gap-1">
                      Returns{" "}
                      {sortKey === "returns" && (sortDir === "desc" ? <SortDesc className="h-3 w-3" /> : <SortAsc className="h-3 w-3" />)}
                    </span>
                  </th>
                  <th className="px-3 py-3 text-center">Schemes</th>
                  <th className="px-3 py-3 text-center">Allocation</th>
                  <th className="cursor-pointer px-4 py-3 text-right" onClick={() => toggleSort("latestActivity")}>
                    <span className="inline-flex items-center gap-1">
                      Last Active{" "}
                      {sortKey === "latestActivity" && (sortDir === "desc" ? <SortDesc className="h-3 w-3" /> : <SortAsc className="h-3 w-3" />)}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredClients.length > 0 ? (
                  filteredClients.map((c) => {
                    const ts = TIER_STYLE[c.tier];
                    const TIcon = ts.icon;
                    return (
                      <tr key={c.id} className="transition-colors hover:bg-muted/15">
                        <td className="px-5 py-3">
                          <button onClick={() => onSelectClient(c.name)} className="group flex items-center gap-3 text-left cursor-pointer">
                            <div className="relative">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-[11px] font-bold text-primary shadow-sm">
                                {c.name.slice(0, 2).toUpperCase()}
                              </span>
                              <span
                                className={cn(
                                  "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background",
                                  c.isDormant ? "bg-amber-400" : "bg-emerald-500"
                                )}
                                title={c.isDormant ? "Dormant (>6mo)" : "Active"}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[12px] font-semibold text-foreground group-hover:text-primary transition-colors">{c.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {c.transactionCount} txns{c.sipCount > 0 ? ` · ${c.sipCount} SIPs` : ""}
                              </p>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
                          </button>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-bold", ts.bg, ts.fg)}>
                            <TIcon className="h-3 w-3" />
                            {ts.label}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={cn("inline-block rounded-md border px-2 py-0.5 text-[9px] font-bold", c.riskProfile.color)} title={c.riskProfile.desc}>
                            {c.riskProfile.label}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right text-[12px] font-bold tabular-nums">{formatIndianUnits(c.currentValue)}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{formatIndianUnits(c.netInvested)}</td>
                        <td
                          className={cn(
                            "px-3 py-3 text-right font-semibold tabular-nums",
                            c.returnsPercent === null
                              ? "text-muted-foreground"
                              : c.returns >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {c.returnsPercent !== null ? (
                            <>
                              {formatIndianUnits(c.returns)} <span className="ml-0.5 text-[10px]">({c.returnsPercent.toFixed(1)}%)</span>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-3 py-3 text-center tabular-nums">{c.schemesCount}</td>
                        <td className="px-3 py-3">
                          <div className="mx-auto flex h-2.5 w-24 overflow-hidden rounded-full bg-muted/40">
                            {c.equityPct > 0 && (
                              <div className="bg-blue-500 transition-all" style={{ width: `${c.equityPct}%` }} title={`Equity ${c.equityPct}%`} />
                            )}
                            {c.debtPct > 0 && (
                              <div className="bg-violet-500 transition-all" style={{ width: `${c.debtPct}%` }} title={`Debt ${c.debtPct}%`} />
                            )}
                            {c.hybridPct > 0 && (
                              <div className="bg-emerald-500 transition-all" style={{ width: `${c.hybridPct}%` }} title={`Hybrid ${c.hybridPct}%`} />
                            )}
                          </div>
                          <p className="mt-1 text-center text-[9px] tabular-nums text-muted-foreground">
                            <span className="text-blue-500">E:{c.equityPct}%</span>
                            {" · "}
                            <span className="text-violet-500">D:{c.debtPct}%</span>
                            {" · "}
                            <span className="text-emerald-500">H:{c.hybridPct}%</span>
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right text-[11px] text-muted-foreground">{formatRelativeDate(c.latestActivity)}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onSelectClient(c.name)}
                              className="h-7 px-2.5 text-[11px] font-semibold text-primary hover:text-primary hover:bg-primary/10 border-primary/30 rounded-lg gap-1 transition-all"
                            >
                              <Eye className="h-3 w-3" /> Inspect
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Copy Client Portfolio Briefing"
                              onClick={() => handleCopyClientBrief(c)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                            >
                              {copiedClientId === c.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="px-5 py-16 text-center text-sm text-muted-foreground">
                      {clientList.length ? "No clients match your search or filter." : "No named clients found in imported transactions."}
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

ClientBookTable.displayName = "ClientBookTable";

