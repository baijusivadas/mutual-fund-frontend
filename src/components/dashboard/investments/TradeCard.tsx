import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TradeRecord } from "@/data/capitalGainsData";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface TradeCardProps {
  trade: TradeRecord;
  taxRate: number;
  variant?: "shortTerm" | "longTerm";
}

export const TradeCard = memo(({ trade, taxRate, variant = "shortTerm" }: TradeCardProps) => {
  const isLongTerm = variant === "longTerm";

  return (
    <Card className="rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl hover:border-primary/40 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                {trade.stock}
              </h3>
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border-none",
                  isLongTerm
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                )}
              >
                {isLongTerm ? "LTCG" : "STCG"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{trade.qty} shares</span>
              <span>•</span>
              <span>{trade.buyDate} → {trade.sellDate}</span>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Capital Gain</p>
            <p className="text-xl sm:text-2xl font-heading font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center sm:justify-end gap-1 mt-0.5">
              <ArrowUpRight className="h-4 w-4" />
              +₹{trade.gain.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-border/40 pt-4">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Buy Price</p>
            <p className="text-sm font-bold text-foreground mt-0.5">₹{trade.buyPrice.toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Sell Price</p>
            <p className="text-sm font-bold text-foreground mt-0.5">₹{trade.sellPrice.toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Invested</p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              ₹{(trade.buyPrice * trade.qty).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Tax ({(taxRate * 100).toFixed(0)}%)
            </p>
            <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
              ₹{(trade.gain * taxRate).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
TradeCard.displayName = "TradeCard";

export default TradeCard;
