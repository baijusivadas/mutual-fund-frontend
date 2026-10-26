import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TotalSummaryCardProps {
  totalGains: number;
  totalTax: number;
  variant?: "shortTerm" | "longTerm";
  gainsLabel?: string;
  taxLabel?: string;
}

export const TotalSummaryCard = memo(({
  totalGains,
  totalTax,
  variant = "shortTerm",
  gainsLabel = "Total Capital Gains",
  taxLabel = "Total Tax Liability",
}: TotalSummaryCardProps) => {
  const isLongTerm = variant === "longTerm";

  return (
    <Card
      className={cn(
        "rounded-2xl border backdrop-blur-xl transition-all duration-300",
        isLongTerm
          ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20"
          : "border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/20"
      )}
    >
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{gainsLabel}</p>
            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹{totalGains.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{taxLabel}</p>
            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-rose-600 dark:text-rose-400">
              ₹{totalTax.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
TotalSummaryCard.displayName = "TotalSummaryCard";

export default TotalSummaryCard;
