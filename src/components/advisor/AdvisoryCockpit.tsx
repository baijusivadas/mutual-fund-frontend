import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdvisorySignal } from "@/types/advisor";
import { Sparkles, Eye, CheckCircle2 } from "lucide-react";

interface AdvisoryCockpitProps {
  signals: AdvisorySignal[];
  onSelectClient: (name: string) => void;
}

export const AdvisoryCockpit = memo(({ signals, onSelectClient }: AdvisoryCockpitProps) => {
  return (
    <section id="cockpit-section" className="space-y-3.5 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <h3 className="text-base font-heading font-bold text-foreground flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
            </span>
            Advisory Cockpit · Actionable Triggers
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Institutional alerts across portfolio asset skew, tax harvesting opportunities, and client reviews
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-bold text-amber-700 dark:text-amber-300 border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 self-start sm:self-auto"
        >
          {signals.length} Active Trigger{signals.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {signals.length > 0 ? (
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {signals.map((signal) => (
            <Card
              key={signal.id}
              className="relative overflow-hidden rounded-2xl border-border/60 bg-card shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                    {signal.category}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                      signal.severity === "high"
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                        : signal.severity === "medium"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    )}
                  >
                    {signal.severity === "high"
                      ? "High Priority"
                      : signal.severity === "medium"
                      ? "Action Recommended"
                      : "Optimization"}
                  </span>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-foreground leading-tight">{signal.title}</p>
                  <p className="text-[11px] font-semibold text-primary mt-0.5">{signal.clientName}</p>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-3">
                  {signal.detail}
                </p>
                <div className="pt-2.5 border-t border-border/30 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {signal.metricLabel}: <strong className="text-foreground">{signal.metricValue}</strong>
                  </span>
                  <Button
                    size="sm"
                    onClick={() => onSelectClient(signal.clientName)}
                    className="h-7 px-2.5 text-[11px] font-bold rounded-lg gap-1"
                  >
                    <Eye className="h-3 w-3" /> {signal.actionText}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border-dashed border p-6 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
          <p className="text-xs font-bold mt-2">Practice is Fully Optimized</p>
          <p className="text-[11px] text-muted-foreground">
            All client portfolios are properly allocated within disciplined asset thresholds.
          </p>
        </Card>
      )}
    </section>
  );
});

AdvisoryCockpit.displayName = "AdvisoryCockpit";

