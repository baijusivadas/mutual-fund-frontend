import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StockDetail } from "@/data/stockData";

interface StockPnLCardProps {
  stock: StockDetail;
}

export const StockPnLCard = ({ stock }: StockPnLCardProps) => {
  const currentValue = stock.holdings * stock.currentPrice;
  const totalInvestment = stock.holdings * stock.avgPrice;
  const totalPnL = stock.holdings * (stock.currentPrice - stock.avgPrice);
  const returnPercentage = ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>P&L Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Value</span>
            <span className="text-lg font-bold">₹{currentValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Investment</span>
            <span className="text-lg font-semibold">₹{totalInvestment.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="border-t-2 pt-4 space-y-3">
          <div className="p-4 rounded-lg bg-success/10 border-2 border-success/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Total P&L</span>
              <span className="text-2xl font-bold text-success">
                +₹{totalPnL.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Return Percentage</span>
              <Badge variant="default" className="text-sm">
                +{returnPercentage.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockPnLCard;
