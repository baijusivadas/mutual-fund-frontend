import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RedeemTransaction } from "@/utils/categorizeTransactions";
import { TrendingDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RedemptionsTableProps {
  redemptions: RedeemTransaction[];
}

export const RedemptionsTable = ({ redemptions }: RedemptionsTableProps) => {
  const [showAll, setShowAll] = useState(false);
  const displayedRedemptions = showAll ? redemptions : redemptions.slice(0, 50);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
          Redemption Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Investor</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Scheme</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Units</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">NAV</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {displayedRedemptions.map((redemption, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="py-3 text-sm text-foreground whitespace-nowrap">
                      {new Date(redemption.investmentDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 text-sm font-medium text-foreground">
                      {redemption.investorName}
                    </td>
                    <td className="py-3 text-sm text-foreground max-w-xs truncate">
                      {redemption.schemeName}
                    </td>
                    <td className="py-3">
                      <Badge 
                        variant={redemption.category === 'switchout' ? 'secondary' : 'destructive'}
                      >
                        {redemption.category}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-sm text-foreground">
                      {Math.abs(redemption.units).toLocaleString('en-IN', { maximumFractionDigits: 4 })}
                    </td>
                    <td className="py-3 text-right text-sm text-muted-foreground">
                      ₹{redemption.nav.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right text-sm font-medium text-red-600 dark:text-red-400">
                      ₹{Math.abs(redemption.value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {redemptions.length > 50 && (
            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Show Less' : `Show All ${redemptions.length} Transactions`}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
