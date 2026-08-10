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
    <Card className="glass-card hover-lift overflow-hidden border border-border/50 rounded-2xl group relative">
      {/* Background Icon Watermark */}
      <div className="absolute -bottom-4 -right-4 p-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity pointer-events-none z-0">
        <Icon className="h-28 w-28 text-foreground" />
      </div>

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0 transition-transform group-hover:scale-110">
            <Icon className="h-5 w-5" />
          </div>
          {changeType !== "neutral" && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap tracking-wide",
                changeType === "positive"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              )}
            >
              {changeType === "positive" ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {displaySubtitle}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 truncate">
            {displayTitle}
          </p>
          <div
            className={cn("text-2xl sm:text-3xl font-heading font-extrabold tracking-tight truncate", className)}
            title={value?.toString()}
          >
            {value}
          </div>
          {changeType === "neutral" && displaySubtitle && (
            <p className="text-xs text-muted-foreground mt-2 font-medium truncate">
              {displaySubtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const MetricCard = memo(MetricCardComponent);
