import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface OptimizedMetricCardProps {
  label: string;
  value: string | number;
  className?: string;
  subtitle?: string;
}

const OptimizedMetricCardComponent = ({ 
  label, 
  value, 
  className = "",
  subtitle 
}: OptimizedMetricCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${className}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const OptimizedMetricCard = memo(OptimizedMetricCardComponent);
