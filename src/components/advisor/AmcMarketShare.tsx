import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatIndianUnits } from "@/utils/format";
import type { AmcShare, CapShare } from "@/types/advisor";
import { Building2, PieChart as PieChartIcon } from "lucide-react";

interface AmcMarketShareProps {
  amcBreakdown: AmcShare[];
  marketCapBreakdown: CapShare[];
}

export const AmcMarketShare = memo(({ amcBreakdown, marketCapBreakdown }: AmcMarketShareProps) => {
  return (
    <section id="amc-section" className="grid gap-4 xl:grid-cols-12 pt-2">
      {/* AMC Market Share */}
      <Card className="rounded-2xl border-border/50 shadow-sm xl:col-span-6">
        <CardHeader className="flex-row items-center justify-between px-5 py-4">
          <div>
            <CardTitle className="flex items-center gap-2.5 text-[15px] font-bold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Building2 className="h-4 w-4" />
              </span>
              AMC Practice Market Share
            </CardTitle>
            <p className="mt-1 text-[11px] text-muted-foreground">Exposure across mutual fund houses</p>
          </div>
          <Badge variant="secondary" className="rounded-lg text-[10px] font-semibold">
            {amcBreakdown.length} Fund Houses
          </Badge>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          <div className="space-y-3">
            {amcBreakdown.slice(0, 6).map((amc) => (
              <div key={amc.amc} className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: amc.color }} />
                    <span className="truncate font-semibold text-foreground">{amc.amc}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      ({amc.clientCount} clients · {amc.schemeCount} schemes)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold tabular-nums text-foreground">{formatIndianUnits(amc.totalValue)}</span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                      {amc.pct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${amc.pct}%`, backgroundColor: amc.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Cap & Strategy Mix */}
      <Card className="rounded-2xl border-border/50 shadow-sm xl:col-span-6">
        <CardHeader className="flex-row items-center justify-between px-5 py-4">
          <div>
            <CardTitle className="flex items-center gap-2.5 text-[15px] font-bold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <PieChartIcon className="h-4 w-4" />
              </span>
              Market-Cap & Category Mix
            </CardTitle>
            <p className="mt-1 text-[11px] text-muted-foreground">Portfolio capitalization & strategy diversification</p>
          </div>
          <Badge variant="secondary" className="rounded-lg text-[10px] font-semibold">
            Diversification
          </Badge>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          <div className="space-y-3">
            {marketCapBreakdown.map((cap) => (
              <div key={cap.category} className="rounded-xl border border-border/30 bg-muted/20 p-3">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: cap.color }} />
                    <span className="font-semibold text-foreground">{cap.category}</span>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">· {cap.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold tabular-nums text-foreground">{formatIndianUnits(cap.totalValue)}</span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                      {cap.pct}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cap.pct}%`, backgroundColor: cap.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
});

AmcMarketShare.displayName = "AmcMarketShare";

