import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TradeRecord } from "@/data/capitalGainsData";

interface TradeCardProps {
  trade: TradeRecord;
  taxRate: number;
  variant?: "shortTerm" | "longTerm";
}

export const TradeCard = ({ trade, taxRate, variant = "shortTerm" }: TradeCardProps) => {
  const borderClass = variant === "longTerm" 
    ? "border-2 hover:border-success/50" 
    : "border-2 hover:border-primary/50";

  return (
    <Card className={`${borderClass} transition-all`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold">{trade.stock}</h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <Badge variant={variant === "longTerm" ? "default" : "outline"} className="text-xs">
                {trade.qty} shares
              </Badge>
              <span>{trade.buyDate} → {trade.sellDate}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Capital Gain</p>
            <p className="text-2xl font-bold text-success">+₹{trade.gain.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Buy Price</p>
            <p className="text-sm font-semibold">₹{trade.buyPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sell Price</p>
            <p className="text-sm font-semibold">₹{trade.sellPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Buy</p>
            <p className="text-sm font-semibold">₹{(trade.buyPrice * trade.qty).toLocaleString()}</p>
          </div>
          <div className="bg-destructive/10 p-2 rounded">
            <p className="text-xs text-muted-foreground">Tax ({(taxRate * 100).toFixed(0)}%)</p>
            <p className="text-sm font-bold text-destructive">₹{(trade.gain * taxRate).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradeCard;