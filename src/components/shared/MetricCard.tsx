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
    <Card className="rounded-3xl bg-card/85 border border-border/60 shadow-xl dark:shadow-black/40 backdrop-blur-2xl hover:border-primary/40 transition-all duration-300 group relative overflow-hidden">
      {/* Top Card Gradient Glow Edge */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Subtle Background Icon Watermark */}
      <div className="absolute -bottom-4 -right-4 p-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] transition-opacity pointer-events-none z-0">
        <Icon className="h-28 w-28 text-foreground" />
      </div>

      <CardContent className="p-6 relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600/15 to-indigo-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
            <Icon className="h-5 w-5" />
          </div>
          {changeType !== "neutral" && (
            <div
              className={cn(
                "flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap tracking-wide",
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
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 truncate">
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
