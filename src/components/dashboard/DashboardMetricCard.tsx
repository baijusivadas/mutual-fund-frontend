import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DashboardMetricTone = "blue" | "green" | "amber" | "rose";

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  tone?: DashboardMetricTone;
  sparkData?: number[];
}

const toneStyles: Record<DashboardMetricTone, { card: string; icon: string; line: string }> = {
  blue: {
    card: "border-blue-500/15 bg-gradient-to-br from-blue-500/[0.08] to-card",
    icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    line: "#2563eb",
  },
  green: {
    card: "border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.08] to-card",
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    line: "#10b981",
  },
  amber: {
    card: "border-amber-500/15 bg-gradient-to-br from-amber-500/[0.08] to-card",
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    line: "#f59e0b",
  },
  rose: {
    card: "border-rose-500/15 bg-gradient-to-br from-rose-500/[0.08] to-card",
    icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    line: "#f43f5e",
  },
};

export function DashboardSparkline({
  values,
  color,
  className,
}: {
  values: number[];
  color: string;
  className?: string;
}) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const y = 34 - ((value - min) / range) * 30;
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(" L ")}`;
  const areaPath = `${linePath} L 100,40 L 0,40 Z`;

  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("h-10 w-full", className)}
    >
      <path d={areaPath} fill={color} fillOpacity="0.1" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function DashboardMetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  tone = "blue",
  sparkData,
}: DashboardMetricCardProps) {
  const styles = toneStyles[tone];

  return (
    <Card className={cn(
      "relative overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-sm",
      styles.card
    )}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", styles.icon)}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="truncate text-xs font-semibold text-muted-foreground">{title}</p>
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <p className="truncate text-2xl font-heading font-extrabold tracking-tight text-foreground">
                {value}
              </p>
              {sparkData && sparkData.length > 1 && (
                <DashboardSparkline values={sparkData} color={styles.line} className="max-w-[86px] shrink-0" />
              )}
            </div>
          </div>
        </div>
        {change && (
          <p
            className={cn(
              "mt-2 text-[11px] font-medium",
              changeType === "positive" && "text-emerald-600 dark:text-emerald-400",
              changeType === "negative" && "text-rose-600 dark:text-rose-400",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
