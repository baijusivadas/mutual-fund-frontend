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
      <div className="absolute -bottom-6 -right-6 p-4 opacity-5 transition-opacity group-hover:opacity-10 pointer-events-none z-0">
        <Icon className="h-32 w-32" />
      </div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          {changeType !== "neutral" && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap",
              changeType === "positive" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}>
              {changeType === "positive" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {displaySubtitle}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground mb-1 truncate">
            {displayTitle}
          </p>
          <div 
            className={cn("text-3xl font-bold tracking-tight truncate", className)} 
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
