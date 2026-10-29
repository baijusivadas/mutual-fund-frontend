import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title?: string;
  label?: string;
  value: string | number;
  change?: string;
  subtitle?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  className?: string;
}

const MetricCardComponent = ({
  title,
  label,
  value,
  change,
  subtitle,
  changeType = "neutral",
  icon: Icon,
  className,
}: MetricCardProps) => {
  const displayTitle = title || label;
  const displaySubtitle = change || subtitle;

  return (
    <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 group relative overflow-hidden">
      {/* Subtle watermark icon */}
      <div className="absolute -bottom-2 -right-2 p-2 opacity-[0.04] dark:opacity-[0.06] pointer-events-none z-0">
        <Icon className="h-20 w-20 text-foreground" />
      </div>

      <CardContent className="p-4 sm:p-5 relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          {changeType !== "neutral" && (
            <div
              className={cn(
                "flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
                changeType === "positive"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                  : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
              )}
            >
              {changeType === "positive" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {displaySubtitle}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 truncate">
            {displayTitle}
          </p>
          <div
            className={cn(
              "text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-foreground truncate",
              className
            )}
            title={value?.toString()}
          >
            {value}
          </div>
          {changeType === "neutral" && displaySubtitle && (
            <p className="text-xs text-muted-foreground mt-1.5 font-medium truncate">
              {displaySubtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const MetricCard = memo(MetricCardComponent);
MetricCard.displayName = "MetricCard";
