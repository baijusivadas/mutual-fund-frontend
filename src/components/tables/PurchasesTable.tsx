import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PurchaseTransaction } from "@/utils/categorizeTransactions";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PurchasesTableProps {
  purchases: PurchaseTransaction[];
}

export const PurchasesTable = ({ purchases }: PurchasesTableProps) => {
  const [showAll, setShowAll] = useState(false);
  const displayedPurchases = showAll ? purchases : purchases.slice(0, 50);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          Purchase Transactions
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
                {displayedPurchases.map((purchase, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="py-3 text-sm text-foreground whitespace-nowrap">
                      {new Date(purchase.investmentDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 text-sm font-medium text-foreground">
                      {purchase.investorName}
                    </td>
                    <td className="py-3 text-sm text-foreground max-w-xs truncate">
                      {purchase.schemeName}
                    </td>
                    <td className="py-3">
                      <Badge 
                        variant={purchase.category === 'systematic' ? 'default' : 'secondary'}
                      >
                        {purchase.category}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-sm text-foreground">
                      {purchase.units.toLocaleString('en-IN', { maximumFractionDigits: 4 })}
                    </td>
                    <td className="py-3 text-right text-sm text-muted-foreground">
                      ₹{purchase.nav.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right text-sm font-medium text-green-600 dark:text-green-400">
                      ₹{purchase.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {purchases.length > 50 && (
            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Show Less' : `Show All ${purchases.length} Transactions`}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
