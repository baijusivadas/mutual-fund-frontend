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
    <Card className="glass-card hover-lift overflow-hidden border-none group relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
        <Icon className="h-24 w-24 -mr-8 -mt-8" />
      </div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          {changeType !== "neutral" && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
              changeType === "positive" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}>
              {changeType === "positive" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {displaySubtitle}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {displayTitle}
          </p>
          <div className={cn("text-3xl font-bold tracking-tight", className)}>
            {value}
          </div>
          {changeType === "neutral" && displaySubtitle && (
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {displaySubtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const MetricCard = memo(MetricCardComponent);
