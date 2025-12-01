import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StockDetail } from "@/data/stockData";

interface StockDetailCardProps {
  stock: StockDetail;
}

export const StockDetailCard = ({ stock }: StockDetailCardProps) => {
  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{stock.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{stock.symbol} • {stock.sector}</p>
          </div>
          <Badge 
            variant={stock.dayChange.startsWith("+") ? "default" : "destructive"}
            className="text-xs"
          >
            {stock.dayChange}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-b pb-4">
          <p className="text-xs text-muted-foreground mb-1">Current Price</p>
          <p className="text-3xl font-bold">₹{stock.currentPrice.toLocaleString()}</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Holdings</p>
            <p className="font-bold">{stock.holdings}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Price</p>
            <p className="font-bold">₹{stock.avgPrice}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Invested</p>
            <p className="font-bold">₹{((stock.holdings * stock.avgPrice) / 1000).toFixed(0)}K</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t pt-3">
          <div className="p-3 rounded-lg bg-success/10">
            <p className="text-xs text-muted-foreground">Week High</p>
            <p className="text-sm font-bold text-success">₹{stock.weekHigh}</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10">
            <p className="text-xs text-muted-foreground">Week Low</p>
            <p className="text-sm font-bold text-destructive">₹{stock.weekLow}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockDetailCard;
