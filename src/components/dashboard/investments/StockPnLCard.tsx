import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StockDetail } from "@/data/stockData";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StockPnLCardProps {
  stock: StockDetail;
}

export const StockPnLCard = memo(({ stock }: StockPnLCardProps) => {
  const currentValue = stock.holdings * stock.currentPrice;
  const totalInvestment = stock.holdings * stock.avgPrice;
  const totalPnL = stock.holdings * (stock.currentPrice - stock.avgPrice);
  const returnPercentage = totalInvestment > 0 ? ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100 : 0;
  const isPositive = totalPnL >= 0;

  return (
    <Card className="rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3 pt-5 px-6">
        <CardTitle className="text-lg font-bold text-foreground">Position P&L Summary</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center py-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Market Value</span>
            <span className="text-base font-heading font-extrabold text-foreground">₹{currentValue.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Investment</span>
            <span className="text-base font-semibold text-muted-foreground">₹{totalInvestment.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="border-t border-border/40 pt-4">
          <div
            className={cn(
              "p-4 rounded-xl border flex flex-col gap-2",
              isPositive
                ? "bg-emerald-500/10 border-emerald-500/25"
                : "bg-rose-500/10 border-rose-500/25"
            )}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unrealized P&L</span>
              <span
                className={cn(
                  "text-2xl font-heading font-extrabold flex items-center gap-1",
                  isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
              >
                {isPositive ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                {isPositive ? "+" : ""}₹{totalPnL.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-border/20 pt-2 mt-1">
              <span className="text-xs text-muted-foreground">Return Rate</span>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-bold border-none px-2 py-0.5 rounded-full",
                  isPositive
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                )}
              >
                {isPositive ? "+" : ""}
                {returnPercentage.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
StockPnLCard.displayName = "StockPnLCard";

export default StockPnLCard;
