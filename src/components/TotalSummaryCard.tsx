import { Card, CardContent } from "@/components/ui/card";

interface TotalSummaryCardProps {
  totalGains: number;
  totalTax: number;
  variant?: "shortTerm" | "longTerm";
  gainsLabel?: string;
  taxLabel?: string;
}

export const TotalSummaryCard = ({ 
  totalGains, 
  totalTax, 
  variant = "shortTerm",
  gainsLabel = "Total Capital Gains",
  taxLabel = "Total Tax Liability"
}: TotalSummaryCardProps) => {
  const borderClass = variant === "longTerm" 
    ? "border-2 border-success/30 bg-success/5" 
    : "border-2 border-primary/30 bg-primary/5";

  return (
    <Card className={borderClass}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{gainsLabel}</p>
            <p className="text-3xl font-bold text-success">₹{totalGains.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">{taxLabel}</p>
            <p className="text-3xl font-bold text-destructive">₹{totalTax.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalSummaryCard;
