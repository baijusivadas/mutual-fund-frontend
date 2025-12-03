import { memo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ChartCardProps {
  title: string;
  icon?: LucideIcon;
  iconClassName?: string;
  children: ReactNode;
}

export const chartTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

export const ChartCard = memo(({ title, icon: Icon, iconClassName, children }: ChartCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {Icon && <Icon className={`h-5 w-5 ${iconClassName || ''}`} />}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
));

ChartCard.displayName = "ChartCard";