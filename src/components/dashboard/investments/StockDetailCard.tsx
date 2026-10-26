import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StockDetail } from "@/data/stockData";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StockDetailCardProps {
  stock: StockDetail;
}

export const StockDetailCard = memo(({ stock }: StockDetailCardProps) => {
  const isPositive = stock.dayChange.startsWith("+");

  return (
    <Card className="rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3 pt-5 px-6">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-foreground">{stock.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-semibold text-foreground/80">{stock.symbol}</span> • {stock.sector}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs font-bold border-none px-2.5 py-0.5 rounded-full flex items-center gap-1",
              isPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {stock.dayChange}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-4">
        <div className="border-b border-border/40 pb-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current Price</p>
          <p className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
            ₹{stock.currentPrice.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Holdings</p>
            <p className="text-base font-bold text-foreground mt-0.5">{stock.holdings}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Avg Price</p>
            <p className="text-base font-bold text-foreground mt-0.5">₹{stock.avgPrice}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Invested</p>
            <p className="text-base font-bold text-foreground mt-0.5">
              ₹{((stock.holdings * stock.avgPrice) / 1000).toFixed(0)}K
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-border/40 pt-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">52-Week High</p>
            <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">₹{stock.weekHigh}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">52-Week Low</p>
            <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">₹{stock.weekLow}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
StockDetailCard.displayName = "StockDetailCard";

export default StockDetailCard;
